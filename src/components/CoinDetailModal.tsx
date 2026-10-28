"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Clock,
  Coins,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Network,
  Activity,
  Loader2,
  Copy,
  Check,
  Target,
  Sparkles,
} from "lucide-react";
import { ScannedCoin, FundingRateData, TradeSetup } from "@/types/crypto";
import { TradingViewWidget } from "./TradingViewWidget";

interface CoinDetailModalProps {
  coin: ScannedCoin | null;
  onClose: () => void;
}

export function CoinDetailModal({ coin, onClose }: CoinDetailModalProps) {
  const [fundingData, setFundingData] = useState<FundingRateData | null>(null);
  const [loadingFunding, setLoadingFunding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTF, setSelectedTF] = useState<"1h" | "4h" | "1d">("1h");

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

  const currentSetup: TradeSetup | null | undefined =
    selectedTF === "1h"
      ? coin.tf1h.setup || coin.tradeSetup
      : selectedTF === "4h"
      ? coin.tf4h.setup
      : coin.tf1d.setup;

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

  const handleCopySetup = (setup: TradeSetup) => {
    const text = `🎯 [ScanItBroo Trade Setup: ${coin.symbol}]
• Tipe Setup: ${setup.signal === "LONG" ? "🟢 LONG SETUP (Retest EMA50 Support)" : "🔴 SHORT SETUP (Retest EMA50 Resistance)"}
• Timeframe: ${setup.timeframe.toUpperCase()}
• Entry Price: $${formatUSD(setup.entryPrice)}
• Stop Loss (SL): $${formatUSD(setup.stopLoss)} (-${setup.riskPercent}%)
• Take Profit 1 (1.5R): $${formatUSD(setup.tp1)} (+${setup.reward1Percent}%)
• Take Profit 2 (2.5R): $${formatUSD(setup.tp2)} (+${setup.reward2Percent}%)
• EMA 50 Reference: $${formatUSD(setup.ema50)} (${setup.diffPercentEMA50 >= 0 ? "+" : ""}${setup.diffPercentEMA50}%)
• Eksekusi di Bitunix: https://www.bitunix.com/futures-trade/${coin.symbol}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                  Full Confluence (3TF &gt; EMA21)
                </span>
              )}

              {currentSetup && (
                <span
                  className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    currentSetup.signal === "LONG"
                      ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                      : "bg-rose-500/15 border-rose-500/35 text-rose-300"
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  {currentSetup.signal === "LONG" ? "Long Sweet Spot" : "Short Sweet Spot"} (0-3% EMA50)
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

        {/* 🎯 Interactive Trade Setup & TP/SL Position Plan */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                  Rencana Eksekusi Trade &amp; Kalkulator TP/SL
                </h4>
                <p className="text-[11px] text-gray-400">
                  Target Profit (1.5R &amp; 2.5R) &amp; Stop Loss berbasis zona pullback EMA 50
                </p>
              </div>
            </div>

            {/* Timeframe Switcher for Setup */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              {(["1h", "4h", "1d"] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setSelectedTF(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    selectedTF === tf
                      ? "bg-emerald-500 text-black shadow-glow-green"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {currentSetup ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs mb-3">
                {/* Entry Price */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">
                    Entry Level (Market)
                  </span>
                  <div className="text-base font-black font-mono text-white mt-0.5">
                    ${formatUSD(currentSetup.entryPrice)}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    EMA50: ${formatUSD(currentSetup.ema50)}
                  </span>
                </div>

                {/* Stop Loss */}
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/25">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-300 uppercase font-semibold">
                      Stop Loss (SL)
                    </span>
                    <span className="text-[10px] text-red-400 font-mono font-bold">
                      -{currentSetup.riskPercent}%
                    </span>
                  </div>
                  <div className="text-base font-black font-mono text-red-400 mt-0.5">
                    ${formatUSD(currentSetup.stopLoss)}
                  </div>
                  <span className="text-[10px] text-red-300/70">
                    Batas Invalidation
                  </span>
                </div>

                {/* Take Profit 1 */}
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/25">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 uppercase font-semibold">
                      TP 1 (1 : 1.5 R)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      +{currentSetup.reward1Percent}%
                    </span>
                  </div>
                  <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
                    ${formatUSD(currentSetup.tp1)}
                  </div>
                  <span className="text-[10px] text-emerald-300/70">
                    Amankan Sebagian
                  </span>
                </div>

                {/* Take Profit 2 */}
                <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/25">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-300 uppercase font-semibold">
                      TP 2 (1 : 2.5 R)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">
                      +{currentSetup.reward2Percent}%
                    </span>
                  </div>
                  <div className="text-base font-black font-mono text-cyan-400 mt-0.5">
                    ${formatUSD(currentSetup.tp2)}
                  </div>
                  <span className="text-[10px] text-cyan-300/70">
                    Runner Target
                  </span>
                </div>
              </div>

              {/* Copy Setup Button */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Status:{" "}
                    <strong className="text-gray-200">
                      {currentSetup.signal === "LONG"
                        ? "Harga berada 0-3% di atas EMA50 (Uptrend Support)"
                        : "Harga berada 0-3% di bawah EMA50 (Downtrend Resistance)"}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySetup(currentSetup)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-300" />
                      <span>Salin Rencana Trade (TP/SL)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-gray-400">
              Harga saat ini berjarak lebih dari 3% dari EMA 50 ({selectedTF.toUpperCase()}), sehingga belum berada di zona ideal pullback retest.
            </div>
          )}
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
            <span className="text-gray-400 text-[11px]">EMA 21 &amp; 50 (1H)</span>
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
            {coin.tf1h.ema50 && (
              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                EMA50: ${formatUSD(coin.tf1h.ema50)}
              </div>
            )}
          </div>

          {/* EMA 4H Metric */}
          <div className="glass-card p-3 rounded-2xl">
            <span className="text-gray-400 text-[11px]">EMA 21 &amp; 50 (4H)</span>
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
            {coin.tf4h.ema50 && (
              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                EMA50: ${formatUSD(coin.tf4h.ema50)}
              </div>
            )}
          </div>

          {/* EMA 1D Metric */}
          <div className="glass-card p-3 rounded-2xl">
            <span className="text-gray-400 text-[11px]">EMA 21 &amp; 50 (1D)</span>
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
            {coin.tf1d.ema50 && (
              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                EMA50: ${formatUSD(coin.tf1d.ema50)}
              </div>
            )}
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
              Interaktif • Indikator &amp; Gambar Aktif
            </span>
          </div>

          <TradingViewWidget symbol={coin.symbol} />
        </div>

        {/* Intelligence Hub: Open Interest & Onchain Holders */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Derivatives &amp; Onchain Intelligence Hub</span>
          </div>

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

            {/* 2. Bubblemaps */}
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
                <span className="text-[10px] text-gray-400">Swaps &amp; Pools</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
            </a>

            {/* 4. CoinMarketCap */}
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
                <span className="text-[10px] text-gray-400">Contract &amp; Wallets</span>
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
