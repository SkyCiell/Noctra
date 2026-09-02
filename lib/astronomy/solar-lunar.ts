import { AstronomicalData, DayNightState, MoonPhaseInfo } from '@/types';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/**
 * Calculates Moon Phase and Illumination Percentage for any given date
 */
export function calculateMoonPhase(date: Date): MoonPhaseInfo {
  // Known reference new moon: January 11, 2024 at 11:57 UTC
  const refNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
  const synodicMonthMs = 29.53058867 * 24 * 60 * 60 * 1000;

  const diffMs = date.getTime() - refNewMoon;
  let phase = (diffMs % synodicMonthMs) / synodicMonthMs;
  if (phase < 0) phase += 1;

  // Illumination calculation (0 to 100%)
  const illumination = Math.round((0.5 * (1 - Math.cos(2 * Math.PI * phase))) * 100);

  let name = 'New Moon';
  let stage: MoonPhaseInfo['stage'] = 'new';
  let icon = '🌑';

  if (phase < 0.03 || phase >= 0.97) {
    name = 'New Moon';
    stage = 'new';
    icon = '🌑';
  } else if (phase < 0.22) {
    name = 'Waxing Crescent';
    stage = 'waxing_crescent';
    icon = '🌒';
  } else if (phase < 0.28) {
    name = 'First Quarter';
    stage = 'first_quarter';
    icon = '🌓';
  } else if (phase < 0.47) {
    name = 'Waxing Gibbous';
    stage = 'waxing_gibbous';
    icon = '🌔';
  } else if (phase < 0.53) {
    name = 'Full Moon';
    stage = 'full';
    icon = '🌕';
  } else if (phase < 0.72) {
    name = 'Waning Gibbous';
    stage = 'waning_gibbous';
    icon = '🌖';
  } else if (phase < 0.78) {
    name = 'Last Quarter';
    stage = 'last_quarter';
    icon = '🌗';
  } else {
    name = 'Waning Crescent';
    stage = 'waning_crescent';
    icon = '🌘';
  }

  return {
    phase: Math.round(phase * 1000) / 1000,
    name,
    illumination,
    icon,
    stage,
  };
}

/**
 * Approximate Solar Elevation and Position
 */
export function calculateSolarPosition(date: Date, lat: number, lon: number) {
  const dayOfYear = getDayOfYear(date);
  const hourUTC = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Solar declination (approx in degrees)
  const declination = -23.44 * Math.cos(RAD * ((360 / 365) * (dayOfYear + 10)));

  // Equation of time (approx in minutes)
  const b = RAD * ((360 / 365) * (dayOfYear - 81));
  const eqTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // Solar time
  const solarTime = (hourUTC * 60 + 4 * lon + eqTime) % 1440;
  const hourAngle = (solarTime / 4 - 180) * RAD;

  const latRad = lat * RAD;
  const decRad = declination * RAD;

  // Solar elevation
  const sinElev =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngle);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinElev))) * DEG;

  // Solar azimuth
  const cosAz =
    (Math.sin(decRad) - Math.sin(latRad) * sinElev) /
    (Math.cos(latRad) * Math.cos(Math.asin(sinElev)));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * DEG;
  if (Math.sin(hourAngle) > 0) azimuth = 360 - azimuth;

  return {
    elevation: Math.round(elevation * 10) / 10,
    azimuth: Math.round(azimuth * 10) / 10,
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculates complete Astronomical Data package
 */
export function calculateAstronomicalData(
  date: Date,
  lat: number,
  lon: number,
  sunriseIso?: string,
  sunsetIso?: string
): AstronomicalData {
  const { elevation, azimuth } = calculateSolarPosition(date, lat, lon);
  const moonPhase = calculateMoonPhase(date);

  // Default times if not provided from weather API
  const baseDate = new Date(date);
  const defaultSunrise = new Date(baseDate.setHours(6, 12, 0, 0)).toISOString();
  const defaultSunset = new Date(baseDate.setHours(18, 30, 0, 0)).toISOString();

  const sunrise = sunriseIso || defaultSunrise;
  const sunset = sunsetIso || defaultSunset;

  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);

  // Golden hour ranges (approx 45 mins after sunrise, 45 mins before sunset)
  const ghMorningStart = new Date(sunriseDate.getTime() - 15 * 60000).toISOString();
  const ghMorningEnd = new Date(sunriseDate.getTime() + 45 * 60000).toISOString();

  const ghEveningStart = new Date(sunsetDate.getTime() - 45 * 60000).toISOString();
  const ghEveningEnd = new Date(sunsetDate.getTime() + 15 * 60000).toISOString();

  // Dawn and dusk (Civil twilight: 30 mins before sunrise / after sunset)
  const dawn = new Date(sunriseDate.getTime() - 30 * 60000).toISOString();
  const dusk = new Date(sunsetDate.getTime() + 30 * 60000).toISOString();

  // Solar noon
  const noonMs = (sunriseDate.getTime() + sunsetDate.getTime()) / 2;
  const solarNoon = new Date(noonMs).toISOString();

  // Determine state
  const isAfterSunrise = date.getTime() >= sunriseDate.getTime();
  const isBeforeSunset = date.getTime() <= sunsetDate.getTime();
  const isDaytime = isAfterSunrise && isBeforeSunset;

  let dayNightState: DayNightState = 'day';
  let dayNightLabel = 'Daytime';

  if (elevation < -18) {
    dayNightState = 'midnight';
    dayNightLabel = 'Deep Midnight';
  } else if (elevation < -6) {
    dayNightState = 'night';
    dayNightLabel = 'Nocturnal Night';
  } else if (elevation >= -6 && elevation < 0) {
    if (!isAfterSunrise && date.getTime() < noonMs) {
      dayNightState = 'dawn';
      dayNightLabel = 'Atmospheric Dawn';
    } else {
      dayNightState = 'dusk';
      dayNightLabel = 'Twilight Dusk';
    }
  } else if (elevation >= 0 && elevation < 2) {
    if (date.getTime() < noonMs) {
      dayNightState = 'sunrise';
      dayNightLabel = 'Golden Sunrise';
    } else {
      dayNightState = 'sunset';
      dayNightLabel = 'Crimson Sunset';
    }
  } else if (elevation >= 2 && elevation <= 8) {
    if (date.getTime() < noonMs) {
      dayNightState = 'golden_hour_morning';
      dayNightLabel = 'Morning Golden Hour';
    } else {
      dayNightState = 'golden_hour_evening';
      dayNightLabel = 'Evening Golden Hour';
    }
  } else {
    dayNightState = 'day';
    dayNightLabel = 'Radiant Daylight';
  }

  return {
    solarElevation: elevation,
    solarAzimuth: azimuth,
    sunriseTime: sunrise,
    sunsetTime: sunset,
    goldenHourMorning: { start: ghMorningStart, end: ghMorningEnd },
    goldenHourEvening: { start: ghEveningStart, end: ghEveningEnd },
    solarNoon,
    dawn,
    dusk,
    dayNightState,
    dayNightLabel,
    isDaytime,
    moonPhase,
  };
}
