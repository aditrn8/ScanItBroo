import https from "node:https";
import { BitunixTickerRaw, KlineRaw, BitunixFundingRateRaw } from "@/types/crypto";

const BITUNIX_HOST = "fapi.bitunix.com";
// Known clean Cloudflare IPs for Bitunix in case of DNS poisoning (Internet Positif)
const CLOUDFLARE_IPS = ["104.18.0.177", "104.18.1.177"];

/**
 * Robust fetcher that bypasses local ISP DNS poisoning by using SNI over verified Cloudflare edge IPs
 */
export async function bitunixRequest<T>(path: string): Promise<T> {
  const tryFetch = (targetHost: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: targetHost,
        port: 443,
        path: path,
        method: "GET",
        headers: {
          Host: BITUNIX_HOST,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        // Ensure TLS SNI is correctly set to fapi.bitunix.com even when connecting to IP directly
        servername: BITUNIX_HOST,
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed);
            } catch (err) {
              reject(new Error(`Failed to parse JSON: ${err}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 100)}`));
          }
        });
      });

      req.on("error", (e) => reject(e));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out"));
      });
      req.end();
    });
  };

  // Try direct host first, if ISP blocks or TLS error occurs, use Cloudflare direct IPs
  try {
    return await tryFetch(BITUNIX_HOST);
  } catch (err: any) {
    // If blocked or SSL/DNS error, fallback immediately to Cloudflare IP
    for (const cfIp of CLOUDFLARE_IPS) {
      try {
        return await tryFetch(cfIp);
      } catch (innerErr) {
        // try next IP
      }
    }
    throw err;
  }
}

/**
 * Fetch all available Futures tickers
 */
export async function getFuturesTickers(): Promise<BitunixTickerRaw[]> {
  const res = await bitunixRequest<{ code: number; data: BitunixTickerRaw[] }>(
    "/api/v1/futures/market/tickers"
  );
  if (res && res.code === 0 && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}


/**
 * Fetch historical Kline data for symbol and interval (1h, 4h, 1d)
 */
export async function getFuturesKline(
  symbol: string,
  interval: "1h" | "4h" | "1d",
  limit: number = 40
): Promise<KlineRaw[]> {
  const path = `/api/v1/futures/market/kline?symbol=${encodeURIComponent(
    symbol
  )}&interval=${interval}&limit=${limit}`;

  const res = await bitunixRequest<{ code: number; data: KlineRaw[] }>(path);
  if (res && res.code === 0 && Array.isArray(res.data)) {
    // Bitunix returns data newest first. Reverse to make it oldest-to-newest for chronological EMA
    return [...res.data].reverse();
  }
  return [];
}

/**
 * Fetch live Funding Rate for a specific futures symbol
 */
export async function getFundingRate(
  symbol: string
): Promise<BitunixFundingRateRaw | null> {
  const path = `/api/v1/futures/market/funding_rate?symbol=${encodeURIComponent(symbol)}`;
  const res = await bitunixRequest<{ code: number; data: BitunixFundingRateRaw }>(path);
  if (res && res.code === 0 && res.data) {
    return res.data;
  }
  return null;
}

