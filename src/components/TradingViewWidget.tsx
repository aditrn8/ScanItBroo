"use client";

import React, { useEffect, useRef, useState } from "react";

interface TradingViewWidgetProps {
  symbol: string; // e.g. BTCUSDT
}

export function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedInterval, setSelectedInterval] = useState<"60" | "240" | "D">("60");
  const [sourceExchange, setSourceExchange] = useState<"BITUNIX" | "BINANCE">("BITUNIX");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetBox = document.createElement("div");
    widgetBox.className = "tradingview-widget-container__widget";
    widgetBox.style.height = "calc(100% - 32px)";
    widgetBox.style.width = "100%";
    container.appendChild(widgetBox);

    const tvSymbol = `${sourceExchange}:${symbol}`;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: selectedInterval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(11, 15, 25, 1)",
      gridColor: "rgba(255, 255, 255, 0.05)",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      withdateranges: true,
      save_image: false,
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, selectedInterval, sourceExchange]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Quick Interval & Feed Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setSelectedInterval("60")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
              selectedInterval === "60"
                ? "bg-emerald-500 text-black shadow-glow-green"
                : "text-gray-400 hover:text-white"
            }`}
          >
            1 Jam (1H)
          </button>
          <button
            type="button"
            onClick={() => setSelectedInterval("240")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
              selectedInterval === "240"
                ? "bg-emerald-500 text-black shadow-glow-green"
                : "text-gray-400 hover:text-white"
            }`}
          >
            4 Jam (4H)
          </button>
          <button
            type="button"
            onClick={() => setSelectedInterval("D")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
              selectedInterval === "D"
                ? "bg-emerald-500 text-black shadow-glow-green"
                : "text-gray-400 hover:text-white"
            }`}
          >
            1 Hari (1D)
          </button>
        </div>

        {/* Exchange Feed Switcher */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span>Feed:</span>
          <button
            type="button"
            onClick={() => setSourceExchange("BITUNIX")}
            className={`px-2 py-0.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              sourceExchange === "BITUNIX"
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Bitunix
          </button>
          <button
            type="button"
            onClick={() => setSourceExchange("BINANCE")}
            className={`px-2 py-0.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              sourceExchange === "BINANCE"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
            title="Gunakan jika pair koin baru belum di-index TradingView Bitunix"
          >
            Binance Alt
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-[#0B0F19] shadow-inner"
      />
    </div>
  );
}
