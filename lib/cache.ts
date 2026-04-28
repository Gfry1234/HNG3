import { CachedWeatherData } from './types';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY_PREFIX = 'weather_cache_';

export function getCacheKey(lat: number, lon: number): string {
  return `${CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export function getCachedWeather(lat: number, lon: number): CachedWeatherData | null {
  if (typeof window === 'undefined') return null;
  
  const key = getCacheKey(lat, lon);
  const cached = localStorage.getItem(key);
  
  if (!cached) return null;
  
  try {
    const data: CachedWeatherData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache has expired
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[v0] Error parsing cached weather data:', error);
    localStorage.removeItem(key);
    return null;
  }
}

export function setCachedWeather(
  lat: number,
  lon: number,
  data: CachedWeatherData
): void {
  if (typeof window === 'undefined') return;
  
  const key = getCacheKey(lat, lon);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('[v0] Error saving to cache:', error);
  }
}

export function getFavoriteCities(): Array<{ name: string; lat: number; lon: number }> {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('favorite_cities');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[v0] Error reading favorite cities:', error);
    return [];
  }
}

export function addFavoriteCity(city: {
  name: string;
  lat: number;
  lon: number;
}): void {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavoriteCities();
    
    // Check if city already exists
    const exists = favorites.some(
      (fav) => fav.lat.toFixed(2) === city.lat.toFixed(2) &&
               fav.lon.toFixed(2) === city.lon.toFixed(2)
    );
    
    if (!exists) {
      favorites.push(city);
      localStorage.setItem('favorite_cities', JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('[v0] Error adding favorite city:', error);
  }
}

export function removeFavoriteCity(lat: number, lon: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavoriteCities();
    const filtered = favorites.filter(
      (fav) => !(fav.lat.toFixed(2) === lat.toFixed(2) &&
                 fav.lon.toFixed(2) === lon.toFixed(2))
    );
    localStorage.setItem('favorite_cities', JSON.stringify(filtered));
  } catch (error) {
    console.error('[v0] Error removing favorite city:', error);
  }
}

export function isCityFavorite(lat: number, lon: number): boolean {
  const favorites = getFavoriteCities();
  return favorites.some(
    (fav) => fav.lat.toFixed(2) === lat.toFixed(2) &&
             fav.lon.toFixed(2) === lon.toFixed(2)
  );
}
