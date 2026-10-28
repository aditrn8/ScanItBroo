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
  ArrowUpRight,
  Droplet,
  BarChart3,
  Play,
  Loader2,
  CheckCircle2,
  Square,
} from "lucide-react";
import { CustomDropdown, DropdownOption } from "./CustomDropdown";

export type VolumeFilterType = "all" | "illiquid" | "medium" | "liquid";
export type SortOptionType =
  | "default"
  | "dist1h_desc"
  | "dist1d_desc"
  | "gain_desc"
  | "vol_asc"
  | "vol_desc";

interface FilterControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  confluenceOnly: boolean;
  onConfluenceOnlyChange: (val: boolean) => void;
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
  const volumeOptions: DropdownOption<VolumeFilterType>[] = [
    {
      value: "illiquid",
      label: "Tidak Likuid",
      desc: "Turnover 24h < $500K (Low Cap / Illiquid Gems)",
      badge: "< $500K",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      value: "all",
      label: "Semua Volume",
      desc: "Seluruh pair USDT tanpa batas minimum volume",
      badge: "Semua",
      icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
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
      desc: "Prioritas 3 Timeframe lolos EMA & volume",
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      value: "dist1h_desc",
      label: "Jarak 1H",
      desc: "% Selisih harga di atas EMA 21 1H tertinggi",
      icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      value: "dist1d_desc",
      label: "Jarak 1D",
      desc: "% Selisih harga di atas EMA 21 1D tertinggi",
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      value: "gain_desc",
      label: "Gain 24h",
      desc: "Persentase kenaikan harga harian terbesar",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      value: "vol_asc",
      label: "Paling Illiquid",
      desc: "Volume turnover paling kecil ke besar",
      icon: <Droplet className="w-3.5 h-3.5 text-orange-400" />,
    },
    {
      value: "vol_desc",
      label: "Volume Terbesar",
      desc: "Volume turnover paling besar ke kecil",
      icon: <BarChart3 className="w-3.5 h-3.5 text-blue-400" />,
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

        {/* Row 2: Responsive Filter Controls & Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Controls Group */}
          <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
            {/* Confluence Checkbox Toggle */}
            <label className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer select-none transition-all active:scale-[0.98]">
              <input
                type="checkbox"
                checked={confluenceOnly}
                onChange={(e) => onConfluenceOnlyChange(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-gray-900 border-gray-700 focus:ring-0 cursor-pointer accent-emerald-500 shrink-0"
              />
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 whitespace-nowrap">
                1H • 4H • 1D &gt; EMA21
              </span>
            </label>

            {/* Custom Web3 Volume Dropdown */}
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

            {/* Custom Web3 Sort Dropdown */}
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
