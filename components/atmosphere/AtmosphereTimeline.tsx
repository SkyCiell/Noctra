'use client';

import React from 'react';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Sparkles,
  Flame,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { AstronomicalData, DailyForecastData } from '@/types';
import { formatLocalTime } from '@/lib/utils/formatters';

interface AtmosphereTimelineProps {
  astro: AstronomicalData;
  daily: DailyForecastData;
  timezone: string;
  simulatedHour: number; // 0 to 24 (float)
  onScrubHour: (hour: number) => void;
  onReset: () => void;
  isScrubbed: boolean;
  accentColor?: string;
}

export const AtmosphereTimeline: React.FC<AtmosphereTimelineProps> = ({
  astro,
  timezone,
  simulatedHour,
  onScrubHour,
  onReset,
  isScrubbed,
  accentColor = '#6366f1',
}) => {
  // Parse celestial event hours
  const parseHourFromIso = (isoStr?: string) => {
    if (!isoStr) return 12;
    try {
      const d = new Date(isoStr);
      return d.getHours() + d.getMinutes() / 60;
    } catch {
      return 12;
    }
  };

  const sunriseHour = parseHourFromIso(astro.sunriseTime);
  const sunsetHour = parseHourFromIso(astro.sunsetTime);
  const noonHour = (sunriseHour + sunsetHour) / 2;
  const ghMorningHour = Math.max(0, sunriseHour + 0.5);
  const ghEveningHour = Math.max(0, sunsetHour - 0.75);

  const markers = [
    { label: 'Dawn', hour: Math.max(0, sunriseHour - 0.75), icon: Sunrise, color: 'text-violet-300' },
    { label: 'Sunrise', hour: sunriseHour, icon: Sun, color: 'text-amber-400' },
    { label: 'Golden Hour', hour: ghMorningHour, icon: Flame, color: 'text-orange-400' },
    { label: 'Noon', hour: noonHour, icon: Sun, color: 'text-yellow-300' },
    { label: 'Golden Hour', hour: ghEveningHour, icon: Flame, color: 'text-amber-500' },
    { label: 'Sunset', hour: sunsetHour, icon: Sunset, color: 'text-rose-400' },
    { label: 'Midnight', hour: 0, icon: Moon, color: 'text-indigo-400' },
  ];

  const formatHourString = (h: number) => {
    const hours = Math.floor(h) % 24;
    const mins = Math.floor((h % 1) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-white/5 p-3.5 sm:p-6 backdrop-blur-2xl border border-white/10 shadow-2xl transition hover:border-white/15 select-none my-3">
      {/* Header with Title and Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-white">
            Atmosphere Solar Timeline
          </h3>
          <span className="hidden md:inline-block text-xs text-white/40">
            • Drag to preview celestial conditions
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {isScrubbed ? (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] sm:text-xs font-medium text-amber-300 backdrop-blur-md border border-amber-500/30 hover:bg-amber-500/30 transition active:scale-95"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset to Live Time</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Atmosphere</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive 24-Hour Timeline Bar */}
      <div className="relative pt-6 pb-2 px-1">
        {/* Visual Sky Gradient Arc Background */}
        <div className="relative h-10 w-full rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#070b19] via-[#2e1065] via-[#ea580c] via-[#38bdf8] via-[#e11d48] via-[#1e1b4b] to-[#070b19] shadow-inner">
          {/* Day / Night Horizon divider line */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" />

          {/* Marker indicators */}
          {markers.map((m, idx) => {
            const leftPercent = (m.hour / 24) * 100;
            return (
              <div
                key={idx}
                className="absolute top-0 bottom-0 flex flex-col items-center justify-center -translate-x-1/2 pointer-events-none"
                style={{ left: `${leftPercent}%` }}
              >
                <div className="h-full w-[1px] bg-white/20" />
              </div>
            );
          })}
        </div>

        {/* Range Scrubber Input Overlay */}
        <input
          type="range"
          min="0"
          max="23.9"
          step="0.1"
          value={simulatedHour}
          onChange={(e) => onScrubHour(parseFloat(e.target.value))}
          className="absolute inset-x-1 bottom-2 h-10 opacity-0 cursor-pointer z-20"
        />

        {/* Active Thumb / Cursor Marker (Clamped to avoid edge clipping) */}
        <div
          className="absolute bottom-2 -translate-x-1/2 pointer-events-none transition-all duration-75 z-10"
          style={{
            left: `calc(16px + ${(simulatedHour / 24) * 100}% * (100% - 32px) / 100)`,
          }}
        >
          <div className="flex flex-col items-center">
            {/* Tooltip bubble */}
            <div
              className="rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-white shadow-xl border -translate-y-1 whitespace-nowrap"
              style={{
                backgroundColor: accentColor,
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            >
              {formatHourString(simulatedHour)}
            </div>
            {/* Scrubber pointer bar */}
            <div className="h-10 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          </div>
        </div>
      </div>

      {/* Quick Jump Celestial Milestones */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
        {markers.slice(0, 6).map((m, idx) => {
          const Icon = m.icon;
          return (
            <button
              key={idx}
              onClick={() => onScrubHour(m.hour)}
              className="group flex flex-col items-center justify-center rounded-2xl bg-white/5 p-2 text-center backdrop-blur-md border border-white/5 hover:bg-white/10 hover:border-white/20 transition"
            >
              <Icon className={`h-4 w-4 mb-1 ${m.color} transition group-hover:scale-110`} />
              <span className="text-[11px] font-medium text-white/90">{m.label}</span>
              <span className="text-[10px] font-mono text-white/50">
                {formatHourString(m.hour)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
