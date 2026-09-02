'use client';

import React from 'react';
import {
  MapPin,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Droplets,
  CloudRain,
  Sun,
  Moon,
  Wind,
} from 'lucide-react';
import {
  AstronomicalData,
  AtmosphereState,
  CurrentWeatherData,
  DailyForecastData,
  LocationData,
} from '@/types';
import { formatLocalDate, formatTemperature } from '@/lib/utils/formatters';
import { getWeatherInfo } from '@/lib/weather/weather-codes';

interface WeatherHeroProps {
  location: LocationData;
  weather: CurrentWeatherData;
  daily: DailyForecastData;
  astro: AstronomicalData;
  atmosphere: AtmosphereState;
  tempUnit: 'celsius' | 'fahrenheit';
  simulatedDate: Date;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({
  location,
  weather,
  daily,
  astro,
  atmosphere,
  tempUnit,
  simulatedDate,
}) => {
  const weatherInfo = getWeatherInfo(weather.weatherCode);
  const formattedDate = formatLocalDate(simulatedDate, location.timezone);

  const maxTemp = daily.temperatureMax[0] ?? weather.temperature + 3;
  const minTemp = daily.temperatureMin[0] ?? weather.temperature - 4;

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 pt-4 pb-6 sm:py-8 select-none">
      {/* Location & Day State Badge */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-xl border border-white/10 shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-indigo-400" />
          <span>
            {location.name}
            {location.country ? `, ${location.country}` : ''}
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium backdrop-blur-xl border shadow-sm transition"
          style={{
            backgroundColor: `${atmosphere.accentColor}18`,
            borderColor: `${atmosphere.accentColor}40`,
            color: atmosphere.accentColor,
          }}
        >
          {astro.isDaytime ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
          <span>{astro.dayNightLabel}</span>
        </div>

        <div className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono text-white/60 backdrop-blur-md border border-white/5">
          {formattedDate}
        </div>
      </div>

      {/* Main Temperature & Weather Condition */}
      <div className="relative my-2 flex flex-col items-center">
        <div className="relative flex items-start justify-center">
          <span
            className="text-7xl sm:text-8xl md:text-9xl font-extralight tracking-tighter text-white drop-shadow-2xl font-sans"
            style={{
              textShadow: `0 0 50px ${atmosphere.glowColor}`,
            }}
          >
            {Math.round(
              tempUnit === 'fahrenheit'
                ? (weather.temperature * 9) / 5 + 32
                : weather.temperature
            )}
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl font-light text-white/60 ml-1 mt-2">
            °{tempUnit === 'celsius' ? 'C' : 'F'}
          </span>
        </div>

        {/* Condition Label */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl sm:text-2xl font-medium tracking-wide text-white/95">
            {weatherInfo.label}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-sm sm:text-base text-white/70">
            Feels like{' '}
            {formatTemperature(weather.apparentTemperature, tempUnit)}
          </span>
        </div>
      </div>

      {/* Atmosphere Poetic Mood Quote */}
      <div className="max-w-lg mt-3 px-4">
        <p className="text-sm sm:text-base italic text-white/80 font-light tracking-wide leading-relaxed">
          &ldquo;{atmosphere.moodQuote}&rdquo;
        </p>
        <p className="text-xs text-white/50 mt-1">
          {atmosphere.description}
        </p>
      </div>

      {/* Summary Chips: High/Low, Precipitation, Wind, Cloud */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6">
        <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 px-3.5 py-1.5 backdrop-blur-xl border border-white/10 text-xs text-white/80 shadow-sm">
          <ArrowUp className="h-3.5 w-3.5 text-rose-400" />
          <span>{formatTemperature(maxTemp, tempUnit)}</span>
          <span className="text-white/30">/</span>
          <ArrowDown className="h-3.5 w-3.5 text-blue-400" />
          <span>{formatTemperature(minTemp, tempUnit)}</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 px-3.5 py-1.5 backdrop-blur-xl border border-white/10 text-xs text-white/80 shadow-sm">
          <Droplets className="h-3.5 w-3.5 text-cyan-400" />
          <span>{weather.humidity}% Humidity</span>
        </div>

        {weather.precipitation > 0 && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-sky-500/15 px-3.5 py-1.5 backdrop-blur-xl border border-sky-500/25 text-xs text-sky-300 shadow-sm">
            <CloudRain className="h-3.5 w-3.5" />
            <span>{weather.precipitation} mm rain</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 px-3.5 py-1.5 backdrop-blur-xl border border-white/10 text-xs text-white/80 shadow-sm">
          <Wind className="h-3.5 w-3.5 text-indigo-400" />
          <span>{weather.windSpeed} km/h wind</span>
        </div>
      </div>
    </div>
  );
};
