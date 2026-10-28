"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Flame,
  Clock,
  Coins,
  TrendingUp,
  ShieldCheck,
  Radio,
  Layers,
  Network,
  Search,
  Activity,
  Loader2,
} from "lucide-react";
import { ScannedCoin, FundingRateData } from "@/types/crypto";
import { TradingViewWidget } from "./TradingViewWidget";

interface CoinDetailModalProps {
  coin: ScannedCoin | null;
  onClose: () => void;
}

export function CoinDetailModal({ coin, onClose }: CoinDetailModalProps) {
  const [fundingData, setFundingData] = useState<FundingRateData | null>(null);
  const [loadingFunding, setLoadingFunding] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch live funding rate on coin change
  useEffect(() => {
    if (!coin) {
      setFundingData(null);
      return;
    }

    let isMounted = true;
    setLoadingFunding(true);

    fetch(`/api/coin-detail?symbol=${encodeURIComponent(coin.symbol)}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.status === "success" && json.data) {
          setFundingData(json.data);
        }
      })
      .catch((err) => console.error("Failed to fetch funding rate:", err))
      .finally(() => {
        if (isMounted) setLoadingFunding(false);
      });

    return () => {
      isMounted = false;
    };
  }, [coin]);

  if (!coin) return null;

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

  const calculateFundingCountdown = (nextTs: number) => {
    if (!nextTs) return "-";
    const diffMs = nextTs - Date.now();
    if (diffMs <= 0) return "Selesai / Menghitung";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${mins}m lagi`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl my-auto rounded-3xl bg-[#080B11]/95 border border-white/15 shadow-2xl p-4 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-white">
                {coin.baseAsset}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 font-mono">
                / USDT Perpetual
              </span>

              {coin.isConfluence && (
                <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Full Confluence (1H+4H+1D &gt; EMA21)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white">
                ${formatUSD(coin.currentPrice)}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  coin.change24h >= 0
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/15 text-red-400 border border-red-500/30"
                }`}
              >
                {coin.change24h >= 0 ? `+${coin.change24h}%` : `${coin.change24h}%`}
              </span>
              <span className="text-xs text-gray-400">
                24h Volume:{" "}
                <strong className="text-gray-200">{formatVolume(coin.volume24h)}</strong>
              </span>
            </div>
          </div>

          {/* Action & Close */}
          <div className="flex items-center gap-2">
            <a
              href={`https://www.bitunix.com/futures-trade/${coin.symbol}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glow-green"
            >
              <span>Trade di Bitunix</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Tutup Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Derivatives & Confluence Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          {/* Funding Rate Box */}
          <div className="glass-card p-3 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[11px] flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                Live Funding Rate
              </span>
              {loadingFunding && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
            </div>
            {fundingData ? (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-base font-extrabold font-mono ${
                      fundingData.fundingRatePercent >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {fundingData.fundingRatePercent >= 0
                      ? `+${fundingData.fundingRatePercent}%`
                      : `${fundingData.fundingRatePercent}%`}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ({fundingData.intervalHours}h)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>Settlement: {calculateFundingCountdown(fundingData.nextFundingTime)}</span>
                </div>
              </div>
            ) : (
              <span className="text-gray-500 text-[11px]">Mengambil data...</span>
            )}
          </div>

          {/* EMA 1H Metric */}
          <div className="glass-card p-3 rounded-2xl">
            <span className="text-gray-400 text-[11px]">EMA 21 (1H)</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-mono text-white font-bold">
                ${formatUSD(coin.tf1h.ema21)}
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  coin.tf1h.isAbove ? "text-emerald-400" : "text-red-400"
                }`}
              >
                +{coin.tf1h.diffPercent}%
              </span>
            </div>
          </div>

          {/* EMA 4H Metric */}
          <div className="glass-card p-3 rounded-2xl">
            <span className="text-gray-400 text-[11px]">EMA 21 (4H)</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-mono text-white font-bold">
                ${formatUSD(coin.tf4h.ema21)}
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  coin.tf4h.isAbove ? "text-emerald-400" : "text-red-400"
                }`}
              >
                +{coin.tf4h.diffPercent}%
              </span>
            </div>
          </div>

          {/* EMA 1D Metric */}
          <div className="glass-card p-3 rounded-2xl">
            <span className="text-gray-400 text-[11px]">EMA 21 (1D)</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-mono text-white font-bold">
                ${formatUSD(coin.tf1d.ema21)}
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  coin.tf1d.isAbove ? "text-emerald-400" : "text-red-400"
                }`}
              >
                +{coin.tf1d.diffPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Live TradingView Chart */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-gray-300 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Chart Live TradingView (Bitunix)
            </span>
            <span className="text-[11px] text-gray-500 hidden sm:inline">
              Interaktif • Indikator & Gambar Aktif
            </span>
          </div>

          <TradingViewWidget symbol={coin.symbol} />
        </div>

        {/* Intelligence Hub: Open Interest & Onchain Holders */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Derivatives & Onchain Intelligence Hub</span>
          </div>

          <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
            Data open interest dan sebaran wallet holder on-chain untuk pair{" "}
            <strong className="text-gray-200">{coin.baseAsset}</strong> bisa diakses
            langsung secara live melalui link analitik resmi di bawah:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* 1. CoinGlass Open Interest */}
            <a
              href={`https://www.coinglass.com/tv/Bitunix_${coin.symbol}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 hover:text-white transition-all group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-cyan-300 group-hover:text-cyan-200">
                  CoinGlass
                </span>
                <span className="text-[10px] text-gray-400">Open Interest (OI)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
            </a>

            {/* 2. Bubblemaps (Token Holders Cluster) */}
            <a
              href={`https://app.bubblemaps.io/search?q=${coin.baseAsset}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 hover:text-white transition-all group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-amber-300 group-hover:text-amber-200">
                  Bubblemaps
                </span>
                <span className="text-[10px] text-gray-400">Onchain Holders</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
            </a>

            {/* 3. DexScreener */}
            <a
              href={`https://dexscreener.com/search?q=${coin.baseAsset}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 hover:text-white transition-all group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-emerald-300 group-hover:text-emerald-200">
                  DexScreener
                </span>
                <span className="text-[10px] text-gray-400">Swaps & Pools</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
            </a>

            {/* 4. Solscan / Etherscan via CoinMarketCap */}
            <a
              href={`https://coinmarketcap.com/search/?q=${coin.baseAsset}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 hover:text-white transition-all group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-indigo-300 group-hover:text-indigo-200">
                  Explorers
                </span>
                <span className="text-[10px] text-gray-400">Contract & Wallets</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Mobile Action Button Footer */}
        <div className="sm:hidden pt-2 border-t border-white/10">
          <a
            href={`https://www.bitunix.com/futures-trade/${coin.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-500 text-black text-xs font-bold shadow-glow-green"
          >
            <span>Buka Trading di Bitunix</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
