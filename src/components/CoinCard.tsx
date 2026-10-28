"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Flame,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Target,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { ScannedCoin, TimeframeEMA, TradeSetup } from "@/types/crypto";

interface CoinCardProps {
  coin: ScannedCoin;
  activeTimeframe?: "1h" | "4h" | "1d";
  onSelect?: (coin: ScannedCoin) => void;
}

export function CoinCard({ coin, activeTimeframe = "1h", onSelect }: CoinCardProps) {
  const [copied, setCopied] = useState(false);

  // Pick setup matching the user's active filter timeframe, or fallback to coin.tradeSetup
  const activeSetup: TradeSetup | null | undefined =
    activeTimeframe === "4h"
      ? coin.tf4h.setup || coin.tradeSetup
      : activeTimeframe === "1d"
      ? coin.tf1d.setup || coin.tradeSetup
      : coin.tf1h.setup || coin.tradeSetup;

  const formatUSD = (val: number) => {
    if (val >= 1000) {
      return val.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (val >= 1) {
      return val.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
    } else {
      return val.toLocaleString("en-US", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 8,
      });
    }
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `$${(vol / 1000000000).toFixed(2)}B`;
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const handleCopySetup = (e: React.MouseEvent, setup: TradeSetup) => {
    e.stopPropagation();
    const text = `🎯 [ScanItBroo Setup: ${coin.symbol}]
• Tipe: ${setup.signal === "LONG" ? "🟢 LONG SETUP (Retest EMA50 Support)" : "🔴 SHORT SETUP (Retest EMA50 Resistance)"}
• Timeframe: ${setup.timeframe.toUpperCase()}
• Entry: $${formatUSD(setup.entryPrice)}
• Stop Loss: $${formatUSD(setup.stopLoss)} (-${setup.riskPercent}%)
• TP 1 (1.5R): $${formatUSD(setup.tp1)} (+${setup.reward1Percent}%)
• TP 2 (2.5R): $${formatUSD(setup.tp2)} (+${setup.reward2Percent}%)
• EMA 50: $${formatUSD(setup.ema50)} (${setup.diffPercentEMA50 >= 0 ? "+" : ""}${setup.diffPercentEMA50}%)
• Trade Link: https://www.bitunix.com/futures-trade/${coin.symbol}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isIlliquid = coin.volume24h < 500000;

  const renderTFBadge = (label: string, tf: TimeframeEMA) => {
    const isAbove = tf.isAbove;
    return (
      <div
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-wider transition-all text-center ${
          isAbove ? "glow-badge-active" : "glow-badge-inactive"
        }`}
      >
        <div className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAbove ? "bg-emerald-400 animate-pulse" : "bg-red-400"
            }`}
          />
          <span>{label}</span>
        </div>
        <span className="text-[10px] font-semibold opacity-90 mt-0.5">
          {tf.diffPercent > 0 ? `+${tf.diffPercent}%` : `${tf.diffPercent}%`}
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelect && onSelect(coin)}
      className={`glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
        activeSetup?.signal === "LONG"
          ? "border-emerald-500/40 shadow-glow-green/10"
          : activeSetup?.signal === "SHORT"
          ? "border-rose-500/40 shadow-glow-red/10"
          : "border-white/10"
      }`}
    >
      {/* Background Accent glow */}
      {activeSetup?.signal === "LONG" && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
      )}
      {activeSetup?.signal === "SHORT" && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />
      )}

      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-black tracking-wide text-white group-hover:text-emerald-300 transition-colors">
                {coin.baseAsset}
              </span>
              <span className="text-xs text-gray-500 font-mono">/USDT</span>

              {isIlliquid ? (
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                  Illiquid
                </span>
              ) : null}
            </div>

            <p className="text-[11px] text-gray-400 mt-0.5">
              Vol: <strong className="text-gray-200">{formatVolume(coin.volume24h)}</strong>
            </p>
          </div>

          {/* Live Price & 24h Change */}
          <div className="text-right shrink-0">
            <div className="text-sm sm:text-base font-extrabold font-mono text-white">
              ${formatUSD(coin.currentPrice)}
            </div>
            <span
              className={`inline-block text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md mt-0.5 ${
                coin.change24h >= 0
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/15 text-red-400 border border-red-500/30"
              }`}
            >
              {coin.change24h >= 0 ? `+${coin.change24h}%` : `${coin.change24h}%`}
            </span>
          </div>
        </div>

        {/* 🎯 Trade Setup Recommended Box (When in Long/Short 0-3% Sweet Spot) */}
        {activeSetup && (
          <div
            className={`my-2 p-2.5 rounded-xl border transition-all ${
              activeSetup.signal === "LONG"
                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/35 text-rose-300"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <div className="flex items-center gap-1.5">
                {activeSetup.signal === "LONG" ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className="font-extrabold text-[11px] sm:text-xs">
                  {activeSetup.signal === "LONG" ? "🟢 LONG SETUP" : "🔴 SHORT SETUP"}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-mono text-gray-300">
                  {activeSetup.timeframe.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-bold">
                  {activeSetup.diffPercentEMA50 >= 0 ? `+${activeSetup.diffPercentEMA50}%` : `${activeSetup.diffPercentEMA50}%`} EMA50
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopySetup(e, activeSetup)}
                  title="Salin Rencana TP & SL"
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Structured TP / SL Box */}
            <div className="grid grid-cols-3 gap-1.5 text-center mt-1">
              {/* SL Box */}
              <div className="bg-black/40 p-1.5 rounded-lg border border-red-500/20">
                <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                  Stop Loss
                </div>
                <div className="text-[11px] sm:text-xs font-extrabold font-mono text-red-400 truncate">
                  ${formatUSD(activeSetup.stopLoss)}
                </div>
                <div className="text-[9px] font-mono text-red-400/80">
                  -{activeSetup.riskPercent}%
                </div>
              </div>

              {/* TP 1 Box */}
              <div className="bg-black/40 p-1.5 rounded-lg border border-emerald-500/20">
                <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                  TP 1 (1.5R)
                </div>
                <div className="text-[11px] sm:text-xs font-extrabold font-mono text-emerald-400 truncate">
                  ${formatUSD(activeSetup.tp1)}
                </div>
                <div className="text-[9px] font-mono text-emerald-400/80">
                  +{activeSetup.reward1Percent}%
                </div>
              </div>

              {/* TP 2 Box */}
              <div className="bg-black/40 p-1.5 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                  TP 2 (2.5R)
                </div>
                <div className="text-[11px] sm:text-xs font-extrabold font-mono text-cyan-400 truncate">
                  ${formatUSD(activeSetup.tp2)}
                </div>
                <div className="text-[9px] font-mono text-cyan-400/80">
                  +{activeSetup.reward2Percent}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeframe EMA 21 Confluence Status Badges */}
        <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-white/5 my-2">
          {renderTFBadge("1H", coin.tf1h)}
          {renderTFBadge("4H", coin.tf4h)}
          {renderTFBadge("1D", coin.tf1d)}
        </div>

        {/* Quick EMA 50 info row */}
        {coin.tf1h.ema50 && (
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 py-0.5">
            <span>EMA 50 (1H):</span>
            <span className="font-mono text-gray-200 font-semibold">
              ${formatUSD(coin.tf1h.ema50)}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(coin);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-emerald-300 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Setup & Chart</span>
        </button>

        {/* Direct Link to Bitunix Futures */}
        <a
          href={`https://www.bitunix.com/futures-trade/${coin.symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 text-xs font-medium text-gray-300 hover:border-emerald-400 transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
        >
          <span>Bitunix</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
