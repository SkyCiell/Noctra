'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Compass,
  Volume2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Globe,
  Film,
  X,
} from 'lucide-react';
import { LocationData } from '@/types';
import { searchCities, POPULAR_CITIES } from '@/lib/weather/openmeteo';
import { formatLocalTime } from '@/lib/utils/formatters';

interface AtmosphereHeaderProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onOpenWorldClock: () => void;
  onOpenMediaSelector: () => void;
  onOpenSoundboard: () => void;
  isTimeScrubbed: boolean;
  onResetTime: () => void;
  simulatedDate: Date;
  tempUnit: 'celsius' | 'fahrenheit';
  onToggleTempUnit: () => void;
  isDaytime: boolean;
}

export const AtmosphereHeader: React.FC<AtmosphereHeaderProps> = ({
  currentLocation,
  onSelectLocation,
  onOpenWorldClock,
  onOpenMediaSelector,
  onOpenSoundboard,
  isTimeScrubbed,
  onResetTime,
  simulatedDate,
  tempUnit,
  onToggleTempUnit,
  isDaytime,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  // Live time ticker
  const [liveDate, setLiveDate] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setLiveDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchCities(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
        setIsMobileSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayDate = isTimeScrubbed ? simulatedDate : liveDate;
  const formattedTime = formatLocalTime(
    displayDate,
    currentLocation.timezone,
    true,
    !isTimeScrubbed
  );

  return (
    <header className="relative z-30 flex w-full items-center justify-between px-3 py-2.5 sm:px-6 lg:px-8 gap-2">
      {/* Brand & Atmosphere Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="group relative flex items-center gap-2 rounded-full bg-white/5 px-2.5 sm:px-3 py-1.5 backdrop-blur-xl border border-white/10 shadow-lg transition hover:bg-white/10">
          <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-indigo-400" />
          </div>
          <span className="font-semibold tracking-wider text-white text-xs sm:text-sm">
            NOCTRA
          </span>
        </div>

        {/* Time Travel Indicator Pill */}
        {isTimeScrubbed && (
          <button
            onClick={onResetTime}
            className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-amber-300 backdrop-blur-md border border-amber-500/30 hover:bg-amber-500/30 transition animate-pulse"
            title="Reset to real-time"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden xs:inline">Live Mode</span>
          </button>
        )}
      </div>

      {/* Desktop Search Bar (Hidden on mobile < sm) */}
      <div
        ref={searchContainerRef}
        className="relative hidden sm:block flex-1 max-w-sm md:max-w-md mx-2 sm:mx-4"
      >
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-3.5 w-3.5 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search any world city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full rounded-full bg-white/5 py-1.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-white/40 backdrop-blur-xl border border-white/10 outline-none transition focus:bg-white/10 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50 shadow-inner"
          />
          {isSearching && (
            <div className="absolute right-3.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
          )}
        </div>

        {/* Search Results Dropdown Desktop */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto rounded-2xl bg-[#090b14]/95 p-2 backdrop-blur-2xl border border-white/15 shadow-2xl z-50">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Search Results
                </div>
                {searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="font-medium text-white">{loc.name}</span>
                      {loc.admin1 && (
                        <span className="text-xs text-white/50">{loc.admin1},</span>
                      )}
                      <span className="text-xs text-white/60">{loc.country}</span>
                    </div>
                    <span className="text-[11px] text-white/40 font-mono">
                      {loc.timezone.split('/')[1]?.replace('_', ' ') || loc.timezone}
                    </span>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="px-3 py-4 text-center text-xs text-white/50">
                No matching locations found
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Popular Atmosphere Hubs
                </div>
                {POPULAR_CITIES.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-white font-medium">{loc.name}</span>
                      <span className="text-xs text-white/50">{loc.country}</span>
                    </div>
                    <span className="text-[11px] text-white/40 font-mono">
                      {loc.timezone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Clock & Action Icons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Button (Visible only on < sm) */}
        <button
          onClick={() => {
            setIsMobileSearchActive(true);
            setTimeout(() => mobileInputRef.current?.focus(), 50);
          }}
          className="flex sm:hidden h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/80 backdrop-blur-xl border border-white/10 transition hover:bg-white/15"
          title="Search Location"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        {/* Live Local Clock Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 backdrop-blur-xl border border-white/10 shadow-md">
          {isDaytime ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-indigo-300" />
          )}
          <span
            suppressHydrationWarning
            className="font-mono text-xs sm:text-sm font-semibold tracking-wide text-white"
          >
            {mounted ? formattedTime : '--:--:--'}
          </span>
          <span className="text-[10px] sm:text-[11px] text-white/40 font-mono">
            {currentLocation.name}
          </span>
        </div>

        {/* Temperature Unit Toggle */}
        <button
          onClick={onToggleTempUnit}
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 text-[11px] sm:text-xs font-semibold text-white/80 backdrop-blur-xl border border-white/10 transition hover:bg-white/15 hover:text-white"
          title={`Switch to ${tempUnit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
        >
          {tempUnit === 'celsius' ? '°C' : '°F'}
        </button>

        {/* World Clock Modal Opener */}
        <button
          onClick={onOpenWorldClock}
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 text-white/80 backdrop-blur-xl border border-white/10 transition hover:bg-white/15 hover:text-white"
          title="World Clock & Saved Cities"
        >
          <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        {/* Soundboard Modal Opener (Hidden on mobile dock) */}
        <button
          onClick={onOpenSoundboard}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 backdrop-blur-xl border border-white/10 transition hover:bg-white/15 hover:text-white"
          title="Ambient Sound Mixer"
        >
          <Volume2 className="h-4 w-4" />
        </button>

        {/* Media Selector Opener */}
        <button
          onClick={onOpenMediaSelector}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 backdrop-blur-xl border border-white/10 transition hover:bg-white/15 hover:text-white"
          title="Media & Atmosphere Visuals"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Full-Screen Mobile Search Overlay when tapped */}
      {isMobileSearchActive && (
        <div className="fixed inset-0 z-50 bg-[#060812]/95 backdrop-blur-2xl p-4 flex flex-col animate-fadeIn sm:hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search any world city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none border border-white/20 focus:border-indigo-400"
              />
              {isSearching && (
                <div className="absolute right-3.5 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
              )}
            </div>
            <button
              onClick={() => {
                setIsMobileSearchActive(false);
                setSearchQuery('');
              }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {searchResults.length > 0 ? (
              searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    setIsMobileSearchActive(false);
                    setSearchQuery('');
                  }}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left text-sm text-white bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="font-medium">{loc.name}</span>
                    <span className="text-xs text-white/60">
                      {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                    </span>
                  </div>
                  <span className="text-xs text-white/40 font-mono">
                    {loc.timezone.split('/')[1]?.replace('_', ' ') || loc.timezone}
                  </span>
                </button>
              ))
            ) : (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  Popular Hubs
                </div>
                {POPULAR_CITIES.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsMobileSearchActive(false);
                      setSearchQuery('');
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-3 text-left text-sm text-white bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-cyan-400" />
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-xs text-white/50">{loc.country}</span>
                    </div>
                    <span className="text-xs text-white/40 font-mono">
                      {loc.timezone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
