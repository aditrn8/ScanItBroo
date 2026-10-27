"use client";

import React from "react";
import { CheckCircle2, Coins, TrendingUp, Sparkles } from "lucide-react";
import { ScannedCoin } from "@/types/crypto";

interface StatsBarProps {
  coins: ScannedCoin[];
  totalScanned: number;
}

export function StatsBar({ coins, totalScanned }: StatsBarProps) {
  const confluenceCoins = coins.filter((c) => c.isConfluence);
  const illiquidConfluence = confluenceCoins.filter((c) => c.volume24h < 500000);

  // Top gainer among confluence coins
  const topGainer =
    confluenceCoins.length > 0
      ? [...confluenceCoins].sort((a, b) => b.change24h - a.change24h)[0]
      : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {/* 1. Confluence Card */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 truncate pr-1">
            Confluence (1H+4H+1D)
          </span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400">
            {confluenceCoins.length}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">Lolos</span>
        </div>
      </div>

      {/* 2. Total Pairs */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 truncate pr-1">
            Pairs USDT
          </span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            {totalScanned}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">Aktif</span>
        </div>
      </div>

      {/* 3. Illiquid / Low Volume Gems */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 truncate pr-1">
            Vol &lt;$500K
          </span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300">
            {illiquidConfluence.length}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">Gems</span>
        </div>
      </div>

      {/* 4. Top Gainer Confluence */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 truncate pr-1">
            Top Gainer
          </span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        {topGainer ? (
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white truncate">
              {topGainer.baseAsset}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              +{topGainer.change24h}%
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-500">-</span>
        )}
      </div>
    </div>
  );
}
