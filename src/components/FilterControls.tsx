"use client";

import React from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  Globe,
  Sparkles,
  Rocket,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Droplet,
  BarChart3,
  Play,
  Loader2,
  CheckCircle2,
  Square,
  Target,
  Clock,
  Layers,
} from "lucide-react";
import { CustomDropdown, DropdownOption } from "./CustomDropdown";

export type VolumeFilterType = "all" | "illiquid" | "medium" | "liquid";
export type SignalFilterType = "all" | "long" | "short";
export type TimeframeFilterType = "1h" | "4h" | "1d";
export type SortOptionType =
  | "default"
  | "dist1h_desc"
  | "dist1d_desc"
  | "gain_desc"
  | "vol_asc"
  | "vol_desc"
  | "rr_desc"
  | "ema50_asc";

interface FilterControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  confluenceOnly: boolean;
  onConfluenceOnlyChange: (val: boolean) => void;
  signalFilter: SignalFilterType;
  onSignalFilterChange: (val: SignalFilterType) => void;
  timeframeFilter: TimeframeFilterType;
  onTimeframeFilterChange: (val: TimeframeFilterType) => void;
  volumeFilter: VolumeFilterType;
  onVolumeFilterChange: (val: VolumeFilterType) => void;
  sortBy: SortOptionType;
  onSortByChange: (val: SortOptionType) => void;
  filteredCount: number;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan?: () => void;
  hasScanned: boolean;
}

export function FilterControls({
  search,
  onSearchChange,
  confluenceOnly,
  onConfluenceOnlyChange,
  signalFilter,
  onSignalFilterChange,
  timeframeFilter,
  onTimeframeFilterChange,
  volumeFilter,
  onVolumeFilterChange,
  sortBy,
  onSortByChange,
  filteredCount,
  isScanning,
  onStartScan,
  onStopScan,
  hasScanned,
}: FilterControlsProps) {
  const signalOptions: DropdownOption<SignalFilterType>[] = [
    {
      value: "all",
      label: "Semua Setup",
      desc: "Tampilkan seluruh pair tanpa batasan filter EMA 50",
      badge: "Semua",
      icon: <Layers className="w-3.5 h-3.5 text-gray-300" />,
    },
    {
      value: "long",
      label: "🟢 Long Setup",
      desc: "Harga 0% s/d +3% di atas EMA 50 (Pullback Retest Support)",
      badge: "0 s/d +3%",
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      value: "short",
      label: "🔴 Short Setup",
      desc: "Harga 0% s/d -3% di bawah EMA 50 (Rejection Retest Resistance)",
      badge: "0 s/d -3%",
      icon: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
    },
  ];

  const timeframeOptions: DropdownOption<TimeframeFilterType>[] = [
    {
      value: "1h",
      label: "1 Jam (1H)",
      desc: "Timeframe 1 Jam untuk setup Day Trading & Scalping",
      badge: "1H",
      icon: <Clock className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      value: "4h",
      label: "4 Jam (4H)",
      desc: "Timeframe 4 Jam untuk setup Swing Trading yang lebih stabil",
      badge: "4H",
      icon: <Clock className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      value: "1d",
      label: "1 Hari (1D)",
      desc: "Timeframe Daily untuk tren makro utama",
      badge: "1D",
      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  const volumeOptions: DropdownOption<VolumeFilterType>[] = [
    {
      value: "all",
      label: "Semua Volume",
      desc: "Seluruh pair USDT tanpa batas minimum volume",
      badge: "Semua",
      icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      value: "illiquid",
      label: "Tidak Likuid",
      desc: "Turnover 24h < $500K (Low Cap / Illiquid Gems)",
      badge: "< $500K",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      value: "medium",
      label: "Volume Sedang",
      desc: "Turnover 24h antara $500K s/d $5M",
      badge: "$500K-$5M",
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      value: "liquid",
      label: "Likuid Tinggi",
      desc: "Turnover 24h > $5M (Major pairs)",
      badge: "> $5M",
      icon: <Rocket className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  const sortOptions: DropdownOption<SortOptionType>[] = [
    {
      value: "default",
      label: "Default",
      desc: "Prioritas sinyal aktif, confluence, lalu volume",
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      value: "ema50_asc",
      label: "Terdekat EMA50",
      desc: "Paling mendekati garis EMA 50 (jarak 0%)",
      icon: <Target className="w-3.5 h-3.5 text-pink-400" />,
    },
    {
      value: "rr_desc",
      label: "Potensi TP2 (R:R)",
      desc: "Persentase potensi keuntungan TP2 terbesar",
      icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      value: "gain_desc",
      label: "Gain 24h",
      desc: "Persentase kenaikan harga harian terbesar",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      value: "vol_desc",
      label: "Volume Terbesar",
      desc: "Volume turnover paling besar ke kecil",
      icon: <BarChart3 className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      value: "vol_asc",
      label: "Paling Illiquid",
      desc: "Volume turnover paling kecil ke besar",
      icon: <Droplet className="w-3.5 h-3.5 text-orange-400" />,
    },
  ];

  return (
    <div className="glass-panel p-3.5 sm:p-4 rounded-2xl mb-6 relative z-30">
      <div className="flex flex-col gap-3">
        {/* Row 1: Search Bar & Result Badge */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari simbol (SOL, DOGE, PEPE)..."
              className="w-full pl-10 pr-8 py-2.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            )}
          </div>

          {hasScanned && (
            <div className="shrink-0 px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] sm:text-xs text-emerald-300 font-bold whitespace-nowrap">
              {filteredCount} Koin
            </div>
          )}
        </div>

        {/* Row 2: Filter Controls Grid */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
          {/* Controls Group */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
            {/* 1. Sinyal EMA 50 Filter (Long / Short / All) */}
            <div className="w-full sm:w-auto">
              <CustomDropdown
                value={signalFilter}
                options={signalOptions}
                onChange={onSignalFilterChange}
                prefixLabel="Sinyal"
                icon={<Target className="w-3.5 h-3.5 text-emerald-400" />}
                align="left"
              />
            </div>

            {/* 2. Timeframe Acuan EMA 50 */}
            <div className="w-full sm:w-auto">
              <CustomDropdown
                value={timeframeFilter}
                options={timeframeOptions}
                onChange={onTimeframeFilterChange}
                prefixLabel="TF"
                icon={<Clock className="w-3.5 h-3.5 text-cyan-400" />}
                align="left"
              />
            </div>

            {/* 3. Confluence Checkbox Toggle */}
            <label className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer select-none transition-all active:scale-[0.98]">
              <input
                type="checkbox"
                checked={confluenceOnly}
                onChange={(e) => onConfluenceOnlyChange(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-gray-900 border-gray-700 focus:ring-0 cursor-pointer accent-emerald-500 shrink-0"
              />
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 whitespace-nowrap">
                3TF &gt; EMA21
              </span>
            </label>

            {/* 4. Volume Dropdown */}
            <div className="w-full sm:w-auto">
              <CustomDropdown
                value={volumeFilter}
                options={volumeOptions}
                onChange={onVolumeFilterChange}
                prefixLabel="Vol"
                icon={<Filter className="w-3.5 h-3.5" />}
                align="left"
              />
            </div>

            {/* 5. Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <CustomDropdown
                value={sortBy}
                options={sortOptions}
                onChange={onSortByChange}
                prefixLabel="Urut"
                icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                align="right"
              />
            </div>
          </div>

          {/* Action Buttons: Mulai Scan & Stop Scan */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            {isScanning && onStopScan && (
              <button
                type="button"
                onClick={onStopScan}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 select-none cursor-pointer active:scale-[0.98]"
              >
                <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={onStartScan}
              disabled={isScanning}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all select-none cursor-pointer active:scale-[0.98] ${
                isScanning
                  ? "bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black shadow-glow-green"
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>{hasScanned ? "Scan Ulang" : "Mulai Scan"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

