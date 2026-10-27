"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  desc?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (val: T) => void;
  prefixLabel?: string;
  icon?: React.ReactNode;
  align?: "left" | "right";
}

export function CustomDropdown<T extends string>({
  value,
  options,
  onChange,
  prefixLabel,
  icon,
  align = "right",
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium transition-all duration-200 select-none cursor-pointer border ${
          isOpen
            ? "bg-slate-800/95 border-emerald-500/50 shadow-glow-green text-white ring-1 ring-emerald-500/30"
            : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:border-white/20 active:scale-[0.98]"
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          {prefixLabel && (
            <span className="text-gray-400 font-normal shrink-0 hidden xs:inline">
              {prefixLabel}:
            </span>
          )}
          <span className="flex items-center gap-1.5 font-semibold text-white truncate">
            <span className="shrink-0">{selectedOption?.icon}</span>
            <span className="truncate">{selectedOption?.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedOption?.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden xs:inline-block">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-emerald-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Glassmorphism Floating Popover Menu */}
      {isOpen && (
        <div
          className={`absolute z-[100] mt-2 w-[calc(100vw-2.5rem)] xs:w-72 max-w-[320px] rounded-2xl bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-150 ${
            align === "left" ? "left-0" : "right-0 sm:right-0 left-auto"
          } max-sm:left-1/2 max-sm:-translate-x-1/2`}
        >
          <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-start justify-between w-full px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-white shadow-sm"
                      : "hover:bg-white/5 text-gray-300 hover:text-white border border-transparent active:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 text-emerald-400 shrink-0">{opt.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-emerald-300" : "text-gray-200"
                          }`}
                        >
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/10 text-gray-300 shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.desc && (
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                          {opt.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-0.5 ml-2 p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
