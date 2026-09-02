import { SavedCity, UserPreferences } from '@/types';
import { POPULAR_CITIES } from '../weather/openmeteo';

const STORAGE_KEY = 'noctra_user_preferences_v2';

export const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  timeFormat: '24h',
  videoEnabled: true,
  videoOpacity: 0.85,
  videoBlur: 0,
  musicVolume: 0.75,
  ambientMasterVolume: 0.6,
  savedCities: POPULAR_CITIES.slice(0, 4).map((c) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    countryCode: c.countryCode,
    admin1: c.admin1,
    latitude: c.latitude,
    longitude: c.longitude,
    timezone: c.timezone,
    isDefault: c.name === 'Jakarta',
  })),
  favoriteSongIds: ['song-ghea-1000x', 'song-midnight-rain'],
  favoriteVideoIds: ['video-ghea-1000x', 'video-rain-night'],
  ambientChannels: {
    'amb-rain': { volume: 0.5, enabled: false },
    'amb-wind': { volume: 0.3, enabled: false },
    'amb-crickets': { volume: 0.4, enabled: false },
    'amb-astral': { volume: 0.45, enabled: false },
  },
  lyricsVisible: false,
  lastCityId: 'jakarta-id',
};

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      savedCities: parsed.savedCities?.length ? parsed.savedCities : DEFAULT_PREFERENCES.savedCities,
    };
  } catch (e) {
    console.error('Error loading preferences:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = loadPreferences();
    const updated: UserPreferences = {
      ...current,
      ...prefs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving preferences:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function addSavedCity(city: SavedCity): SavedCity[] {
  const prefs = loadPreferences();
  const exists = prefs.savedCities.some((c) => c.id === city.id || (c.name === city.name && c.country === city.country));
  if (!exists) {
    const updatedCities = [...prefs.savedCities, city];
    savePreferences({ savedCities: updatedCities });
    return updatedCities;
  }
  return prefs.savedCities;
}

export function removeSavedCity(cityId: string): SavedCity[] {
  const prefs = loadPreferences();
  const updated = prefs.savedCities.filter((c) => c.id !== cityId);
  savePreferences({ savedCities: updated });
  return updated;
}
