"use client";

import React from "react";
import { RefreshCw, Zap, ShieldCheck, Square } from "lucide-react";

interface HeaderProps {
  isScanning: boolean;
  lastUpdated: number;
  totalPairs: number;
  scannedCount: number;
  onRefresh: () => void;
  onStopScan?: () => void;
}

export function Header({
  isScanning,
  lastUpdated,
  totalPairs,
  scannedCount,
  onRefresh,
  onStopScan,
}: HeaderProps) {
  const formatTime = (ts: number) => {
    if (!ts) return "Belum scan";
    const date = new Date(ts);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const progressPercent =
    totalPairs > 0 ? Math.round((scannedCount / totalPairs) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-3.5 sm:px-6 lg:px-8 py-3 mb-4 sm:mb-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center shadow-glow-green shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-emerald-400 bg-clip-text text-transparent">
                  ScanItBroo
                </h1>
                <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 whitespace-nowrap">
                  EMA 21
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[220px] sm:max-w-none">
                Bitunix Futures (1H • 4H • 1D)
              </p>
            </div>
          </div>

          {/* Quick Actions on Mobile */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {isScanning && onStopScan && (
              <button
                onClick={onStopScan}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              disabled={isScanning}
              className={`p-2 rounded-xl border transition-all ${
                isScanning
                  ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95"
              }`}
              title="Scan Ulang"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Scan Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] sm:text-xs text-gray-300 w-full sm:w-auto justify-center sm:justify-start">
            {isScanning ? (
              <>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium truncate">
                  Scanning ({scannedCount}/{totalPairs} • {progressPercent}%)
                </span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">
                  Updated: <strong className="text-white">{formatTime(lastUpdated)}</strong>
                </span>
              </>
            )}
          </div>

          {/* DoH Protected Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>DoH Bypass</span>
          </div>

          {/* Stop Scan Button on Desktop */}
          {isScanning && onStopScan && (
            <button
              onClick={onStopScan}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 cursor-pointer active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
              <span>Stop Scan</span>
            </button>
          )}

          {/* Refresh Button on desktop */}
          <button
            onClick={onRefresh}
            disabled={isScanning}
            className={`hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isScanning
                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-green cursor-pointer active:scale-95"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning..." : "Scan Ulang"}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Line */}
      {isScanning && (
        <div className="w-full bg-gray-800/60 h-1 mt-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </header>
  );
}
