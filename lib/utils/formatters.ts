export function formatLocalTime(
  date: Date,
  timezone: string,
  is24h = true,
  includeSeconds = false
): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: !is24h,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function getLocalHourInTimezone(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const min = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const sec = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
    return hour + min / 60 + sec / 3600;
  } catch {
    return date.getHours() + date.getMinutes() / 60;
  }
}

export function formatLocalDate(date: Date, timezone: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || 'UTC',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return date.toDateString();
  }
}

export function getTimezoneOffsetDifference(targetTimezone: string): string {
  try {
    const now = new Date();
    const localFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const localParts = localFormatter.formatToParts(now);
    const targetParts = targetFormatter.formatToParts(now);

    const localHour = parseInt(localParts.find((p) => p.type === 'hour')?.value || '0', 10);
    const targetHour = parseInt(targetParts.find((p) => p.type === 'hour')?.value || '0', 10);

    let diff = targetHour - localHour;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;

    if (diff === 0) return 'Same time';
    return diff > 0 ? `+${diff} hrs` : `${diff} hrs`;
  } catch {
    return '';
  }
}

export function formatTemperature(celsius: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
  if (unit === 'fahrenheit') {
    const f = Math.round((celsius * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph' | 'ms' = 'kmh'): string {
  if (unit === 'mph') {
    const mph = Math.round(kmh * 0.621371 * 10) / 10;
    return `${mph} mph`;
  }
  if (unit === 'ms') {
    const ms = Math.round((kmh / 3.6) * 10) / 10;
    return `${ms} m/s`;
  }
  return `${Math.round(kmh * 10) / 10} km/h`;
}

export function getWindDirectionCompass(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) {
    const km = Math.round((meters / 1000) * 10) / 10;
    return `${km} km`;
  }
  return `${meters} m`;
}

export function getUvCategory(uvIndex: number): { label: string; color: string } {
  if (uvIndex <= 2) return { label: 'Low', color: '#10b981' };
  if (uvIndex <= 5) return { label: 'Moderate', color: '#f59e0b' };
  if (uvIndex <= 7) return { label: 'High', color: '#f97316' };
  if (uvIndex <= 10) return { label: 'Very High', color: '#ef4444' };
  return { label: 'Extreme', color: '#a855f7' };
}

export function formatTimeSeconds(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
