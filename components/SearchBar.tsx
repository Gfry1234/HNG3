'use client';

import { useState, useRef, useEffect } from 'react';
import { useWeatherStore } from '@/lib/store/weather-store';
import { useShallow } from 'zustand/react/shallow';
import { Search, X, Star, MapPin, Wifi } from 'lucide-react';

// ============================================================================
// SEARCH BAR - Data Input Node
// ============================================================================
// This component serves as a data input node in the dataflow architecture:
// 1. User input flows into the component
// 2. Search query flows to the store via actions.searchCities
// 3. Search results flow back from the store to the component
// 4. City selection flows to the store via actions.setLocation
// ============================================================================

export function SearchBar() {
  // Subscribe to store state with useShallow for stability
  const { searchResults, isSearching, favorites, isOffline, actions } = useWeatherStore(useShallow((state) => ({
    searchResults: state.searchResults,
    isSearching: state.isSearching,
    favorites: state.favorites,
    isOffline: state.isOffline,
    actions: state.actions,
  })));

  // Local UI state (component-internal dataflow)
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search handler (dataflow: input -> store)
  useEffect(() => {
    if (!query.trim()) {
      actions.clearSearch();
      return;
    }

    const debounceTimer = setTimeout(() => {
      actions.searchCities(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, actions]);

  // Handle city selection (dataflow: component -> store -> weather fetch)
  const handleSelectResult = (result: { name: string; lat: number; lon: number; country?: string }) => {
    actions.setLocation({
      latitude: result.lat,
      longitude: result.lon,
    });
    setQuery('');
    setShowDropdown(false);
  };

  // Handle favorite selection (dataflow: favorites -> location -> weather)
  const handleSelectFavorite = (lat: number, lon: number, name: string) => {
    actions.setLocation({ latitude: lat, longitude: lon });
    setShowDropdown(false);
  };

  // Clear search (dataflow: reset input state)
  const handleClearSearch = () => {
    setQuery('');
    actions.clearSearch();
    setShowDropdown(false);
  };

  return (
    <div className="relative mb-8">
      {/* Search Input - Primary data input node */}
      <div className="glass-strong rounded-3xl p-1 shadow-2xl neon-glow-indigo transition-all duration-300 hover:neon-glow-blue">
        <div className="flex items-center gap-3 px-5 py-4">
          <Search className="text-white/60 flex-shrink-0" size={20} />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setShowDropdown(true);
            }}
            placeholder="Search for a city..."
            className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-lg font-light"
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="text-white/40 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown - Data visualization panel */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-3 rounded-2xl glass-strong shadow-2xl z-50 overflow-hidden animate-expand-in gradient-card"
        >
          {isSearching && (
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 text-white/60">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          )}

          {/* Offline indicator in search */}
          {isOffline && !isSearching && (
            <div className="p-4 text-center border-b border-white/5">
              <div className="flex items-center justify-center gap-2 text-amber-400/80 text-xs">
                <Wifi size={12} />
                <span>You're offline — search will work when connected</span>
              </div>
            </div>
          )}

          {searchResults.length === 0 && !isSearching && query.trim() && (
            <div className="p-8 text-center">
              <Search className="mx-auto text-white/30 mb-3" size={32} />
              <p className="text-white/50 text-sm">No cities found</p>
              <p className="text-white/30 text-xs mt-1">Try a different search term</p>
            </div>
          )}

          {/* Search Results - Data list */}
          {searchResults.length > 0 && !isSearching && (
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lon}-${index}`}
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-5 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0 group dataflow-connector"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="text-white/40 group-hover:text-blue-400 transition-colors" size={16} />
                    <div>
                      <p className="text-white font-medium">
                        {result.name}
                        {result.country && (
                          <span className="text-white/50 text-sm ml-2">
                            {result.country}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Favorites Section - Persisted data list */}
          {!query.trim() && favorites.length > 0 && (
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Star className="text-amber-400 animate-glow-breathe" size={14} />
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                  Saved Locations
                </p>
              </div>
              <div className="space-y-2">
                {favorites.map((fav, index) => (
                  <button
                    key={`${fav.lat}-${fav.lon}`}
                    onClick={() => handleSelectFavorite(fav.lat, fav.lon, fav.name)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3 group animate-slide-in"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <MapPin className="text-white/40 group-hover:text-amber-400 transition-colors" size={16} />
                    <span className="text-white text-sm">{fav.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!query.trim() && favorites.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-white/40 text-xs">Search for a city to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}