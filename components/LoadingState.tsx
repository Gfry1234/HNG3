'use client';

import { Cloud } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Loading indicator with animated cloud */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse-glow" />
          <Cloud className="text-blue-400 animate-float relative z-10" size={64} />
        </div>
        <p className="text-white/60 mt-6 text-lg font-light">Loading weather data...</p>
      </div>

      {/* Current Weather Skeleton */}
      <div className="rounded-3xl glass-strong p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-3">
            <div className="w-48 h-10 bg-white/10 rounded-lg animate-pulse" />
            <div className="w-32 h-4 bg-white/10 rounded-lg animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/10 rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="w-24 h-14 bg-white/10 rounded-lg mb-2 animate-pulse" />
              <div className="w-28 h-5 bg-white/10 rounded-lg mb-2 animate-pulse" />
              <div className="w-32 h-3 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="glass-subtle rounded-2xl p-4 animate-pulse"
              >
                <div className="w-12 h-2 bg-white/10 rounded mb-2" />
                <div className="w-14 h-6 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-subtle rounded-2xl p-4 animate-pulse"
            >
              <div className="w-10 h-2 bg-white/10 rounded mb-2" />
              <div className="w-16 h-5 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Forecast Skeleton */}
      <div className="rounded-3xl glass-strong p-6 shadow-2xl">
        <div className="w-32 h-6 bg-white/10 rounded-lg mb-6 animate-pulse" />
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 glass-subtle rounded-2xl p-3 animate-pulse"
            >
              <div className="w-12 h-2 bg-white/10 rounded mb-2 mx-auto" />
              <div className="w-8 h-8 bg-white/10 rounded-full mb-2 mx-auto" />
              <div className="w-10 h-4 bg-white/10 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Daily Forecast Skeleton */}
      <div className="rounded-3xl glass-strong p-6 shadow-2xl">
        <div className="w-32 h-6 bg-white/10 rounded-lg mb-6 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-full glass-subtle rounded-2xl p-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-20 h-5 bg-white/10 rounded" />
                  <div className="w-8 h-8 bg-white/10 rounded-full" />
                  <div className="flex-1 w-20 h-3 bg-white/10 rounded" />
                </div>
                <div className="w-16 h-5 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}