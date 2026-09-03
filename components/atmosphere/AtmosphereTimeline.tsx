'use client';

import React from 'react';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Flame,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { AstronomicalData, DailyForecastData } from '@/types';
import { getLocalHourInTimezone } from '@/lib/utils/formatters';

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
  // Parse celestial event hours in the target timezone
  const parseHourFromIso = (isoStr?: string) => {
    if (!isoStr) return 12;
    try {
      if (isoStr.includes('Z') || isoStr.match(/[+-]\d{2}:\d{2}$/)) {
        return getLocalHourInTimezone(new Date(isoStr), timezone);
      }
      const match = isoStr.match(/T(\d{1,2}):(\d{2})/);
      if (match) {
        return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
      }
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        return getLocalHourInTimezone(d, timezone);
      }
      return 12;
    } catch {
      return 12;
    }
  };

  const sunriseHour = parseHourFromIso(astro.sunriseTime);
  const sunsetHour = parseHourFromIso(astro.sunsetTime);
  const noonHour = (sunriseHour + sunsetHour) / 2;
  const dawnHour = Math.max(0, sunriseHour - 0.75);
  const ghMorningHour = Math.max(0, sunriseHour + 0.5);
  const ghEveningHour = Math.max(0, sunsetHour - 0.75);
  const duskHour = Math.min(24, sunsetHour + 0.75);

  const markers = [
    { label: 'Dawn', hour: dawnHour, icon: Sunrise, color: 'text-violet-300' },
    { label: 'Sunrise', hour: sunriseHour, icon: Sun, color: 'text-amber-400' },
    { label: 'Golden Hour', hour: ghMorningHour, icon: Flame, color: 'text-orange-400' },
    { label: 'Noon', hour: noonHour, icon: Sun, color: 'text-yellow-300' },
    { label: 'Golden Hour', hour: ghEveningHour, icon: Flame, color: 'text-amber-500' },
    { label: 'Sunset', hour: sunsetHour, icon: Sunset, color: 'text-rose-400' },
  ];

  const formatHourString = (h: number) => {
    const clamped = Math.max(0, Math.min(h, 23.99));
    const hours = Math.floor(clamped) % 24;
    const mins = Math.floor((clamped % 1) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const isNearMarker = (hour: number) => Math.abs(simulatedHour - hour) < 0.35;

  // Normalized progress (0 to 1) for exact pixel positioning
  const progressRatio = Math.max(0, Math.min(simulatedHour / 24, 1));

  // Dynamic sky gradient based on real solar events of the city
  const dawnPct = ((dawnHour / 24) * 100).toFixed(1);
  const sunrisePct = ((sunriseHour / 24) * 100).toFixed(1);
  const ghMorningPct = ((ghMorningHour / 24) * 100).toFixed(1);
  const noonPct = ((noonHour / 24) * 100).toFixed(1);
  const ghEveningPct = ((ghEveningHour / 24) * 100).toFixed(1);
  const sunsetPct = ((sunsetHour / 24) * 100).toFixed(1);
  const duskPct = ((duskHour / 24) * 100).toFixed(1);

  const dynamicSkyGradient = `linear-gradient(to right,
    #050814 0%,
    #0b112c ${Math.max(0, Number(dawnPct) - 8)}%,
    #2e1065 ${dawnPct}%,
    #ea580c ${sunrisePct}%,
    #fbbf24 ${ghMorningPct}%,
    #38bdf8 ${Math.max(0, Number(noonPct) - 10)}%,
    #60a5fa ${noonPct}%,
    #38bdf8 ${Math.min(100, Number(noonPct) + 10)}%,
    #f59e0b ${ghEveningPct}%,
    #e11d48 ${sunsetPct}%,
    #1e1b4b ${duskPct}%,
    #0b112c ${Math.min(100, Number(duskPct) + 8)}%,
    #050814 100%
  )`;

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
              className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] sm:text-xs font-medium text-amber-300 backdrop-blur-md border border-amber-500/30 hover:bg-amber-500/30 transition active:scale-95 cursor-pointer shadow-sm"
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
      <div className="relative pt-7 pb-2 px-1">
        {/* Visual Sky Gradient Arc Background */}
        <div
          className="relative h-10 w-full rounded-2xl overflow-hidden border border-white/15 shadow-inner"
          style={{ background: dynamicSkyGradient }}
        >
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
                <div className="h-full w-[1px] bg-white/25" />
              </div>
            );
          })}
        </div>

        {/* Range Scrubber Input Overlay */}
        <input
          type="range"
          min="0"
          max="23.99"
          step="0.05"
          value={simulatedHour}
          onChange={(e) => onScrubHour(parseFloat(e.target.value))}
          className="absolute inset-x-1 bottom-2 h-10 opacity-0 cursor-pointer z-20 w-[calc(100%-8px)]"
          aria-label="Solar Timeline Scrubber"
        />

        {/* Active Thumb / Cursor Marker */}
        <div
          className="absolute bottom-2 -translate-x-1/2 pointer-events-none transition-[left] duration-75 z-10 flex flex-col items-center"
          style={{
            left: `calc(4px + ${progressRatio} * (100% - 8px))`,
          }}
        >
          {/* Tooltip bubble */}
          <div
            className="rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-white shadow-xl border -translate-y-1 whitespace-nowrap transition-colors"
            style={{
              backgroundColor: accentColor,
              borderColor: 'rgba(255,255,255,0.4)',
            }}
          >
            {formatHourString(simulatedHour)}
          </div>
          {/* Scrubber pointer bar */}
          <div className="h-10 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
        </div>
      </div>

      {/* Quick Jump Celestial Milestones */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
        {markers.map((m, idx) => {
          const Icon = m.icon;
          const active = isNearMarker(m.hour);
          return (
            <button
              key={idx}
              onClick={() => onScrubHour(m.hour)}
              className={`group flex flex-col items-center justify-center rounded-2xl p-2 text-center backdrop-blur-md border transition cursor-pointer ${
                active
                  ? 'bg-white/15 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.15)] scale-102'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
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

