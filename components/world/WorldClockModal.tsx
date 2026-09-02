'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Search,
  Check,
  Compass,
} from 'lucide-react';
import { LocationData, SavedCity } from '@/types';
import {
  formatLocalTime,
  getTimezoneOffsetDifference,
} from '@/lib/utils/formatters';
import { searchCities, POPULAR_CITIES } from '@/lib/weather/openmeteo';

interface WorldClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCities: SavedCity[];
  currentCityId: string;
  onSelectCity: (city: SavedCity) => void;
  onAddCity: (city: SavedCity) => void;
  onRemoveCity: (cityId: string) => void;
}

export const WorldClockModal: React.FC<WorldClockModalProps> = ({
  isOpen,
  onClose,
  savedCities,
  currentCityId,
  onSelectCity,
  onAddCity,
  onRemoveCity,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const list = await searchCities(query);
        setResults(list);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#060812]/85 backdrop-blur-2xl"
      />

      {/* Modal */}
      <div className="relative z-10 flex h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white/[0.04] p-6 backdrop-blur-3xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">
                World Clocks & Saved Atmosphere Hubs
              </h2>
              <p className="text-xs text-white/50">
                Switch active location or track global time zones
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

        {/* Search / Add City Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search and add a world city to your clock..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-xl border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50 transition"
          />

          {/* Instant Search Results Dropdown */}
          {query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-48 overflow-y-auto rounded-2xl bg-[#090b14]/95 p-2 backdrop-blur-2xl border border-white/15 shadow-2xl z-50">
              {results.length > 0 ? (
                results.map((loc) => {
                  const isAlreadySaved = savedCities.some((c) => c.id === loc.id || c.name === loc.name);
                  return (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 transition"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-400" />
                        <span className="font-medium">{loc.name}</span>
                        <span className="text-xs text-white/50">{loc.country}</span>
                      </div>

                      <button
                        onClick={() => {
                          onAddCity({
                            id: loc.id,
                            name: loc.name,
                            country: loc.country,
                            countryCode: loc.countryCode,
                            admin1: loc.admin1,
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                            timezone: loc.timezone,
                          });
                          setQuery('');
                        }}
                        disabled={isAlreadySaved}
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition ${
                          isAlreadySaved
                            ? 'bg-white/5 text-white/30 cursor-default'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md'
                        }`}
                      >
                        {isAlreadySaved ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : isSearching ? (
                <div className="p-3 text-center text-xs text-white/50">Searching...</div>
              ) : (
                <div className="p-3 text-center text-xs text-white/50">No locations found</div>
              )}
            </div>
          )}
        </div>

        {/* Saved Cities List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
          {savedCities.map((city) => {
            const isCurrent = city.id === currentCityId || city.name === currentCityId;
            const timeStr = formatLocalTime(now, city.timezone, true, true);
            const tzDiff = getTimezoneOffsetDifference(city.timezone);

            return (
              <div
                key={city.id}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`group flex items-center justify-between rounded-2xl p-4 backdrop-blur-xl border transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600/20 border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white'
                    }`}
                  >
                    {city.countryCode || 'GL'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-base">
                        {city.name}
                      </h4>
                      {isCurrent && (
                        <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/40">
                          Active Atmosphere
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                      <span>{city.country}</span>
                      {tzDiff && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-300 font-mono">{tzDiff}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Digital Live Clock */}
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold tracking-wider text-white">
                      {timeStr}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {city.timezone.split('/')[1]?.replace('_', ' ') || city.timezone}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {savedCities.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCity(city.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-rose-400 transition"
                      title="Remove city"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
