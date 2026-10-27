import { getFuturesTickers, getFuturesKline } from "./bitunix";
import { calculateEMA, evaluateEMACondition } from "./indicators";
import { ScannedCoin, BitunixTickerRaw } from "@/types/crypto";

// In-Memory Global Cache for Next.js server instance
interface ScannerCache {
  data: ScannedCoin[];
  isScanning: boolean;
  lastUpdated: number;
  totalPairs: number;
  scannedCount: number;
  confluenceCount: number;
  scanDurationMs: number;
  error?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __scannerCache: ScannerCache | undefined;
}

if (!global.__scannerCache) {
  global.__scannerCache = {
    data: [],
    isScanning: false,
    lastUpdated: 0,
    totalPairs: 0,
    scannedCount: 0,
    confluenceCount: 0,
    scanDurationMs: 0,
  };
}

export function getScanCache(): ScannerCache {
  return global.__scannerCache!;
}

// Utility for pacing calls to respect Bitunix 10 req/s limit
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Scan a single coin across 1H, 4H, and 1D timeframes in parallel
 */
async function scanSingleCoin(ticker: BitunixTickerRaw): Promise<ScannedCoin | null> {
  const symbol = ticker.symbol;
  const currentPrice = parseFloat(ticker.lastPrice);
  const change24h = parseFloat(ticker.priceChangePercent || ticker.change24h || "0");
  const volume24h = parseFloat(ticker.quoteVol || "0");

  if (!currentPrice || isNaN(currentPrice)) {
    return null;
  }

  try {
    // Fetch 1h, 4h, 1d in parallel for this coin
    const [kline1h, kline4h, kline1d] = await Promise.all([
      getFuturesKline(symbol, "1h", 45),
      getFuturesKline(symbol, "4h", 45),
      getFuturesKline(symbol, "1d", 45),
    ]);

    const closes1h = kline1h.map((c) => parseFloat(c.close)).filter((n) => !isNaN(n));
    const closes4h = kline4h.map((c) => parseFloat(c.close)).filter((n) => !isNaN(n));
    const closes1d = kline1d.map((c) => parseFloat(c.close)).filter((n) => !isNaN(n));

    const ema1h = calculateEMA(closes1h, 21);
    const ema4h = calculateEMA(closes4h, 21);
    const ema1d = calculateEMA(closes1d, 21);

    // If data is insufficient for EMA 21, skip
    if (!ema1h || !ema4h || !ema1d) {
      return null;
    }

    const cond1h = evaluateEMACondition(currentPrice, ema1h);
    const cond4h = evaluateEMACondition(currentPrice, ema4h);
    const cond1d = evaluateEMACondition(currentPrice, ema1d);

    const isConfluence = cond1h.isAbove && cond4h.isAbove && cond1d.isAbove;

    const baseAsset = symbol.replace(/USDT$/, "");

    return {
      symbol,
      baseAsset,
      quoteAsset: "USDT",
      currentPrice,
      change24h: Number(change24h.toFixed(2)),
      volume24h: Math.round(volume24h),
      tf1h: {
        ema21: Number(ema1h.toFixed(4)),
        diffPercent: cond1h.diffPercent,
        isAbove: cond1h.isAbove,
        candlesCount: closes1h.length,
      },
      tf4h: {
        ema21: Number(ema4h.toFixed(4)),
        diffPercent: cond4h.diffPercent,
        isAbove: cond4h.isAbove,
        candlesCount: closes4h.length,
      },
      tf1d: {
        ema21: Number(ema1d.toFixed(4)),
        diffPercent: cond1d.diffPercent,
        isAbove: cond1d.isAbove,
        candlesCount: closes1d.length,
      },
      isConfluence,
      scannedAt: Date.now(),
    };
  } catch (err) {
    // If rate limit or network glitch on single coin, return null safely
    return null;
  }
}

/**
 * Run complete scan of all USDT futures pairs with live progressive cache streaming
 */
export async function triggerFullScan(): Promise<void> {
  const cache = getScanCache();
  if (cache.isScanning) {
    return; // Already in progress
  }

  cache.isScanning = true;
  cache.error = undefined;
  // Reset cache data so newly found coins stream in progressively
  cache.data = [];
  cache.confluenceCount = 0;
  cache.scannedCount = 0;

  const startTime = Date.now();

  try {
    const allTickers = await getFuturesTickers();
    // Filter strictly USDT pairs
    const usdtTickers = allTickers.filter((t) => t.symbol && t.symbol.endsWith("USDT"));

    cache.totalPairs = usdtTickers.length;

    // Concurrency: 2 pairs at a time (2 * 3 klines = 6 calls per chunk)
    const CONCURRENCY = 2;
    for (let i = 0; i < usdtTickers.length; i += CONCURRENCY) {
      const chunk = usdtTickers.slice(i, i + CONCURRENCY);
      const promises = chunk.map((ticker) => scanSingleCoin(ticker));
      const chunkResults = await Promise.all(promises);

      // Instantly push each scanned coin to cache so frontend sees it live!
      for (const res of chunkResults) {
        if (res) {
          cache.data.push(res);
          if (res.isConfluence) {
            cache.confluenceCount++;
          }
        }
      }

      cache.scannedCount = Math.min(usdtTickers.length, i + CONCURRENCY);
      cache.lastUpdated = Date.now();

      // Pacing delay between chunks: 650ms to stay safely under 10 req/s limit
      await sleep(650);
    }

    cache.scanDurationMs = Date.now() - startTime;
  } catch (err: any) {
    cache.error = err.message || "Unknown error during scan";
  } finally {
    cache.isScanning = false;
    cache.lastUpdated = Date.now();
  }
}
