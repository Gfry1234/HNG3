'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Wifi } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isNetworkError = !isOnline || error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch');

  const handleFetchLiveData = () => {
    setIsChecking(true);
    // Full page reload to fetch fresh data from the API
    window.location.reload();
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e27] via-[#1a1f4e] to-[#2d1b69] p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 animate-pulse">
              {isNetworkError ? (
                <Wifi className="text-amber-400" size={40} />
              ) : (
                <AlertCircle className="text-red-400" size={40} />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            {isNetworkError ? 'Connection Issue' : 'Page Could Not Load'}
          </h2>

          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            {isNetworkError
              ? "It looks like you're offline. Please check your internet connection and try again."
              : "The page encountered an error. Let's fetch fresh data."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleFetchLiveData}
              disabled={isChecking}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Loading...' : 'Fetch Live Data'}</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 glass-subtle hover:glass text-white font-medium rounded-xl transition-all duration-300"
            >
              <span>Reload Page</span>
            </button>
          </div>

          {isNetworkError && (
            <p className="text-white/30 text-xs mt-6">
              Once you're back online, click "Fetch Live Data" to refresh.
            </p>
          )}
        </div>
      </body>
    </html>
  );
}