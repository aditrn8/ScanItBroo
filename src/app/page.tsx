"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import {
  FilterControls,
  VolumeFilterType,
  SortOptionType,
} from "@/components/FilterControls";
import { CoinCard } from "@/components/CoinCard";
import { Pagination } from "@/components/Pagination";
import { CoinDetailModal } from "@/components/CoinDetailModal";
import { ScannedCoin, ScanApiResponse } from "@/types/crypto";
import {
  Zap,
  Loader2,
  AlertCircle,
  Play,
  Flame,
  Globe,
  Rocket,
  Radio,
  Square,
} from "lucide-react";

export default function HomePage() {
  const [coins, setCoins] = useState<ScannedCoin[]>([]);
  const [summary, setSummary] = useState<ScanApiResponse["summary"]>({
    totalPairs: 0,
    scannedCount: 0,
    confluenceCount: 0,
    lastUpdated: 0,
    isScanning: false,
    scanDurationMs: 0,
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [search, setSearch] = useState("");
  const [confluenceOnly, setConfluenceOnly] = useState(true);
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilterType>("illiquid");
  const [sortBy, setSortBy] = useState<SortOptionType>("default");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Selected coin for Detail Modal
  const [selectedCoin, setSelectedCoin] = useState<ScannedCoin | null>(null);

  // Fetch only cache without forcing background scan
  const fetchScanData = useCallback(async () => {
    try {
      const res = await fetch("/api/scan");
      const json: ScanApiResponse = await res.json();

      if (json.data) {
        setCoins(json.data);
      }
      if (json.summary) {
        setSummary(json.summary);
      }
    } catch (err) {
      console.error("Error fetching scan data:", err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  // Initial read on mount
  useEffect(() => {
    fetchScanData();
  }, [fetchScanData]);

  // Progressive live polling: Poll every 1.5s while scanning so new coins pop up live!
  useEffect(() => {
    if (!summary.isScanning) return;

    const timer = setInterval(() => {
      fetchScanData();
    }, 1500);

    return () => clearInterval(timer);
  }, [summary.isScanning, fetchScanData]);

  // Trigger scan on demand
  const handleStartScan = async () => {
    try {
      setCurrentPage(1);
      await fetch("/api/scan", { method: "POST" });
      setSummary((prev) => ({ ...prev, isScanning: true, scannedCount: 0 }));
      // Quick poll after trigger
      setTimeout(() => fetchScanData(), 600);
    } catch (err) {
      console.error("Failed to trigger scan:", err);
    }
  };

  // Stop scan on demand
  const handleStopScan = async () => {
    try {
      await fetch("/api/scan?action=stop", { method: "POST" });
      setSummary((prev) => ({ ...prev, isScanning: false }));
      setTimeout(() => fetchScanData(), 400);
    } catch (err) {
      console.error("Failed to stop scan:", err);
    }
  };

  // Reset page to 1 when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleConfluenceChange = (val: boolean) => {
    setConfluenceOnly(val);
    setCurrentPage(1);
  };

  const handleVolumeFilterChange = (val: VolumeFilterType) => {
    setVolumeFilter(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: SortOptionType) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredCoins = useMemo(() => {
    return coins
      .filter((coin) => {
        // 1. Search Filter
        if (
          search.trim() &&
          !coin.symbol.toLowerCase().includes(search.toLowerCase()) &&
          !coin.baseAsset.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }

        // 2. Confluence Filter (1H + 4H + 1D > EMA 21)
        if (confluenceOnly && !coin.isConfluence) {
          return false;
        }

        // 3. Volume Liquidity Filter
        if (volumeFilter === "illiquid" && coin.volume24h >= 500000) {
          return false;
        }
        if (
          volumeFilter === "medium" &&
          (coin.volume24h < 500000 || coin.volume24h > 5000000)
        ) {
          return false;
        }
        if (volumeFilter === "liquid" && coin.volume24h <= 5000000) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "dist1h_desc") {
          return b.tf1h.diffPercent - a.tf1h.diffPercent;
        }
        if (sortBy === "dist1d_desc") {
          return b.tf1d.diffPercent - a.tf1d.diffPercent;
        }
        if (sortBy === "gain_desc") {
          return b.change24h - a.change24h;
        }
        if (sortBy === "vol_asc") {
          return a.volume24h - b.volume24h;
        }
        if (sortBy === "vol_desc") {
          return b.volume24h - a.volume24h;
        }
        // Default: Confluence first, then volume
        if (a.isConfluence && !b.isConfluence) return -1;
        if (!a.isConfluence && b.isConfluence) return 1;
        return b.volume24h - a.volume24h;
      });
  }, [coins, search, confluenceOnly, volumeFilter, sortBy]);

  // Paginated Coins
  const paginatedCoins = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCoins.slice(startIndex, startIndex + pageSize);
  }, [filteredCoins, currentPage, pageSize]);

  // Auto-clamp page if items shrink
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredCoins.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredCoins.length, pageSize, currentPage]);

  const hasData = coins.length > 0;
  const hasEverScanned = hasData || summary.lastUpdated > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <Header
        isScanning={summary.isScanning}
        lastUpdated={summary.lastUpdated}
        totalPairs={summary.totalPairs}
        scannedCount={summary.scannedCount}
        onRefresh={handleStartScan}
        onStopScan={handleStopScan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pb-12">
        {/* Stats Bento Bar (visible when data exists or scanning) */}
        {(hasData || summary.isScanning) && (
          <StatsBar coins={coins} totalScanned={summary.totalPairs || coins.length} />
        )}

        {/* Filter Controls Bar with Custom Dropdowns */}
        <FilterControls
          search={search}
          onSearchChange={handleSearchChange}
          confluenceOnly={confluenceOnly}
          onConfluenceOnlyChange={handleConfluenceChange}
          volumeFilter={volumeFilter}
          onVolumeFilterChange={handleVolumeFilterChange}
          sortBy={sortBy}
          onSortByChange={handleSortByChange}
          filteredCount={filteredCoins.length}
          isScanning={summary.isScanning}
          onStartScan={handleStartScan}
          onStopScan={handleStopScan}
          hasScanned={hasEverScanned}
        />

        {/* Live Scanning Banner (Shows when scanning is in progress) */}
        {summary.isScanning && (
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl mb-4 border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse-subtle">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300">
                    Live Stream Scanning Aktif
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-mono">
                    {summary.scannedCount} / {summary.totalPairs || "..."} Pairs
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Koin yang memenuhi kriteria langsung muncul di bawah secara bertahap
                  tanpa menunggu selesai.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[11px] text-emerald-400 font-semibold px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                Ditemukan: {filteredCoins.length} Koin
              </div>
              <button
                type="button"
                onClick={handleStopScan}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                <span>Stop Scan</span>
              </button>
            </div>
          </div>
        )}

        {/* State 1: Belum Pernah Scan (Hero Configuration State) */}
        {!hasData && !summary.isScanning && (
          <div className="glass-panel rounded-3xl p-5 sm:p-8 lg:p-14 text-center flex flex-col items-center justify-center relative overflow-hidden border border-white/10 my-2 sm:my-4 shadow-2xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] sm:text-xs font-semibold mb-4 sm:mb-5">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Bitunix Scanner Siap Digunakan</span>
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white max-w-2xl mb-3 sm:mb-4 leading-snug sm:leading-tight">
              Pilih Filter Favorit Kamu, Lalu Tekan{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Mulai Scan
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mb-6 sm:mb-8 leading-relaxed">
              Atur volume likuiditas & timeframe di atas. Saat tombol ditekan, koin yang
              lolos kriteria akan <strong>langsung muncul live satu per satu</strong> di
              layar secara bertahap.
            </p>

            {/* Filter Preset Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-2xl mb-6 sm:mb-8">
              <button
                type="button"
                onClick={() => {
                  handleVolumeFilterChange("illiquid");
                  handleConfluenceChange(true);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                  volumeFilter === "illiquid"
                    ? "bg-amber-500/15 border-amber-500/40 text-white shadow-glow-cyan"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold">Preset 1: Illiquid Gems</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Turnover &lt; $500K • Potensi pump tinggi
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleVolumeFilterChange("all");
                  handleConfluenceChange(true);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                  volumeFilter === "all"
                    ? "bg-cyan-500/15 border-cyan-500/40 text-white shadow-glow-cyan"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs font-bold">Preset 2: Semua Volume</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Scan seluruh pair USDT tanpa batasan
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleVolumeFilterChange("liquid");
                  handleConfluenceChange(true);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                  volumeFilter === "liquid"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-white shadow-glow-green"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold">Preset 3: Likuid Tinggi</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Volume &gt; $5M untuk pair berkapitalisasi besar
                </p>
              </button>
            </div>

            {/* Big Action Button */}
            <button
              onClick={handleStartScan}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-extrabold text-sm shadow-glow-green transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black shrink-0" />
              <span>Mulai Scan Pasar Sekarang</span>
            </button>
          </div>
        )}

        {/* State 2: Sedang Scanning Pertama Kali tapi belum ada coin match */}
        {!hasData && summary.isScanning && (
          <div className="glass-panel rounded-3xl p-8 sm:p-16 text-center flex flex-col items-center justify-center my-4 border border-white/10">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 animate-spin mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Memulai Pemindaian Real-Time...
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-4">
              Mengambil kline 1H, 4H, dan 1D dari Bitunix. Begitu ada koin yang cocok,
              kartunya langsung muncul di sini.
            </p>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-300 font-mono">
              Terproses: {summary.scannedCount} / {summary.totalPairs || "..."} pairs
            </div>
          </div>
        )}

        {/* State 3: Menampilkan Hasil Kartu Koin + Pagination */}
        {filteredCoins.length > 0 && (
          <div>
            {/* Grid of Coins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paginatedCoins.map((coin) => (
                <CoinCard
                  key={coin.symbol}
                  coin={coin}
                  onSelect={(c) => setSelectedCoin(c)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredCoins.length}
              pageSize={pageSize}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 180, behavior: "smooth" });
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        {/* State 4: Data Ada tapi Tidak Ada yang Sesuai Filter */}
        {hasData && filteredCoins.length === 0 && !summary.isScanning && (
          <div className="glass-panel rounded-3xl p-8 sm:p-16 text-center flex flex-col items-center justify-center my-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-400">
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              Tidak Ada Koin yang Memenuhi Kriteria Filter Saat Ini
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-6">
              Coba ubah filter volume likuiditas atau matikan centang &quot;1H • 4H •
              1D &gt; EMA21&quot; untuk melihat koin lain.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  handleSearchChange("");
                  handleVolumeFilterChange("all");
                  handleConfluenceChange(false);
                }}
                className="px-4 py-2.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer text-center"
              >
                Reset Filter
              </button>
              <button
                onClick={handleStartScan}
                className="px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-black transition-all cursor-pointer shadow-glow-green text-center"
              >
                Scan Ulang
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 sm:py-6 text-center text-[10px] sm:text-xs text-gray-500 px-4">
        <p>
          ScanItBroo &copy; 2026 &bull; Bitunix Public Data Scanner &bull; Multi-Timeframe
          EMA 21 Confluence Engine
        </p>
      </footer>

      {/* Coin Detail Modal with TradingView Chart & Funding Rate */}
      <CoinDetailModal
        coin={selectedCoin}
        onClose={() => setSelectedCoin(null)}
      />
    </div>
  );
}
