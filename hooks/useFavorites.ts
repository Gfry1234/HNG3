import { useState, useEffect, useCallback } from 'react';
import {
  getFavoriteCities,
  addFavoriteCity,
  removeFavoriteCity,
  isCityFavorite,
} from '@/lib/cache';

interface FavoriteCity {
  name: string;
  lat: number;
  lon: number;
}

interface UseFavoritesReturn {
  favorites: FavoriteCity[];
  addFavorite: (city: FavoriteCity) => void;
  removeFavorite: (lat: number, lon: number) => void;
  isFavorite: (lat: number, lon: number) => boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useEffect(() => {
    const loaded = getFavoriteCities();
    setFavorites(loaded);
  }, []);

  const addFavorite = useCallback((city: FavoriteCity) => {
    addFavoriteCity(city);
    setFavorites((prev) => {
      const exists = prev.some(
        (fav) =>
          fav.lat.toFixed(2) === city.lat.toFixed(2) &&
          fav.lon.toFixed(2) === city.lon.toFixed(2)
      );
      if (exists) return prev;
      return [...prev, city];
    });
  }, []);

  const removeFavorite = useCallback((lat: number, lon: number) => {
    removeFavoriteCity(lat, lon);
    setFavorites((prev) =>
      prev.filter(
        (fav) =>
          !(fav.lat.toFixed(2) === lat.toFixed(2) &&
            fav.lon.toFixed(2) === lon.toFixed(2))
      )
    );
  }, []);

  const isFavorite = useCallback((lat: number, lon: number) => {
    return isCityFavorite(lat, lon);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
