export interface BitunixTickerRaw {
  symbol: string;
  lastPrice: string;
  highPrice?: string;
  lowPrice?: string;
  quoteVol?: string; // 24h turnover in USDT
  baseVol?: string;
  priceChangePercent?: string;
  change24h?: string;
}

export interface KlineRaw {
  open: string;
  high: string;
  low: string;
  close: string;
  quoteVol: string;
  baseVol: string;
  time: string; // timestamp ms
}

export interface TimeframeEMA {
  ema21: number;
  diffPercent: number; // ((price - ema) / ema) * 100
  isAbove: boolean;
  candlesCount: number;
}

export interface ScannedCoin {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  change24h: number;
  volume24h: number; // USDT turnover
  tf1h: TimeframeEMA;
  tf4h: TimeframeEMA;
  tf1d: TimeframeEMA;
  isConfluence: boolean; // all 3 timeframes > EMA 21
  scannedAt: number;
}

export interface BitunixFundingRateRaw {
  symbol: string;
  markPrice: string;
  lastPrice: string;
  indexPrice: string;
  fundingRate: string;
  fundingInterval: number;
  nextFundingTime: string;
  maxFundingRate?: string;
  minFundingRate?: string;
}

export interface FundingRateData {
  symbol: string;
  fundingRatePercent: number; // e.g. 0.0471%
  fundingRateRaw: string;
  nextFundingTime: number;
  markPrice: number;
  indexPrice: number;
  lastPrice: number;
  intervalHours: number;
}

export interface ScanApiResponse {
  status: "success" | "scanning" | "error";
  message?: string;
  data: ScannedCoin[];
  summary: {
    totalPairs: number;
    scannedCount: number;
    confluenceCount: number;
    lastUpdated: number;
    isScanning: boolean;
    scanDurationMs: number;
  };
}
