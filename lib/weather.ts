import { Weather } from './types';

export function getWeatherIcon(weather: Weather): string {
  const iconMap: Record<string, string> = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '🌤️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌧️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };
  
  return iconMap[weather.icon] || '🌡️';
}

export function getWeatherColor(weather: Weather): string {
  const colorMap: Record<string, string> = {
    'clear': 'from-blue-400 to-blue-600',
    'clouds': 'from-gray-400 to-gray-600',
    'rain': 'from-blue-500 to-blue-700',
    'drizzle': 'from-blue-400 to-blue-600',
    'thunderstorm': 'from-purple-600 to-purple-900',
    'snow': 'from-blue-300 to-blue-500',
    'mist': 'from-gray-400 to-gray-600',
  };
  
  const main = weather.main.toLowerCase();
  return colorMap[main] || 'from-blue-400 to-blue-600';
}

export function formatTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTemperature(temp: number): string {
  return Math.round(temp).toString();
}

export function getHourlyForecasts(forecasts: any[], timezone: number, limit: number = 5) {
  return forecasts.slice(0, limit).map((forecast) => ({
    ...forecast,
    time: formatTime(forecast.dt, timezone),
    date: formatDate(forecast.dt, timezone),
  }));
}

export function getDailyForecasts(forecasts: any[], timezone: number) {
  const dailyMap = new Map<string, any>();
  
  forecasts.forEach((forecast) => {
    const date = formatDate(forecast.dt, timezone);
    
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        dt: forecast.dt,
        date,
        temps: [forecast.main.temp],
        weather: forecast.weather[0],
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
      });
    } else {
      const existing = dailyMap.get(date)!;
      existing.temps.push(forecast.main.temp);
    }
  });
  
  const dailyForecasts = Array.from(dailyMap.values()).slice(0, 5);
  
  return dailyForecasts.map((daily) => ({
    ...daily,
    tempMin: Math.round(Math.min(...daily.temps)),
    tempMax: Math.round(Math.max(...daily.temps)),
  }));
}

export function isOnline(): boolean {
  return typeof window !== 'undefined' && navigator.onLine;
}

export async function checkInternetConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  
  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-store',
    });
    return response.status >= 0;
  } catch {
    return false;
  }
}
