"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Disc,
  ChevronDown,
  ChevronUp,
  X,
  Radio,
  Sparkles,
  ListMusic,
  Tv,
} from "lucide-react";

export interface MusicTrack {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  feat?: string;
  duration: string;
}

export const WEIRD_GENIUS_ALBUM: MusicTrack[] = [
  {
    id: "8uy7G2JXVSA",
    title: "Lathi",
    artist: "Weird Genius",
    feat: "Sara Fajira",
    duration: "3:10",
  },
  {
    id: "kjbbvtplYSk",
    title: "Sweet Scar",
    artist: "Weird Genius",
    feat: "Prince Husein",
    duration: "3:25",
  },
  {
    id: "BXlW3QH_5XY",
    title: "Last Summer",
    artist: "Tokyo Machine & Weird Genius",
    feat: "Lights",
    duration: "3:01",
  },
  {
    id: "M3xS3jGvUOE",
    title: "Future Ghost",
    artist: "Weird Genius",
    feat: "Violette Wautier",
    duration: "3:18",
  },
  {
    id: "J7-aX9K6p9E",
    title: "All In",
    artist: "Weird Genius",
    feat: "League of Legends: Wild Rift",
    duration: "2:54",
  },
  {
    id: "pT7Vv4j1qFw",
    title: "Glorious",
    artist: "Weird Genius",
    feat: "LTZ (FIFA Official)",
    duration: "3:40",
  },
];

export function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);

  const currentTrack = WEIRD_GENIUS_ALBUM[currentTrackIndex];

  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % WEIRD_GENIUS_ALBUM.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) =>
      prev === 0 ? WEIRD_GENIUS_ALBUM.length - 1 : prev - 1
    );
    setIsPlaying(true);
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  return (
    <>
      {/* 1. YouTube Hidden / Visible IFrame Embed */}
      {isPlaying && (
        <div
          className={`fixed transition-all duration-300 z-50 ${
            showVideo && isOpen
              ? "bottom-24 right-4 w-72 h-44 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-black"
              : "w-0 h-0 opacity-0 pointer-events-none"
          }`}
        >
          <iframe
            key={currentTrack.id}
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${currentTrack.id}?autoplay=1&enablejsapi=1&rel=0`}
            title={currentTrack.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      )}

      {/* 2. Minimized Floating Vibe Bar (Docked Bottom Left) */}
      {!isOpen && (
        <div className="fixed bottom-4 left-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#0a0f18]/90 hover:bg-[#0e1624] border border-emerald-500/30 hover:border-emerald-500/60 shadow-glow-green/20 backdrop-blur-xl transition-all cursor-pointer active:scale-95"
          >
            {/* Spinning Disc */}
            <div className="relative flex items-center justify-center">
              <Disc
                className={`w-5 h-5 text-emerald-400 ${
                  isPlaying ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "3s" }}
              />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute" />
            </div>

            {/* Track Info & Equalizer */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-black text-white group-hover:text-emerald-300 transition-colors truncate max-w-[120px] sm:max-w-[150px]">
                  {currentTrack.title}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  WG
                </span>
              </div>
              <span className="text-[9px] text-gray-400 truncate max-w-[120px] sm:max-w-[150px]">
                {currentTrack.artist} {currentTrack.feat ? `ft. ${currentTrack.feat}` : ""}
              </span>
            </div>

            {/* Animated Equalizer Wave */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3.5 px-1">
                <span className="w-0.5 h-full bg-emerald-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-2/3 bg-cyan-400 rounded-full animate-bounce" />
                <span className="w-0.5 h-4/5 bg-teal-400 rounded-full animate-pulse" />
              </div>
            )}

            {/* Quick Play/Pause Toggle button */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handlePlayToggle();
              }}
              className="p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-green transition-all ml-1"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-black" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
              )}
            </div>
          </button>
        </div>
      )}

      {/* 3. Expanded Futuristic Web3 Music Player Deck */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 z-40 w-80 sm:w-96 rounded-3xl bg-[#090d16]/95 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white tracking-wider flex items-center gap-1.5">
                  WEIRD GENIUS VIBE DECK
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </span>
                <span className="text-[10px] text-gray-400">
                  Trading Soundtrack • YouTube Audio
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowVideo(!showVideo)}
                title={showVideo ? "Sembunyikan Video" : "Tampilkan Video"}
                className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  showVideo
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-white/5 text-gray-400 hover:text-white border-white/10"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Minimize Player"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Currently Playing Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0d1624] to-cyan-950/40 p-3.5 border border-white/10 mb-3">
            <div className="flex items-center gap-3">
              {/* Vinyl Disc Animation */}
              <div
                className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-gray-900 via-gray-800 to-black border-2 border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg ${
                  isPlaying ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "4s" }}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-400/80 border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
              </div>

              {/* Title & Artist */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white truncate">
                    {currentTrack.title}
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-400 shrink-0">
                    {currentTrack.duration}
                  </span>
                </div>
                <p className="text-xs text-emerald-300/80 truncate">
                  {currentTrack.artist}
                </p>
                {currentTrack.feat && (
                  <p className="text-[10px] text-gray-400 truncate">
                    feat. {currentTrack.feat}
                  </p>
                )}
              </div>
            </div>

            {/* Audio Wave Meter */}
            <div className="flex items-center justify-between gap-1 mt-3 px-1">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? "bg-gradient-to-t from-emerald-500 to-cyan-400"
                      : "bg-gray-700 h-1"
                  }`}
                  style={{
                    height: isPlaying
                      ? `${Math.max(4, Math.sin(i * 0.8 + currentTrackIndex) * 16 + 12)}px`
                      : "4px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-2 px-1 mb-3">
            <button
              type="button"
              onClick={() => setShowTracklist(!showTracklist)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showTracklist
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-white/5 text-gray-400 hover:text-white border-white/10"
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Playlist ({WEIRD_GENIUS_ALBUM.length})</span>
            </button>

            {/* Player Controls (Prev / Play / Next) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95"
                title="Lagu Sebelumnya"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handlePlayToggle}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black shadow-glow-green transition-all cursor-pointer active:scale-95"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95"
                title="Lagu Berikutnya"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Tracklist */}
          {showTracklist && (
            <div className="mt-2 pt-2 border-t border-white/10 max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
              {WEIRD_GENIUS_ALBUM.map((track, idx) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(idx)}
                  className={`flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    currentTrackIndex === idx
                      ? "bg-emerald-500/15 border border-emerald-500/35 text-white shadow-glow-green/10"
                      : "bg-white/[0.03] hover:bg-white/10 border border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold w-4 text-gray-500">
                      {idx + 1}.
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">
                        {track.title}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {track.artist} {track.feat ? `ft. ${track.feat}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {currentTrackIndex === idx && isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                    <span className="text-[10px] font-mono text-gray-400">
                      {track.duration}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
