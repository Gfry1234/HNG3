'use client';

import { ForecastResponse } from '@/lib/types';
import { getWeatherIcon, formatTime, formatTemperature } from '@/lib/weather';
import { Clock } from 'lucide-react';

// ============================================================================
// HOURLY FORECAST - Time Series Data Visualization Node
// ============================================================================
// This component visualizes hourly forecast data as a horizontal scroll:
// 1. Receives forecast data from the store (data flows downstream)
// 2. Extracts first 8 hours of forecast data
// 3. Displays as a horizontal scrolling timeline
// 4. Highlights current hour with special styling
// ============================================================================

interface HourlyForecastProps {
  data: ForecastResponse;
  isUpdating?: boolean;
}

export function HourlyForecast({ data, isUpdating = false }: HourlyForecastProps) {
  const hourlyForecasts = data.list.slice(0, 8);

  return (
    <div className={`rounded-3xl glass-strong p-6 mb-8 shadow-2xl overflow-hidden gradient-card neon-glow-indigo transition-all duration-300 ${isUpdating ? 'opacity-75' : 'opacity-100'}`}>
      {/* Header - Data section label */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl glass-subtle animate-pulse">
          <Clock className="text-blue-400" size={18} />
        </div>
        <h3 className="text-xl font-bold text-gradient-primary">Hourly Forecast</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
      </div>

      {/* Horizontal scroll container - Data flow stream */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-2">
          {hourlyForecasts.map((forecast, index) => {
            const icon = getWeatherIcon(forecast.weather[0]);
            const temp = formatTemperature(forecast.main.temp);
            const time = formatTime(forecast.dt, data.city.timezone);
            const isNow = index === 0;

            return (
              <div
                key={forecast.dt}
                className={`flex-shrink-0 w-20 rounded-2xl p-3 text-center transition-all duration-300 hover:scale-105 dataflow-node ${
                  isNow 
                    ? 'bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-blue-400/30 shadow-lg shadow-blue-500/20 neon-glow-blue' 
                    : 'glass-subtle hover:glass hover:neon-glow-indigo'
                }`}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {/* Time label */}
                <p className={`text-xs font-medium mb-2 ${isNow ? 'text-blue-400 animate-pulse' : 'text-white/50'}`}>
                  {isNow ? 'Now' : time}
                </p>
                
                {/* Weather icon */}
                <p className="text-2xl mb-2 drop-shadow-lg">{icon}</p>
                
                {/* Temperature */}
                <p className={`text-base font-semibold ${isNow ? 'text-white' : 'text-white/80'}`}>
                  {temp}°
                </p>
                
                {/* Data flow indicator line */}
                {index < hourlyForecasts.length - 1 && (
                  <div className="absolute top-1/2 -right-2 w-2 h-px bg-gradient-to-r from-blue-500/30 to-purple-500/30 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="flex justify-center mt-4 gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/40" />
      </div>
    </div>
  );
}