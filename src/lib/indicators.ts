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

import { TradeSetup, SetupSignal } from "@/types/crypto";

/**
 * Evaluates EMA 50 status and calculates automated TP/SL trade setup
 * Strategy:
 * - Price above EMA50 0-3%: LONG setup (retest dynamic support)
 * - Price below EMA50 0-3%: SHORT setup (retest dynamic resistance)
 */
export function calculateTradeSetup(
  currentPrice: number,
  ema50: number,
  timeframe: "1h" | "4h" | "1d" = "1h"
): TradeSetup | null {
  if (!currentPrice || !ema50 || ema50 <= 0) {
    return null;
  }

  const diffPercent = Number((((currentPrice - ema50) / ema50) * 100).toFixed(2));

  // 1. Check for LONG setup: Price above EMA50 by 0% to +3%
  if (diffPercent >= 0 && diffPercent <= 3.0) {
    // SL is placed 1.0% below EMA 50 support line
    let stopLoss = ema50 * 0.99;
    if (stopLoss >= currentPrice) {
      stopLoss = currentPrice * 0.985; // safety fallback (1.5% below entry)
    }

    const risk = currentPrice - stopLoss;
    const tp1 = currentPrice + risk * 1.5; // 1:1.5 Risk-Reward
    const tp2 = currentPrice + risk * 2.5; // 1:2.5 Risk-Reward

    const riskPercent = Number((((currentPrice - stopLoss) / currentPrice) * 100).toFixed(2));
    const reward1Percent = Number((((tp1 - currentPrice) / currentPrice) * 100).toFixed(2));
    const reward2Percent = Number((((tp2 - currentPrice) / currentPrice) * 100).toFixed(2));

    return {
      signal: "LONG",
      entryPrice: currentPrice,
      stopLoss: Number(stopLoss.toFixed(6)),
      tp1: Number(tp1.toFixed(6)),
      tp2: Number(tp2.toFixed(6)),
      riskPercent,
      reward1Percent,
      reward2Percent,
      diffPercentEMA50: diffPercent,
      ema50: Number(ema50.toFixed(6)),
      timeframe,
    };
  }

  // 2. Check for SHORT setup: Price below EMA50 by 0% to -3%
  if (diffPercent <= 0 && diffPercent >= -3.0) {
    // SL is placed 1.0% above EMA 50 resistance line
    let stopLoss = ema50 * 1.01;
    if (stopLoss <= currentPrice) {
      stopLoss = currentPrice * 1.015; // safety fallback (1.5% above entry)
    }

    const risk = stopLoss - currentPrice;
    const tp1 = currentPrice - risk * 1.5; // 1:1.5 Risk-Reward
    const tp2 = currentPrice - risk * 2.5; // 1:2.5 Risk-Reward

    const riskPercent = Number((((stopLoss - currentPrice) / currentPrice) * 100).toFixed(2));
    const reward1Percent = Number((((currentPrice - tp1) / currentPrice) * 100).toFixed(2));
    const reward2Percent = Number((((currentPrice - tp2) / currentPrice) * 100).toFixed(2));

    return {
      signal: "SHORT",
      entryPrice: currentPrice,
      stopLoss: Number(stopLoss.toFixed(6)),
      tp1: Number(tp1.toFixed(6)),
      tp2: Number(tp2.toFixed(6)),
      riskPercent,
      reward1Percent,
      reward2Percent,
      diffPercentEMA50: diffPercent,
      ema50: Number(ema50.toFixed(6)),
      timeframe,
    };
  }

  return null;
}

