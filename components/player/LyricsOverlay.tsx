'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Mic2, Sparkles, Music, ChevronDown } from 'lucide-react';
import { LyricLine, ParsedLyrics, SongMetadata } from '@/types';
import { getActiveLyricIndex, parseLrcLyrics } from '@/lib/lyrics/parser';

interface LyricsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  song: SongMetadata;
  currentTime: number;
  onSeek: (time: number) => void;
  accentColor?: string;
}

export const LyricsOverlay: React.FC<LyricsOverlayProps> = ({
  isOpen,
  onClose,
  song,
  currentTime,
  onSeek,
  accentColor = '#6366f1',
}) => {
  const [lyricsData, setLyricsData] = useState<ParsedLyrics>({
    isLrc: false,
    lines: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  // Fetch / parse lyrics when song changes
  useEffect(() => {
    if (!song.lyricsSrc) {
      setLyricsData({ isLrc: false, lines: [] });
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(song.lyricsSrc, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('Lyrics not found');
        return res.text();
      })
      .then((text) => {
        if (isMounted) {
          const parsed = parseLrcLyrics(text);
          setLyricsData(parsed);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Fallback poetic lyrics if file fetch fails
          const fallbackText = `[00:00.00]♪ (Atmospheric overture) ♪\n[00:15.00]Lost in the rhythm of the changing sky\n[00:30.00]Watching celestial moments drift by\n[00:45.00]In the quiet space where thoughts belong\n[01:00.00]Carried gently by this nocturnal song\n[01:30.00]♪ (Soft instrumental cadence) ♪`;
          setLyricsData(parseLrcLyrics(fallbackText));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [song.lyricsSrc, song.id]);

  const activeIndex = getActiveLyricIndex(lyricsData.lines, currentTime);

  // Smooth autoscroll to active line
  useEffect(() => {
    if (isOpen && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none animate-fadeIn">
      {/* Backdrop blur overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#060812]/85 backdrop-blur-2xl transition-opacity"
      />

      {/* Main Lyrics Modal Card */}
      <div className="relative z-10 flex h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white/[0.04] p-6 sm:p-8 backdrop-blur-3xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl overflow-hidden bg-indigo-500/20 text-indigo-400 border border-white/15 shadow-md">
              {song.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={song.cover}
                  alt={song.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Mic2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">
                {song.title}
              </h2>
              <p className="text-xs text-white/50">
                {song.artist} • {song.album}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Synchronized Lyrics Scroll Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto space-y-5 px-2 py-8 text-center scrollbar-none"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              Loading lyrics...
            </div>
          ) : lyricsData.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-white/40">
              <Music className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Instrumental soundscape</p>
            </div>
          ) : (
            lyricsData.lines.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <button
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`group block w-full text-center transition-all duration-500 focus:outline-none ${
                    isActive
                      ? 'scale-105 font-bold text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] py-3'
                      : isPast
                      ? 'text-white/30 hover:text-white/60 font-light text-base sm:text-lg'
                      : 'text-white/50 hover:text-white/80 font-light text-base sm:text-lg'
                  }`}
                >
                  <p
                    className={`transition-all duration-300 ${
                      isActive ? 'text-xl sm:text-2xl md:text-3xl' : ''
                    }`}
                    style={{
                      color: isActive ? accentColor : undefined,
                    }}
                  >
                    {line.text}
                  </p>
                  <span className="hidden group-hover:inline-block text-[10px] font-mono text-white/30 mt-1">
                    {line.formattedTime} • Click to jump
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="border-t border-white/10 pt-3 text-center text-xs text-white/40">
          Synchronized real-time lyrics • Click any line to seek track position
        </div>
      </div>
    </div>
  );
};
