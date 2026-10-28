import { getFuturesTickers, getFuturesKline } from "./bitunix";
import { calculateEMA, evaluateEMACondition, calculateTradeSetup } from "./indicators";
import { ScannedCoin, BitunixTickerRaw } from "@/types/crypto";

// In-Memory Global Cache for Next.js server instance
interface ScannerCache {
  data: ScannedCoin[];
  isScanning: boolean;
  shouldStop: boolean;
  lastUpdated: number;
  totalPairs: number;
  scannedCount: number;
  confluenceCount: number;
  longCount: number;
  shortCount: number;
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
    shouldStop: false,
    lastUpdated: 0,
    totalPairs: 0,
    scannedCount: 0,
    confluenceCount: 0,
    longCount: 0,
    shortCount: 0,
    scanDurationMs: 0,
  };
}

export function getScanCache(): ScannerCache {
  return global.__scannerCache!;
}

export function stopScan(): void {
  const cache = getScanCache();
  if (cache.isScanning) {
    cache.shouldStop = true;
  }
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
    // Fetch 1h, 4h, 1d in parallel for this coin (80 candles to support both EMA 21 and EMA 50)
    const [kline1h, kline4h, kline1d] = await Promise.all([
      getFuturesKline(symbol, "1h", 80),
      getFuturesKline(symbol, "4h", 80),
      getFuturesKline(symbol, "1d", 80),
    ]);

    const closes1h = kline1h.map((c) => parseFloat(c.close)).filter((n) => !isNaN(n));
    const closes4h = kline4h.map((c) => parseFloat(c.close)).filter((n) => !isNaN(n));
    const closes1d = kline1d.map((c) => parseFloat(c.close)).filter((n) => !isNaN(n));

    // Calculate EMA 21
    const ema1h = calculateEMA(closes1h, 21);
    const ema4h = calculateEMA(closes4h, 21);
    const ema1d = calculateEMA(closes1d, 21);

    // If data is insufficient for EMA 21, skip
    if (!ema1h || !ema4h || !ema1d) {
      return null;
    }

    // Calculate EMA 50 (if sufficient candles exist)
    const ema1h_50 = calculateEMA(closes1h, 50);
    const ema4h_50 = calculateEMA(closes4h, 50);
    const ema1d_50 = calculateEMA(closes1d, 50);

    const cond1h = evaluateEMACondition(currentPrice, ema1h);
    const cond4h = evaluateEMACondition(currentPrice, ema4h);
    const cond1d = evaluateEMACondition(currentPrice, ema1d);

    const isConfluence = cond1h.isAbove && cond4h.isAbove && cond1d.isAbove;

    // Calculate Trade Setups (Price 0-3% above/below EMA50 with automated TP/SL)
    const setup1h = ema1h_50 ? calculateTradeSetup(currentPrice, ema1h_50, "1h") : null;
    const setup4h = ema4h_50 ? calculateTradeSetup(currentPrice, ema4h_50, "4h") : null;
    const setup1d = ema1d_50 ? calculateTradeSetup(currentPrice, ema1d_50, "1d") : null;

    // Primary setup prioritizes 1H setup, then 4H, then 1D
    const primarySetup = setup1h || setup4h || setup1d || null;

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
        ema50: ema1h_50 ? Number(ema1h_50.toFixed(4)) : undefined,
        diffPercentEMA50: setup1h?.diffPercentEMA50,
        setup: setup1h,
      },
      tf4h: {
        ema21: Number(ema4h.toFixed(4)),
        diffPercent: cond4h.diffPercent,
        isAbove: cond4h.isAbove,
        candlesCount: closes4h.length,
        ema50: ema4h_50 ? Number(ema4h_50.toFixed(4)) : undefined,
        diffPercentEMA50: setup4h?.diffPercentEMA50,
        setup: setup4h,
      },
      tf1d: {
        ema21: Number(ema1d.toFixed(4)),
        diffPercent: cond1d.diffPercent,
        isAbove: cond1d.isAbove,
        candlesCount: closes1d.length,
        ema50: ema1d_50 ? Number(ema1d_50.toFixed(4)) : undefined,
        diffPercentEMA50: setup1d?.diffPercentEMA50,
        setup: setup1d,
      },
      isConfluence,
      tradeSetup: primarySetup,
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
  cache.longCount = 0;
  cache.shortCount = 0;
  cache.scannedCount = 0;

  const startTime = Date.now();

  try {
    const allTickers = await getFuturesTickers();
    // Filter strictly USDT pairs
    const usdtTickers = allTickers.filter((t) => t.symbol && t.symbol.endsWith("USDT"));

    cache.totalPairs = usdtTickers.length;

    // Concurrency: 3 pairs at a time (optimized for Vercel 60s max execution time)
    const CONCURRENCY = 3;
    for (let i = 0; i < usdtTickers.length; i += CONCURRENCY) {
      if (cache.shouldStop) {
        cache.shouldStop = false;
        break;
      }

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
          if (res.tradeSetup?.signal === "LONG") {
            cache.longCount++;
          } else if (res.tradeSetup?.signal === "SHORT") {
            cache.shortCount++;
          }
        }
      }

      cache.scannedCount = Math.min(usdtTickers.length, i + CONCURRENCY);
      cache.lastUpdated = Date.now();

      // Pacing delay between chunks to stay within rate limits (~25-30s total scan)
      await sleep(400);
    }

    cache.scanDurationMs = Date.now() - startTime;
  } catch (err: any) {
    cache.error = err.message || "Unknown error during scan";
  } finally {
    cache.isScanning = false;
    cache.lastUpdated = Date.now();
  }
}
