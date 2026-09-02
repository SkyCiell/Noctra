'use client';

import React from 'react';
import { CloudRain, Sun, Moon } from 'lucide-react';
import { HourlyForecastData } from '@/types';
import { formatLocalTime, formatTemperature } from '@/lib/utils/formatters';
import { getWeatherInfo } from '@/lib/weather/weather-codes';

interface HourlyForecastProps {
  hourly: HourlyForecastData;
  timezone: string;
  tempUnit: 'celsius' | 'fahrenheit';
  onSelectHour?: (hour: number) => void;
  selectedHour?: number;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  timezone,
  tempUnit,
  onSelectHour,
  selectedHour,
}) => {
  if (!hourly || !hourly.time || hourly.time.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto my-4 select-none">
      <div className="flex items-center justify-between px-2 mb-3">
        <h3 className="text-sm font-semibold tracking-wide text-white/90">
          24-Hour Atmospheric Trajectory
        </h3>
        <span className="text-xs text-white/40">Hourly Forecast</span>
      </div>

      {/* Horizontal Scrolling Card Track */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
        {hourly.time.slice(0, 24).map((timeIso, idx) => {
          const date = new Date(timeIso);
          const timeStr = formatLocalTime(date, timezone, true);
          const temp = hourly.temperature[idx] ?? 20;
          const code = hourly.weatherCode[idx] ?? 0;
          const info = getWeatherInfo(code);
          const precipProb = hourly.precipitationProbability[idx] ?? 0;
          const isDay = Boolean(hourly.isDay[idx]);
          const cardHour = date.getHours();
          const isSelected = selectedHour !== undefined && Math.floor(selectedHour) === cardHour;

          return (
            <button
              key={idx}
              onClick={() => onSelectHour && onSelectHour(cardHour)}
              className={`group flex min-w-[84px] shrink-0 flex-col items-center justify-between rounded-2xl p-3 backdrop-blur-xl border transition snap-start ${
                isSelected
                  ? 'bg-indigo-600/30 border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {/* Hour time */}
              <span className="text-xs font-mono text-white/70">{timeStr}</span>

              {/* Weather Icon Badge */}
              <div className="my-2 text-white/90 group-hover:scale-110 transition">
                {isDay ? (
                  <Sun className="h-6 w-6 text-amber-400" />
                ) : (
                  <Moon className="h-6 w-6 text-indigo-300" />
                )}
              </div>

              {/* Temperature */}
              <span className="text-sm font-semibold text-white">
                {formatTemperature(temp, tempUnit)}
              </span>

              {/* Precipitation Chance */}
              {precipProb > 0 ? (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-cyan-300 font-medium">
                  <CloudRain className="h-3 w-3" />
                  <span>{precipProb}%</span>
                </div>
              ) : (
                <div className="mt-1.5 h-3 text-[10px] text-white/30 font-mono">
                  {info.label.split(' ')[0]}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
