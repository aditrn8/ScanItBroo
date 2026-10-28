"use client";

import React from "react";
import { CheckCircle2, TrendingUp, TrendingDown, Sparkles, Target } from "lucide-react";
import { ScannedCoin } from "@/types/crypto";

interface StatsBarProps {
  coins: ScannedCoin[];
  totalScanned: number;
}

export function StatsBar({ coins, totalScanned }: StatsBarProps) {
  const confluenceCoins = coins.filter((c) => c.isConfluence);
  const longCoins = coins.filter((c) => c.tradeSetup?.signal === "LONG");
  const shortCoins = coins.filter((c) => c.tradeSetup?.signal === "SHORT");
  const illiquidGems = coins.filter((c) => c.volume24h < 500000 && (c.tradeSetup || c.isConfluence));

  // Top gainer among scanned coins
  const topGainer =
    coins.length > 0
      ? [...coins].sort((a, b) => b.change24h - a.change24h)[0]
      : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mb-4 sm:mb-6">
      {/* 1. Long Setups Card */}
      <div className="glass-card p-3 sm:p-3.5 rounded-2xl relative overflow-hidden group border border-emerald-500/20">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/15 rounded-full blur-xl group-hover:bg-emerald-500/25 transition-all" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-300 truncate pr-1">
            🟢 Long Setup (0-3%)
          </span>
          <div className="p-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-emerald-400">
            {longCoins.length}
          </span>
          <span className="text-[10px] text-gray-400">Peluang</span>
        </div>
      </div>

      {/* 2. Short Setups Card */}
      <div className="glass-card p-3 sm:p-3.5 rounded-2xl relative overflow-hidden group border border-rose-500/20">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/15 rounded-full blur-xl group-hover:bg-rose-500/25 transition-all" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-300 truncate pr-1">
            🔴 Short Setup (0-3%)
          </span>
          <div className="p-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-rose-400">
            {shortCoins.length}
          </span>
          <span className="text-[10px] text-gray-400">Peluang</span>
        </div>
      </div>

      {/* 3. Confluence EMA 21 */}
      <div className="glass-card p-3 sm:p-3.5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-400 truncate pr-1">
            3TF &gt; EMA21
          </span>
          <div className="p-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-extrabold text-cyan-400">
            {confluenceCoins.length}
          </span>
          <span className="text-[10px] text-gray-500">Confluence</span>
        </div>
      </div>

      {/* 4. Illiquid Gems */}
      <div className="glass-card p-3 sm:p-3.5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-400 truncate pr-1">
            Vol &lt;$500K
          </span>
          <div className="p-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-extrabold text-amber-300">
            {illiquidGems.length}
          </span>
          <span className="text-[10px] text-gray-500">Gems</span>
        </div>
      </div>

      {/* 5. Top Gainer */}
      <div className="glass-card p-3 sm:p-3.5 rounded-2xl relative overflow-hidden group col-span-2 sm:col-span-1">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-400 truncate pr-1">
            Top Gainer
          </span>
          <div className="p-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        {topGainer ? (
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-base sm:text-lg font-black text-white truncate">
              {topGainer.baseAsset}
            </span>
            <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
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

