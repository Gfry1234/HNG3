'use client';

import { AlertCircle, Wifi, MapPin, Zap, RefreshCw, CheckCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
  isOffline?: boolean;
  hasCachedData?: boolean;
}

// ============================================================================
// ERROR DISPLAY - Error State Visualization
// ============================================================================
// This component displays error states in a non-blocking manner:
// - Offline with cached data: Shows a subtle banner at the top
// - Offline without cached data: Shows a more prominent message
// - API errors: Shows appropriate error with retry option
// - Auto-dismisses when connection is restored
// ============================================================================

export function ErrorDisplay({ error, onRetry, isOffline, hasCachedData }: ErrorDisplayProps) {
  // Don't show anything if there's no error and we're not offline
  if (!error && !isOffline) return null;

  // If we're offline but have cached data, show a subtle banner
  if (isOffline && hasCachedData) {
    return (
      <div className="rounded-2xl glass-subtle p-4 mb-6 animate-fade-in border border-amber-400/20 bg-amber-500/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Wifi className="text-amber-400" size={18} />
            </div>
            <div>
              <p className="text-amber-400 text-sm font-medium">
                You're offline — showing cached data
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                Data will refresh when connection is restored
              </p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-all duration-300"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // If we're offline without cached data, show a more prominent message
  if (isOffline && !hasCachedData) {
    return (
      <div className="rounded-2xl glass-strong p-5 mb-6 animate-fade-in border-l-4 border-l-amber-400/50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-amber-500/10">
            <Wifi className="text-amber-400" size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              No Internet Connection
            </h3>
            <p className="text-white/50 text-sm mb-3">
              Check your network connection. Once reconnected, weather data will load automatically.
            </p>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm"
            >
              <RefreshCw size={14} />
              <span>Check Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For other errors, show the appropriate error display
  const getErrorIcon = () => {
    if (error?.toLowerCase().includes('location')) {
      return <MapPin className="text-orange-400" size={28} />;
    }
    if (error?.toLowerCase().includes('rate limit')) {
      return <Zap className="text-red-400" size={28} />;
    }
    return <AlertCircle className="text-red-400" size={28} />;
  };

  const getErrorTitle = () => {
    if (error?.toLowerCase().includes('location')) return 'Location Access Denied';
    if (error?.toLowerCase().includes('rate limit')) return 'Rate Limit Exceeded';
    return 'Unable to Fetch Weather';
  };

  const getErrorDescription = () => {
    if (error?.toLowerCase().includes('location')) {
      return 'Please allow location permission to get weather for your current location, or search for a city.';
    }
    if (error?.toLowerCase().includes('rate limit')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    return error || 'Something went wrong while fetching weather data.';
  };

  return (
    <div className="rounded-3xl glass-strong p-6 shadow-2xl mb-8 animate-fade-in border-l-4 border-l-red-400/50">
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 p-3 rounded-xl glass-subtle">
          {getErrorIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            {getErrorTitle()}
          </h3>
          <p className="text-white/60 text-sm mb-5 leading-relaxed">
            {getErrorDescription()}
          </p>

          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONNECTION STATUS BANNER - Non-blocking status indicator
// ============================================================================
// Shows a subtle banner when connection is restored
// ============================================================================

export function ConnectionRestoredBanner() {
  return (
    <div className="rounded-2xl glass-subtle p-3 mb-6 animate-fade-in border border-green-400/20 bg-green-500/5">
      <div className="flex items-center justify-center gap-2">
        <CheckCircle className="text-green-400" size={16} />
        <p className="text-green-400 text-sm font-medium">
          Connection restored — data refreshed
        </p>
      </div>
    </div>
  );
}