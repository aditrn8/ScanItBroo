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

export type SetupSignal = "LONG" | "SHORT" | "NONE";

export interface TradeSetup {
  signal: SetupSignal;
  entryPrice: number;
  stopLoss: number;
  tp1: number; // 1:1.5 Risk-Reward
  tp2: number; // 1:2.5 Risk-Reward
  riskPercent: number;
  reward1Percent: number;
  reward2Percent: number;
  diffPercentEMA50: number;
  ema50: number;
  timeframe: "1h" | "4h" | "1d";
}

export interface TimeframeEMA {
  ema21: number;
  diffPercent: number; // ((price - ema) / ema) * 100
  isAbove: boolean;
  candlesCount: number;
  ema50?: number;
  diffPercentEMA50?: number;
  setup?: TradeSetup | null;
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
  tradeSetup?: TradeSetup | null; // Primary setup (1H or best active setup)
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
    longCount: number;
    shortCount: number;
    lastUpdated: number;
    isScanning: boolean;
    scanDurationMs: number;
  };
}

