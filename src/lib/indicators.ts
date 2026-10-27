/**
 * Calculate Exponential Moving Average (EMA)
 * @param closes Array of close prices sorted CHRONOLOGICALLY (oldest to newest)
 * @param period Default 21
 */
export function calculateEMA(closes: number[], period: number = 21): number | null {
  if (!closes || closes.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);

  // 1. Initial SMA as the starting seed
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += closes[i];
  }
  let currentEMA = sum / period;

  // 2. Iterate remaining candles
  for (let i = period; i < closes.length; i++) {
    currentEMA = (closes[i] - currentEMA) * multiplier + currentEMA;
  }

  return currentEMA;
}

/**
 * Evaluates whether price is above EMA 21 and computes distance %
 */
export function evaluateEMACondition(
  currentPrice: number,
  ema21: number
): { diffPercent: number; isAbove: boolean } {
  if (ema21 <= 0) {
    return { diffPercent: 0, isAbove: false };
  }

  const diffPercent = ((currentPrice - ema21) / ema21) * 100;
  return {
    diffPercent: Number(diffPercent.toFixed(2)),
    isAbove: currentPrice > ema21,
  };
}
