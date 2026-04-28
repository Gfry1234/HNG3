// ============================================================================
// WEATHER STORE - Centralized Export
// ============================================================================
// This file provides a clean API for importing from the weather store.
// Import everything from this file instead of individual modules.
// ============================================================================

export {
  useWeatherStore,
  initializeWeatherStore,
  // Selectors
  selectCurrentWeather,
  selectForecast,
  selectIsLoading,
  selectError,
  selectCoords,
  selectFavorites,
  selectSearchResults,
  selectIsSearching,
  selectIsOffline,
  createIsFavoriteSelector,
  // Types
  type FavoriteCity,
  type WeatherState,
} from './weather-store';