'use client';

import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Eye,
  Activity,
  Compass,
  Gauge,
  Moon,
  Sparkles,
  Sunrise,
  Sunset,
} from 'lucide-react';
import {
  AirQualityData,
  AstronomicalData,
  CurrentWeatherData,
  DailyForecastData,
} from '@/types';
import {
  formatLocalTime,
  formatVisibility,
  formatWindSpeed,
  getUvCategory,
  getWindDirectionCompass,
} from '@/lib/utils/formatters';

interface WeatherMetricsGridProps {
  weather: CurrentWeatherData;
  astro: AstronomicalData;
  airQuality?: AirQualityData;
  daily: DailyForecastData;
  timezone: string;
  windSpeedUnit: 'kmh' | 'mph' | 'ms';
  accentColor?: string;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  weather,
  astro,
  airQuality,
  daily,
  timezone,
  windSpeedUnit,
  accentColor = '#6366f1',
}) => {
  const uvCat = getUvCategory(weather.uvIndex);
  const windDirName = getWindDirectionCompass(weather.windDirection);

  const formatTimeIso = (isoStr?: string) => {
    if (!isoStr) return '--:--';
    try {
      return formatLocalTime(new Date(isoStr), timezone, true);
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto my-6 select-none">
      {/* 1. Wind & Compass Card */}
      <div className="group rounded-3xl bg-white/5 p-5 backdrop-blur-2xl border border-white/10 shadow-xl transition hover:border-white/20 hover:bg-white/[0.07]">
        <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Wind className="h-4 w-4 text-indigo-400" />
            <span>Wind & Dynamics</span>
          </div>
          <span className="font-mono text-white/70">{windDirName}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-light text-white tracking-tight">
              {formatWindSpeed(weather.windSpeed, windSpeedUnit)}
            </div>
            {weather.windGusts && (
              <div className="text-xs text-white/50 mt-1">
                Gusts up to {formatWindSpeed(weather.windGusts, windSpeedUnit)}
              </div>
            )}
          </div>

          {/* Compass Graphic */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/20 shadow-inner">
            <div
              className="absolute h-10 w-1 rounded-full bg-gradient-to-t from-indigo-500 to-rose-400 transition-transform duration-700"
              style={{
                transform: `rotate(${weather.windDirection}deg)`,
              }}
            />
            <div className="h-2 w-2 rounded-full bg-white shadow-md z-10" />
            <span className="absolute top-1 text-[9px] text-white/40 font-mono">N</span>
          </div>
        </div>
      </div>

      {/* 2. Moon Phase & Celestial Illumination */}
      <div className="group rounded-3xl bg-white/5 p-5 backdrop-blur-2xl border border-white/10 shadow-xl transition hover:border-white/20 hover:bg-white/[0.07]">
        <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Moon className="h-4 w-4 text-sky-300" />
            <span>Lunar Atmosphere</span>
          </div>
          <span className="font-mono text-sky-300 font-semibold">
            {astro.moonPhase.illumination}% Illumination
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-light text-white tracking-tight">
              {astro.moonPhase.name}
            </div>
            <div className="text-xs text-white/50 mt-1">
              Phase {(astro.moonPhase.phase * 100).toFixed(1)}% through lunar cycle
            </div>
          </div>

          {/* Glowing Moon Phase Graphic */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-700/60 shadow-[0_0_20px_rgba(186,230,253,0.25)] overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-slate-200 to-amber-100 transition-all"
              style={{
                clipPath:
                  astro.moonPhase.phase <= 0.5
                    ? `ellipse(${astro.moonPhase.illumination}% 100% at ${astro.moonPhase.phase > 0.25 ? '50%' : '100%'} 50%)`
                    : `ellipse(${astro.moonPhase.illumination}% 100% at 0% 50%)`,
              }}
            />
            <span className="text-2xl z-10 drop-shadow-md select-none">
              {astro.moonPhase.icon}
            </span>
          </div>
        </div>
      </div>

      {/* 3. UV Index & Solar Radiation */}
      <div className="group rounded-3xl bg-white/5 p-5 backdrop-blur-2xl border border-white/10 shadow-xl transition hover:border-white/20 hover:bg-white/[0.07]">
        <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Sun className="h-4 w-4 text-amber-400" />
            <span>UV Index</span>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: `${uvCat.color}22`,
              color: uvCat.color,
            }}
          >
            {uvCat.label}
          </span>
        </div>

        <div className="text-3xl font-light text-white tracking-tight">
          {weather.uvIndex} <span className="text-sm text-white/40">/ 11+</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, (weather.uvIndex / 11) * 100)}%`,
              backgroundColor: uvCat.color,
            }}
          />
        </div>
      </div>

      {/* 4. Air Quality Index (AQI) */}
      <div className="group rounded-3xl bg-white/5 p-5 backdrop-blur-2xl border border-white/10 shadow-xl transition hover:border-white/20 hover:bg-white/[0.07]">
        <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Air Quality</span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold">
            {airQuality?.aqiLabel || 'Good'}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-light text-white tracking-tight">
            {airQuality?.aqi ?? 28}
          </div>
          <span className="text-xs text-white/40">US AQI</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/50 mt-3">
          <span>PM2.5: {airQuality?.pm2_5 ?? 6.2} µg/m³</span>
          <span>PM10: {airQuality?.pm10 ?? 12.4} µg/m³</span>
        </div>
      </div>

      {/* 5. Humidity & Visibility */}
      <div className="group rounded-3xl bg-white/5 p-5 backdrop-blur-2xl border border-white/10 shadow-xl transition hover:border-white/20 hover:bg-white/[0.07]">
        <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <span>Atmospheric Humidity</span>
          </div>
          <div className="flex items-center gap-1 text-white/40">
            <Eye className="h-3.5 w-3.5" />
            <span>{formatVisibility(weather.visibility)}</span>
          </div>
        </div>

        <div className="text-3xl font-light text-white tracking-tight">
          {weather.humidity}%
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-white/50">
          <span>Pressure: {weather.pressure ?? 1013} hPa</span>
          <span>Cloud: {weather.cloudCover}%</span>
        </div>
      </div>

      {/* 6. Sun Cycle & Twilight Times */}
      <div className="group rounded-3xl bg-white/5 p-5 backdrop-blur-2xl border border-white/10 shadow-xl transition hover:border-white/20 hover:bg-white/[0.07]">
        <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-3">
          <div className="flex items-center gap-1.5">
            <Sunrise className="h-4 w-4 text-amber-400" />
            <span>Solar Rhythm</span>
          </div>
          <span className="text-white/40 font-mono text-[11px]">
            {astro.solarElevation}° Elevation
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="rounded-2xl bg-white/5 p-2.5 backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Sunrise className="h-3.5 w-3.5" />
              <span>Sunrise</span>
            </div>
            <div className="text-base font-mono font-semibold text-white mt-0.5">
              {formatTimeIso(astro.sunriseTime)}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-2.5 backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
              <Sunset className="h-3.5 w-3.5" />
              <span>Sunset</span>
            </div>
            <div className="text-base font-mono font-semibold text-white mt-0.5">
              {formatTimeIso(astro.sunsetTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
