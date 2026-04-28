'use client';

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { CurrentWeather } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { SearchBar } from '@/components/SearchBar';
import { LoadingState } from '@/components/LoadingState';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useWeatherStore, initializeWeatherStore } from '@/lib/store/weather-store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Cloud, MapPin, Navigation } from 'lucide-react';

export default function Home() {
  // Initialize store with persisted data
  useEffect(() => {
    initializeWeatherStore();
  }, []);

  // Subscribe to store state with useShallow for stability
  const {
    coords,
    currentWeather,
    forecast,
    isLoading,
    error,
    isOffline,
    favorites,
    actions,
  } = useWeatherStore(useShallow((state) => ({
    coords: state.coords,
    currentWeather: state.currentWeather,
    forecast: state.forecast,
    isLoading: state.isLoading,
    error: state.error,
    isOffline: state.isOffline,
    favorites: state.favorites,
    actions: state.actions,
  })));

  // Geolocation hook (data source for location flow)
  const { 
    coords: geoCoords, 
    error: geoError, 
    requestLocation, 
    permissionStatus 
  } = useGeolocation();

  // Sync geolocation with store (dataflow: geolocation -> store -> components)
  useEffect(() => {
    if (geoCoords && !coords) {
      actions.setLocation({
        latitude: geoCoords.latitude,
        longitude: geoCoords.longitude,
      });
    }
  }, [geoCoords, coords, actions]);

  // Monitor online/offline status (dataflow: network -> store -> UI)
  useEffect(() => {
    // Set initial offline status correctly based on navigator
    const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    actions.setOffline(!isCurrentlyOnline);

    const handleOnline = () => {
      // Use direct store access for the most up-to-date state without triggering effect re-runs
      const state = useWeatherStore.getState();
      
      if (state.isOffline) {
        actions.setOffline(false);
        if (state.coords && !state.isLoading) {
          actions.refreshWeather();
        }
      }
    };
    
    const handleOffline = () => {
      actions.setOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [actions]);

  // Handle toggle favorite (dataflow: user action -> favorites state -> localStorage)
  const handleToggleFavorite = () => {
    if (currentWeather) {
      actions.toggleFavorite(currentWeather);
    }
  };

  // Check if current location is favorited
  const isCurrentFavorite = currentWeather 
    ? favorites.some(
        (fav) => fav.lat.toFixed(2) === currentWeather.coord.lat.toFixed(2) && 
                 fav.lon.toFixed(2) === currentWeather.coord.lon.toFixed(2)
      )
    : false;

  // Determine display error (dataflow: multiple error sources -> single error state)
  const displayError = geoError && typeof geoError === 'object' && geoError.message 
    ? geoError.message 
    : error;

  // Loading state (dataflow: loading flag -> UI state)
  const showLoadingState = isLoading && !currentWeather;

  return (
    <main className="min-h-screen pb-12 relative z-10 gradient-mesh">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-particle-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-400/30 rounded-full animate-particle-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-particle-float" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-cyan-400/20 rounded-full animate-particle-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header - Dataflow visualization with gradient mesh */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0e27]/60 border-b border-white/8 gradient-card">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 neon-glow-blue">
              <Cloud className="text-blue-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">Weather</h1>
              <p className="text-white/40 text-xs">Real-time forecasts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={() => actions.refreshWeather()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 glass-subtle hover:glass rounded-xl transition-all duration-300 text-white text-sm font-medium group hover:neon-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh weather data"
            >
              <svg 
                className={`text-cyan-400 group-hover:text-cyan-300 transition-all ${isLoading ? 'animate-spin' : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 2.2" />
              </svg>
              <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
            </button>
            
            {/* My Location Button */}
            <button
              onClick={() => requestLocation()}
              className="flex items-center gap-2 px-4 py-2.5 glass-subtle hover:glass rounded-xl transition-all duration-300 text-white text-sm font-medium group hover:neon-glow-indigo"
            >
              <Navigation className="text-blue-400 group-hover:rotate-45 transition-transform duration-300" size={16} />
              <span>My Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Bar - Data input node */}
        <SearchBar />

        {/* Error Display - Error state visualization (non-blocking when has data) */}
        {(displayError || (isOffline && !currentWeather)) && (
          <ErrorDisplay
            error={displayError}
            onRetry={() => {
              if (displayError?.includes('location')) {
                requestLocation();
              } else {
                actions.refreshWeather();
              }
            }}
            isOffline={isOffline}
            hasCachedData={!!currentWeather}
          />
        )}

        {/* Loading State - Loading indicator (only show if no data at all) */}
        {showLoadingState && <LoadingState />}

        {/* Weather Display - Data visualization nodes (ALWAYS INTERACTIVE) */}
        {currentWeather && forecast && (
          <div className="animate-fade-in space-y-8">
            <CurrentWeather
              data={currentWeather}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
              isUpdating={isLoading}
            />
            <HourlyForecast data={forecast} isUpdating={isLoading} />
            <DailyForecast data={forecast} isUpdating={isLoading} />
          </div>
        )}

        {/* Empty State - Initial state visualization */}
        {!showLoadingState && !currentWeather && !displayError && !isOffline && (
          <div className="rounded-3xl glass-strong p-12 text-center shadow-2xl animate-fade-in gradient-card neon-glow-purple">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-6 animate-float neon-glow-blue">
              <Cloud className="text-blue-400" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gradient-primary mb-3">
              Check the Weather
            </h2>
            <p className="text-white/50 mb-8 text-lg font-light">
              Search for a city or enable location to get started
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => requestLocation()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <MapPin size={18} />
                Enable Location
              </button>
            </div>
            {permissionStatus === 'denied' && (
              <p className="text-white/30 text-sm mt-6 max-w-md mx-auto">
                Location permission was denied. You can enable it in your browser settings or search for a city above.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}