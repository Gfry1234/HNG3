import { useState, useCallback, useEffect } from 'react';
import { CurrentWeatherResponse, ForecastResponse } from '@/lib/types';
import { getCurrentWeather, getForecast } from '@/lib/api';
import { getCachedWeather, setCachedWeather } from '@/lib/cache';

interface UseWeatherReturn {
  current: CurrentWeatherResponse | null;
  forecast: ForecastResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWeather(lat: number | null, lon: number | null): UseWeatherReturn {
  const [current, setCurrent] = useState<CurrentWeatherResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (lat === null || lon === null) return;

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedWeather(lat, lon);
      if (cached) {
        console.log('[v0] Using cached weather data');
        setCurrent(cached.current);
        setForecast(cached.forecast);
        setLoading(false);
        return;
      }

      // Fetch from API
      const [currentData, forecastData] = await Promise.all([
        getCurrentWeather(lat, lon),
        getForecast(lat, lon),
      ]);

      setCurrent(currentData);
      setForecast(forecastData);

      // Cache the results
      setCachedWeather(lat, lon, {
        current: currentData,
        forecast: forecastData,
        timestamp: Date.now(),
      });

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(message);
      console.error('[v0] Weather fetch error:', err);

      // Try to use stale cache as fallback
      const staleCache = getCachedWeather(lat, lon);
      if (staleCache) {
        setCurrent(staleCache.current);
        setForecast(staleCache.forecast);
        setError(message + ' (showing cached data)');
      }
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return {
    current,
    forecast,
    loading,
    error,
    refetch: fetchWeather,
  };
}
