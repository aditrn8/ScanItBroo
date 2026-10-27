"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="glass-panel p-3.5 sm:p-4 rounded-2xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Left: Summary text & Page size selector */}
      <div className="flex items-center gap-3 text-gray-400 order-2 sm:order-1">
        <span>
          Menampilkan <strong className="text-white">{startItem}</strong> -{" "}
          <strong className="text-white">{endItem}</strong> dari{" "}
          <strong className="text-emerald-400 font-bold">{totalItems}</strong> koin
        </span>

        {onPageSizeChange && (
          <div className="hidden xs:flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
            <span className="text-gray-500">Per hal:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value={6} className="bg-gray-900 text-white">6</option>
              <option value={9} className="bg-gray-900 text-white">9</option>
              <option value={12} className="bg-gray-900 text-white">12</option>
              <option value={18} className="bg-gray-900 text-white">18</option>
              <option value={24} className="bg-gray-900 text-white">24</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1 order-1 sm:order-2 select-none">
        {/* First Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-gray-500">
                  ...
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-emerald-500 text-black shadow-glow-green"
                    : "border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
