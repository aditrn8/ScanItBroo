"use client";

import React from "react";
import { ExternalLink, Flame, ShieldAlert, BarChart2 } from "lucide-react";
import { ScannedCoin, TimeframeEMA } from "@/types/crypto";

interface CoinCardProps {
  coin: ScannedCoin;
  onSelect?: (coin: ScannedCoin) => void;
}

export function CoinCard({ coin, onSelect }: CoinCardProps) {
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

  const isIlliquid = coin.volume24h < 500000;

  const renderTFBadge = (label: string, tf: TimeframeEMA) => {
    const isAbove = tf.isAbove;
    return (
      <div
        className={`flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all text-center ${
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
        <span className="text-[10px] font-semibold opacity-90">
          {tf.diffPercent > 0 ? `+${tf.diffPercent}%` : `${tf.diffPercent}%`}
        </span>
      </div>
    );
  };

  const renderDistanceBar = (label: string, tf: TimeframeEMA) => {
    const maxScale = 15; // 15% as full visual bar
    const widthPercent = Math.min(Math.max((tf.diffPercent / maxScale) * 100, 4), 100);

    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-400">
            {label} EMA21:{" "}
            <strong className="text-gray-200 font-mono">${formatUSD(tf.ema21)}</strong>
          </span>
          <span
            className={`font-mono font-semibold text-[10px] sm:text-[11px] ${
              tf.diffPercent >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {tf.diffPercent >= 0 ? `+${tf.diffPercent}%` : `${tf.diffPercent}%`}
          </span>
        </div>
        <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              tf.isAbove
                ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                : "bg-red-500/80"
            }`}
            style={{ width: `${widthPercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelect && onSelect(coin)}
      className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-[1.01]"
    >
      {/* Background Accent glow */}
      {coin.isConfluence && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
      )}

      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
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

            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
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

        {/* Timeframe Confluence Status Badges */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2.5 sm:py-3 border-y border-white/5 my-2.5 sm:my-3">
          {renderTFBadge("1H", coin.tf1h)}
          {renderTFBadge("4H", coin.tf4h)}
          {renderTFBadge("1D", coin.tf1d)}
        </div>

        {/* Distance to EMA Progress Bars */}
        <div className="flex flex-col gap-2 sm:gap-2.5 my-2">
          {renderDistanceBar("1H", coin.tf1h)}
          {renderDistanceBar("4H", coin.tf4h)}
          {renderDistanceBar("1D", coin.tf1d)}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-3 sm:mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(coin);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-emerald-300 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Chart & Detail</span>
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
