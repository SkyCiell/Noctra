export type WeatherConditionCode = number;

export type DayNightState = 'dawn' | 'sunrise' | 'golden_hour_morning' | 'day' | 'golden_hour_evening' | 'sunset' | 'dusk' | 'night' | 'midnight';

export type AtmosphereTag =
  | 'rain'
  | 'heavy_rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'cloudy'
  | 'clear'
  | 'night'
  | 'midnight'
  | 'morning'
  | 'dawn'
  | 'sunset'
  | 'golden_hour'
  | 'storm'
  | 'calm'
  | 'city'
  | 'nature'
  | 'focus'
  | 'cosmic';

export interface LocationData {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
}

export interface CurrentWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  weatherCode: number;
  visibility: number; // in meters
  uvIndex: number;
  isDay: boolean;
  pressure?: number; // hPa
  dewPoint?: number;
  precipitation: number;
  cloudCover: number;
  time: string;
}

export interface HourlyForecastData {
  time: string[];
  temperature: number[];
  apparentTemperature: number[];
  weatherCode: number[];
  humidity: number[];
  precipitationProbability: number[];
  windSpeed: number[];
  uvIndex: number[];
  isDay: number[];
}

export interface DailyForecastData {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
  precipitationProbabilityMax: number[];
}

export interface AirQualityData {
  aqi: number;
  aqiLabel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm2_5: number;
  pm10: number;
  no2?: number;
  o3?: number;
  so2?: number;
}

export interface WeatherBundle {
  current: CurrentWeatherData;
  hourly: HourlyForecastData;
  daily: DailyForecastData;
  airQuality?: AirQualityData;
  timezone: string;
}

export interface AstronomicalData {
  solarElevation: number;
  solarAzimuth: number;
  sunriseTime: string;
  sunsetTime: string;
  goldenHourMorning: { start: string; end: string };
  goldenHourEvening: { start: string; end: string };
  solarNoon: string;
  dawn: string;
  dusk: string;
  dayNightState: DayNightState;
  dayNightLabel: string;
  isDaytime: boolean;
  moonPhase: MoonPhaseInfo;
}

export interface MoonPhaseInfo {
  phase: number; // 0 to 1
  name: string;
  illumination: number; // 0 to 100%
  icon: string;
  stage: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
}

export interface AtmosphereState {
  primaryTag: AtmosphereTag;
  tags: AtmosphereTag[];
  title: string;
  description: string;
  moodQuote: string;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  particleType: 'rain' | 'snow' | 'stars' | 'fog' | 'sun_dust' | 'storm' | 'aurora';
  particleDensity: number;
  recommendedVideoId: string;
  recommendedSongId: string;
}

export interface LyricLine {
  time: number; // in seconds
  formattedTime: string; // [mm:ss.xx]
  text: string;
  translation?: string;
}

export interface ParsedLyrics {
  isLrc: boolean;
  lines: LyricLine[];
  plainText?: string;
  artist?: string;
  title?: string;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number; // in seconds
  audioSrc: string;
  lyricsSrc?: string;
  atmosphereTags: AtmosphereTag[];
  genre?: string;
  ambientType?: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  location?: string;
  videoSrc: string;
  previewSrc?: string;
  atmosphereTags: AtmosphereTag[];
  credit?: string;
  isAnimatedBackdrop?: boolean;
  backdropTheme?: 'rain' | 'sunset' | 'night_city' | 'forest' | 'ocean' | 'snow' | 'thunder' | 'aurora' | 'deep_space';
}

export interface AmbientChannel {
  id: string;
  name: string;
  iconName: string;
  volume: number; // 0 to 1
  enabled: boolean;
  type: 'rain' | 'thunder' | 'wind' | 'night_crickets' | 'ocean' | 'city' | 'astral_drone' | 'vinyl';
}

export interface SavedCity {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isDefault?: boolean;
}

export interface UserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph' | 'ms';
  timeFormat: '24h' | '12h';
  videoEnabled: boolean;
  videoOpacity: number; // 0 to 1
  videoBlur: number; // in px
  musicVolume: number;
  ambientMasterVolume: number;
  activeVideoId?: string;
  activeSongId?: string;
  savedCities: SavedCity[];
  favoriteSongIds: string[];
  favoriteVideoIds: string[];
  ambientChannels: { [key: string]: { volume: number; enabled: boolean } };
  lyricsVisible: boolean;
  lastCityId?: string;
}
