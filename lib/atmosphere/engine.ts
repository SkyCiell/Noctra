import {
  AstronomicalData,
  AtmosphereState,
  AtmosphereTag,
  CurrentWeatherData,
  LocationData,
} from '@/types';
import { getWeatherInfo } from '../weather/weather-codes';
import { findBestMatchingSong, findBestMatchingVideo } from '../media/registry';

export function resolveAtmosphereState(
  weather: CurrentWeatherData,
  astro: AstronomicalData,
  location: LocationData
): AtmosphereState {
  const weatherInfo = getWeatherInfo(weather.weatherCode);
  const tags: AtmosphereTag[] = [];

  // Weather condition tags
  tags.push(weatherInfo.primaryTag);
  if (weather.precipitation > 2 || weather.weatherCode === 65 || weather.weatherCode === 82) {
    tags.push('heavy_rain');
  } else if (weather.precipitation > 0 && weather.precipitation <= 2) {
    tags.push('drizzle');
  }

  // Astronomical & Solar tags
  switch (astro.dayNightState) {
    case 'midnight':
      tags.push('midnight', 'night', 'cosmic');
      break;
    case 'night':
      tags.push('night');
      break;
    case 'dawn':
      tags.push('dawn', 'morning');
      break;
    case 'sunrise':
      tags.push('morning', 'golden_hour');
      break;
    case 'golden_hour_morning':
      tags.push('golden_hour', 'morning');
      break;
    case 'golden_hour_evening':
      tags.push('golden_hour', 'sunset');
      break;
    case 'sunset':
      tags.push('sunset');
      break;
    case 'dusk':
      tags.push('sunset', 'night');
      break;
    case 'day':
    default:
      if (weatherInfo.primaryTag === 'clear') {
        tags.push('clear');
      }
      break;
  }

  // Location / Vibe heuristics
  const isCity =
    location.name.toLowerCase().match(/(tokyo|london|new york|paris|chicago|seoul|jakarta|berlin|sydney|singapore|shanghai|dubai)/i) !==
    null;
  if (isCity) {
    tags.push('city', 'focus');
  } else {
    tags.push('nature', 'calm');
  }

  // Deduplicate tags
  const uniqueTags = Array.from(new Set(tags));

  // Determine Title, Mood Quote, Accent Colors
  let title = 'Atmospheric Equilibrium';
  let description = 'A harmonious digital atmosphere tailored to the local celestial rhythm.';
  let moodQuote = 'Where sky, sound, and stillness converge.';
  let accentColor = '#6366f1'; // Indigo
  let glowColor = 'rgba(99, 102, 241, 0.4)';
  let bgGradient = 'radial-gradient(circle at 50% 20%, rgba(30, 27, 75, 0.7) 0%, rgba(9, 10, 15, 0.95) 100%)';

  const isRain = uniqueTags.includes('rain') || uniqueTags.includes('heavy_rain') || uniqueTags.includes('drizzle');
  const isNight = uniqueTags.includes('night') || uniqueTags.includes('midnight');
  const isGolden = uniqueTags.includes('golden_hour') || uniqueTags.includes('sunset');
  const isSnow = uniqueTags.includes('snow');
  const isThunder = uniqueTags.includes('thunderstorm');
  const isFog = uniqueTags.includes('fog');

  if (isThunder) {
    title = 'Electric Tempest';
    description = 'High-voltage lightning pulses echoing through turbulent clouds.';
    moodQuote = 'The air crackles with untamed electric power.';
    accentColor = '#a855f7'; // Purple
    glowColor = 'rgba(168, 85, 247, 0.5)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(59, 7, 100, 0.8) 0%, rgba(7, 4, 18, 0.98) 100%)';
  } else if (isRain && isNight) {
    title = 'Midnight Downpour';
    description = 'Gentle neon refractions dancing in nocturnal rain puddles.';
    moodQuote = 'The quiet rhythm of rain softens the edges of the night.';
    accentColor = '#38bdf8'; // Cyan/Sky
    glowColor = 'rgba(56, 189, 248, 0.45)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(12, 45, 72, 0.8) 0%, rgba(5, 10, 20, 0.98) 100%)';
  } else if (isRain) {
    title = 'Daylight Precipitation';
    description = 'Refreshing showers washing over the waking landscape.';
    moodQuote = 'A soothing shower cleansing the atmosphere.';
    accentColor = '#0ea5e9';
    glowColor = 'rgba(14, 165, 233, 0.4)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(14, 60, 95, 0.7) 0%, rgba(8, 14, 28, 0.95) 100%)';
  } else if (isGolden) {
    title = 'Golden Hour Luminescence';
    description = 'Warm amber light cascading across the horizon in poetic serenity.';
    moodQuote = 'The horizon melts in amber and rose tranquility.';
    accentColor = '#f59e0b'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.45)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(120, 53, 15, 0.75) 0%, rgba(15, 10, 25, 0.95) 100%)';
  } else if (isSnow) {
    title = 'Winter Solitude';
    description = 'Crystalline flakes drifting softly in a quiet frozen expanse.';
    moodQuote = 'Every crystalline snowflake carries silence.';
    accentColor = '#93c5fd'; // Soft Ice Blue
    glowColor = 'rgba(147, 197, 253, 0.45)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(30, 58, 138, 0.6) 0%, rgba(8, 12, 24, 0.98) 100%)';
  } else if (isFog) {
    title = 'Ethereal Mist';
    description = 'Veils of fog suspended in quiet contemplative stillness.';
    moodQuote = 'Wrapped in the calm of whispering vapor.';
    accentColor = '#a1a1aa'; // Zinc/Mist
    glowColor = 'rgba(161, 161, 170, 0.35)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(39, 39, 42, 0.7) 0%, rgba(9, 9, 11, 0.95) 100%)';
  } else if (isNight) {
    title = 'Cosmic Obsidian Night';
    description = 'Starfield radiance shining above a peaceful world.';
    moodQuote = 'Under the eternal canopy of a million stars.';
    accentColor = '#818cf8'; // Indigo
    glowColor = 'rgba(129, 140, 248, 0.45)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(30, 27, 75, 0.7) 0%, rgba(5, 6, 12, 0.98) 100%)';
  } else {
    title = 'Radiant Daylight';
    description = 'Clear open skies bathed in energetic solar warmth.';
    moodQuote = 'Bathed in open clarity and pure illumination.';
    accentColor = '#3b82f6'; // Blue
    glowColor = 'rgba(59, 130, 246, 0.4)';
    bgGradient = 'radial-gradient(circle at 50% 20%, rgba(29, 78, 216, 0.6) 0%, rgba(10, 15, 30, 0.95) 100%)';
  }

  const bestSong = findBestMatchingSong(uniqueTags);
  const bestVideo = findBestMatchingVideo(uniqueTags);

  return {
    primaryTag: uniqueTags[0] || 'clear',
    tags: uniqueTags,
    title,
    description,
    moodQuote,
    accentColor,
    glowColor,
    bgGradient,
    particleType: weatherInfo.particleType,
    particleDensity: weatherInfo.particleDensity,
    recommendedVideoId: bestVideo.id,
    recommendedSongId: bestSong.id,
  };
}
