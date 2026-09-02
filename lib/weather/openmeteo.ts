import {
  AirQualityData,
  CurrentWeatherData,
  DailyForecastData,
  HourlyForecastData,
  LocationData,
} from '@/types';

export const POPULAR_CITIES: LocationData[] = [
  {
    id: 'jakarta-id',
    name: 'Jakarta',
    admin1: 'DKI Jakarta',
    country: 'Indonesia',
    countryCode: 'ID',
    latitude: -6.2088,
    longitude: 106.8456,
    timezone: 'Asia/Jakarta',
  },
  {
    id: 'bandung-id',
    name: 'Bandung',
    admin1: 'Jawa Barat',
    country: 'Indonesia',
    countryCode: 'ID',
    latitude: -6.9175,
    longitude: 107.6191,
    timezone: 'Asia/Jakarta',
  },
  {
    id: 'bali-id',
    name: 'Denpasar',
    admin1: 'Bali',
    country: 'Indonesia',
    countryCode: 'ID',
    latitude: -8.6705,
    longitude: 115.2126,
    timezone: 'Asia/Makassar',
  },
  {
    id: 'surabaya-id',
    name: 'Surabaya',
    admin1: 'Jawa Timur',
    country: 'Indonesia',
    countryCode: 'ID',
    latitude: -7.2575,
    longitude: 112.7521,
    timezone: 'Asia/Jakarta',
  },
  {
    id: 'tokyo-jp',
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: 'Asia/Tokyo',
  },
  {
    id: 'london-gb',
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    latitude: 51.5085,
    longitude: -0.1257,
    timezone: 'Europe/London',
  },
  {
    id: 'new-york-us',
    name: 'New York',
    admin1: 'New York',
    country: 'United States',
    countryCode: 'US',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
  {
    id: 'paris-fr',
    name: 'Paris',
    country: 'France',
    countryCode: 'FR',
    latitude: 48.8534,
    longitude: 2.3488,
    timezone: 'Europe/Paris',
  },
  {
    id: 'sydney-au',
    name: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    latitude: -33.8678,
    longitude: 151.2073,
    timezone: 'Australia/Sydney',
  },
  {
    id: 'cairo-eg',
    name: 'Cairo',
    country: 'Egypt',
    countryCode: 'EG',
    latitude: 30.0626,
    longitude: 31.2497,
    timezone: 'Africa/Cairo',
  },
];

export async function searchCities(query: string): Promise<LocationData[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=10&language=en&format=json`;

    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`Geocoding failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: {
      id: number;
      name: string;
      admin1?: string;
      country?: string;
      country_code?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
      elevation?: number;
    }) => ({
      id: `${item.id}-${item.name.toLowerCase()}`,
      name: item.name,
      admin1: item.admin1,
      country: item.country || '',
      countryCode: item.country_code || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'UTC',
      elevation: item.elevation,
    }));
  } catch (error) {
    console.error('Error searching cities:', error);
    // Fallback search locally in popular cities
    const lower = query.toLowerCase();
    return POPULAR_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.country.toLowerCase().includes(lower)
    );
  }
}

export interface WeatherBundle {
  current: CurrentWeatherData;
  hourly: HourlyForecastData;
  daily: DailyForecastData;
  airQuality?: AirQualityData;
  timezone: string;
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  timezone = 'auto'
): Promise<WeatherBundle> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=${encodeURIComponent(
    timezone
  )}&forecast_days=7`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=${encodeURIComponent(
    timezone
  )}`;

  try {
    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl, { headers: { Accept: 'application/json' } }),
      fetch(aqiUrl, { headers: { Accept: 'application/json' } }),
    ]);

    if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
      throw new Error('Weather forecast API failed');
    }

    const weatherJson = await weatherRes.value.json();
    let airQuality: AirQualityData | undefined = undefined;

    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      try {
        const aqiJson = await aqiRes.value.json();
        const currentAqi = aqiJson.current;
        if (currentAqi) {
          const rawAqi = currentAqi.us_aqi ?? currentAqi.european_aqi ?? 35;
          let aqiLabel: AirQualityData['aqiLabel'] = 'Good';
          if (rawAqi > 300) aqiLabel = 'Hazardous';
          else if (rawAqi > 200) aqiLabel = 'Very Unhealthy';
          else if (rawAqi > 150) aqiLabel = 'Unhealthy';
          else if (rawAqi > 100) aqiLabel = 'Unhealthy for Sensitive';
          else if (rawAqi > 50) aqiLabel = 'Moderate';

          airQuality = {
            aqi: Math.round(rawAqi),
            aqiLabel,
            pm2_5: Math.round((currentAqi.pm2_5 ?? 10) * 10) / 10,
            pm10: Math.round((currentAqi.pm10 ?? 18) * 10) / 10,
            no2: currentAqi.nitrogen_dioxide,
            o3: currentAqi.ozone,
            so2: currentAqi.sulphur_dioxide,
          };
        }
      } catch (e) {
        console.warn('AQI parse error:', e);
      }
    }

    const curr = weatherJson.current;
    const current: CurrentWeatherData = {
      temperature: Math.round((curr.temperature_2m ?? 20) * 10) / 10,
      apparentTemperature: Math.round((curr.apparent_temperature ?? 20) * 10) / 10,
      humidity: Math.round(curr.relative_humidity_2m ?? 60),
      windSpeed: Math.round((curr.wind_speed_10m ?? 10) * 10) / 10,
      windDirection: Math.round(curr.wind_direction_10m ?? 0),
      windGusts: curr.wind_gusts_10m ? Math.round(curr.wind_gusts_10m * 10) / 10 : undefined,
      weatherCode: curr.weather_code ?? 0,
      visibility: curr.visibility ?? 10000,
      uvIndex: Math.round((curr.uv_index ?? 0) * 10) / 10,
      isDay: Boolean(curr.is_day),
      pressure: curr.surface_pressure ? Math.round(curr.surface_pressure) : undefined,
      precipitation: curr.precipitation ?? 0,
      cloudCover: curr.cloud_cover ?? 0,
      time: curr.time || new Date().toISOString(),
    };

    const hourlyRaw = weatherJson.hourly;
    const hourly: HourlyForecastData = {
      time: hourlyRaw?.time?.slice(0, 24) || [],
      temperature: hourlyRaw?.temperature_2m?.slice(0, 24) || [],
      apparentTemperature: hourlyRaw?.apparent_temperature?.slice(0, 24) || [],
      weatherCode: hourlyRaw?.weather_code?.slice(0, 24) || [],
      humidity: hourlyRaw?.relative_humidity_2m?.slice(0, 24) || [],
      precipitationProbability: hourlyRaw?.precipitation_probability?.slice(0, 24) || [],
      windSpeed: hourlyRaw?.wind_speed_10m?.slice(0, 24) || [],
      uvIndex: hourlyRaw?.uv_index?.slice(0, 24) || [],
      isDay: hourlyRaw?.is_day?.slice(0, 24) || [],
    };

    const dailyRaw = weatherJson.daily;
    const daily: DailyForecastData = {
      time: dailyRaw?.time || [],
      weatherCode: dailyRaw?.weather_code || [],
      temperatureMax: dailyRaw?.temperature_2m_max || [],
      temperatureMin: dailyRaw?.temperature_2m_min || [],
      sunrise: dailyRaw?.sunrise || [],
      sunset: dailyRaw?.sunset || [],
      uvIndexMax: dailyRaw?.uv_index_max || [],
      precipitationProbabilityMax: dailyRaw?.precipitation_probability_max || [],
    };

    return {
      current,
      hourly,
      daily,
      airQuality,
      timezone: weatherJson.timezone || timezone,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getFallbackWeatherData(timezone);
  }
}

export function getFallbackWeatherData(timezone = 'UTC'): WeatherBundle {
  const now = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now.getTime() + i * 3600 * 1000);
    return d.toISOString();
  });

  return {
    current: {
      temperature: 21.5,
      apparentTemperature: 22.0,
      humidity: 68,
      windSpeed: 12.4,
      windDirection: 180,
      windGusts: 18.0,
      weatherCode: 2,
      visibility: 10000,
      uvIndex: 4.2,
      isDay: true,
      pressure: 1013,
      precipitation: 0,
      cloudCover: 35,
      time: now.toISOString(),
    },
    hourly: {
      time: hours,
      temperature: hours.map((_, i) => 18 + Math.sin(i / 3) * 6),
      apparentTemperature: hours.map((_, i) => 18 + Math.sin(i / 3) * 6 + 0.5),
      weatherCode: hours.map(() => 2),
      humidity: hours.map((_, i) => 60 + Math.cos(i / 3) * 15),
      precipitationProbability: hours.map((_, i) => (i > 10 && i < 16 ? 30 : 5)),
      windSpeed: hours.map((_, i) => 10 + Math.sin(i / 2) * 5),
      uvIndex: hours.map((_, i) => (i >= 7 && i <= 17 ? Math.max(0, Math.sin((i - 7) / 10 * Math.PI) * 6) : 0)),
      isDay: hours.map((_, i) => (i >= 6 && i <= 18 ? 1 : 0)),
    },
    daily: {
      time: [now.toISOString().split('T')[0]],
      weatherCode: [2],
      temperatureMax: [24.5],
      temperatureMin: [17.2],
      sunrise: [new Date(now.setHours(6, 15, 0, 0)).toISOString()],
      sunset: [new Date(now.setHours(18, 45, 0, 0)).toISOString()],
      uvIndexMax: [6.1],
      precipitationProbabilityMax: [20],
    },
    airQuality: {
      aqi: 32,
      aqiLabel: 'Good',
      pm2_5: 7.8,
      pm10: 14.2,
    },
    timezone,
  };
}
