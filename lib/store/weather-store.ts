'use client';

import { create } from 'zustand';
import { CurrentWeatherResponse, ForecastResponse, LocationCoords } from '@/lib/types';
import { getCurrentWeather, getForecast, searchCity } from '@/lib/api';
import { getCachedWeather, setCachedWeather } from '@/lib/cache';

// ============================================================================
// DATAFLOW ARCHITECTURE - Centralized Weather Store
// ============================================================================
// This store implements a unidirectional data flow pattern where:
// 1. Actions dispatch events that mutate state
// 2. State changes flow downstream to components
// 3. Components subscribe to state slices they need
// 4. All data transformations happen in the store layer
// ============================================================================

export interface FavoriteCity {
  name: string;
  lat: number;
  lon: number;
}

export interface WeatherState {
  // Current location data
  coords: LocationCoords | null;
  
  // Weather data (flows from API -> cache -> components)
  currentWeather: CurrentWeatherResponse | null;
  forecast: ForecastResponse | null;
  
  // UI state
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  isOffline: boolean;
  
  // Favorites (persisted data flow)
  favorites: FavoriteCity[];
  
  // Search results (transient data flow)
  searchResults: Array<{ name: string; lat: number; lon: number; country?: string }>;
  
  // Actions - these trigger data flow through the system
  actions: {
    // Location flow
    setLocation: (coords: LocationCoords) => void;
    clearLocation: () => void;
    
    // Weather data flow
    fetchWeather: (lat: number, lon: number, skipCache?: boolean) => Promise<void>;
    refreshWeather: () => Promise<void>;
    clearWeather: () => void;
    
    // Search flow
    searchCities: (query: string) => Promise<void>;
    clearSearch: () => void;
    
    // Favorites flow
    addFavorite: (city: FavoriteCity) => void;
    removeFavorite: (lat: number, lon: number) => void;
    toggleFavorite: (city: CurrentWeatherResponse) => void;
    
    // UI state flow
    setError: (error: string | null) => void;
    setOffline: (isOffline: boolean) => void;
    reset: () => void;
  };
}

// Initial state factory for clean resets
const createInitialState = (): Omit<WeatherState, 'actions'> => ({
  coords: null,
  currentWeather: null,
  forecast: null,
  isLoading: false,
  isSearching: false,
  error: null,
  isOffline: false,
  favorites: [],
  searchResults: [],
});

export const useWeatherStore = create<WeatherState>((set, get) => ({
  ...createInitialState(),
  
  actions: {
    // ========================================================================
    // LOCATION FLOW
    // Input: Geolocation coordinates -> State: coords -> Triggers: fetchWeather
    // ========================================================================
    setLocation: (coords: LocationCoords) => {
      const currentCoords = get().coords;
      // Precision-based check to avoid redundant updates from noisy geolocation
      const isSameLocation = currentCoords && 
        currentCoords.latitude.toFixed(4) === coords.latitude.toFixed(4) && 
        currentCoords.longitude.toFixed(4) === coords.longitude.toFixed(4);

      if (!isSameLocation) {
        set({ coords });
        // Auto-trigger weather fetch when location is set
        get().actions.fetchWeather(coords.latitude, coords.longitude);
      }
    },
    
    clearLocation: () => {
      set({ coords: null });
      get().actions.clearWeather();
    },
    
    // ========================================================================
    // WEATHER DATA FLOW
    // Flow: Cache Check -> API Fetch -> State Update -> Cache Store
    // ========================================================================
    fetchWeather: async (lat: number, lon: number, skipCache: boolean = false) => {
      set({ isLoading: true, error: null });
      
      try {
        // Step 1: Check cache first (dataflow optimization) - unless skipCache is true
        if (!skipCache) {
          const cached = getCachedWeather(lat, lon);
          if (cached) {
            set({
              currentWeather: cached.current,
              forecast: cached.forecast,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
        
        // Step 2: Fetch from API (parallel data streams)
        const [currentData, forecastData] = await Promise.all([
          getCurrentWeather(lat, lon),
          getForecast(lat, lon),
        ]);
        
        // Step 3: Update state (data flows to components)
        set({
          currentWeather: currentData,
          forecast: forecastData,
          isLoading: false,
          error: null,
        });
        
        // Step 4: Cache the results (persist data flow)
        setCachedWeather(lat, lon, {
          current: currentData,
          forecast: forecastData,
          timestamp: Date.now(),
        });
        
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
        console.error('[Store] Weather fetch error:', err);
        
        // Fallback to stale cache if available
        const staleCache = getCachedWeather(lat, lon);
        if (staleCache) {
          set({
            currentWeather: staleCache.current,
            forecast: staleCache.forecast,
            isLoading: false,
            error: message + ' (showing cached data)',
          });
        } else {
          set({
            isLoading: false,
            error: message,
          });
        }
      } finally {
        set({ isLoading: false });
      }
    },
    
    refreshWeather: async () => {
      const { coords } = get();
      if (coords) {
        // Force fresh fetch by skipping cache
        set({ isLoading: true, error: null });
        await get().actions.fetchWeather(coords.latitude, coords.longitude, true);
      }
    },
    
    clearWeather: () => {
      set({
        currentWeather: null,
        forecast: null,
        isLoading: false,
        error: null,
      });
    },
    
    // ========================================================================
    // SEARCH DATA FLOW
    // Flow: Query Input -> API Search -> Results State -> Dropdown Display
    // ========================================================================
    searchCities: async (query: string) => {
      if (!query.trim()) {
        set({ searchResults: [], isSearching: false });
        return;
      }
      
      set({ isSearching: true, error: null });
      
      try {
        const results = await searchCity(query);
        set({ searchResults: results, isSearching: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Search failed';
        set({ 
          searchResults: [], 
          isSearching: false,
          error: message,
        });
      }
    },
    
    clearSearch: () => {
      set({ searchResults: [], isSearching: false, error: null });
    },
    
    // ========================================================================
    // FAVORITES DATA FLOW
    // Flow: User Action -> State Update -> LocalStorage Persist
    // ========================================================================
    addFavorite: (city: FavoriteCity) => {
      const { favorites } = get();
      const exists = favorites.some(
        (fav) => fav.lat.toFixed(2) === city.lat.toFixed(2) && 
                 fav.lon.toFixed(2) === city.lon.toFixed(2)
      );
      
      if (!exists) {
        const newFavorites = [...favorites, city];
        set({ favorites: newFavorites });
        
        // Persist to localStorage
        try {
          localStorage.setItem('favorite_cities', JSON.stringify(newFavorites));
        } catch (e) {
          console.error('[Store] Failed to persist favorites:', e);
        }
      }
    },
    
    removeFavorite: (lat: number, lon: number) => {
      const { favorites } = get();
      const newFavorites = favorites.filter(
        (fav) => !(fav.lat.toFixed(2) === lat.toFixed(2) && 
                   fav.lon.toFixed(2) === lon.toFixed(2))
      );
      
      set({ favorites: newFavorites });
      
      // Persist to localStorage
      try {
        localStorage.setItem('favorite_cities', JSON.stringify(newFavorites));
      } catch (e) {
        console.error('[Store] Failed to persist favorites:', e);
      }
    },
    
    toggleFavorite: (city: CurrentWeatherResponse) => {
      const { favorites, actions } = get();
      const isFav = favorites.some(
        (fav) => fav.lat.toFixed(2) === city.coord.lat.toFixed(2) && 
                 fav.lon.toFixed(2) === city.coord.lon.toFixed(2)
      );
      
      if (isFav) {
        actions.removeFavorite(city.coord.lat, city.coord.lon);
      } else {
        actions.addFavorite({
          name: city.name,
          lat: city.coord.lat,
          lon: city.coord.lon,
        });
      }
    },
    
    // ========================================================================
    // UI STATE FLOW
    // ========================================================================
    setError: (error: string | null) => {
      set({ error });
    },
    
    setOffline: (isOffline: boolean) => {
      if (get().isOffline !== isOffline) {
        set({ isOffline });
      }
    },
    
    reset: () => {
      set(createInitialState());
    },
  },
}));

// ============================================================================
// SELECTORS - Optimized data flow subscriptions
// ============================================================================
// These selectors prevent unnecessary re-renders by subscribing to specific
// state slices rather than the entire store.
// ============================================================================

export const selectCurrentWeather = (state: WeatherState) => state.currentWeather;
export const selectForecast = (state: WeatherState) => state.forecast;
export const selectIsLoading = (state: WeatherState) => state.isLoading;
export const selectError = (state: WeatherState) => state.error;
export const selectCoords = (state: WeatherState) => state.coords;
export const selectFavorites = (state: WeatherState) => state.favorites;
export const selectSearchResults = (state: WeatherState) => state.searchResults;
export const selectIsSearching = (state: WeatherState) => state.isSearching;
export const selectIsOffline = (state: WeatherState) => state.isOffline;

// Composed selector for checking if a location is favorited
export const createIsFavoriteSelector = (lat: number, lon: number) => (state: WeatherState) => 
  state.favorites.some(
    (fav) => fav.lat.toFixed(2) === lat.toFixed(2) && fav.lon.toFixed(2) === lon.toFixed(2)
  );

// ============================================================================
// INITIALIZATION - Load persisted data on mount
// ============================================================================

export function initializeWeatherStore() {
  // Load favorites from localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('favorite_cities');
      if (stored) {
        const favorites = JSON.parse(stored);
        useWeatherStore.setState({ favorites });
      }
    } catch (e) {
      console.error('[Store] Failed to initialize from localStorage:', e);
    }
  }
}