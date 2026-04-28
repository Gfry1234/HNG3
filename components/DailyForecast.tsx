'use client';

import { ForecastResponse } from '@/lib/types';
import { getWeatherIcon, getDailyForecasts } from '@/lib/weather';
import { useState } from 'react';
import { ChevronDown, Calendar, Droplets, Wind } from 'lucide-react';

// ============================================================================
// DAILY FORECAST - Extended Data Visualization Node
// ============================================================================
// This component visualizes daily forecast data with expandable details:
// 1. Receives forecast data from the store (data flows downstream)
// 2. Aggregates 5-day forecast from 3-hour intervals
// 3. Displays as an accordion-style list
// 4. Expands to show detailed metrics on click
// ============================================================================

interface DailyForecastProps {
  data: ForecastResponse;
  isUpdating?: boolean;
}

export function DailyForecast({ data, isUpdating = false }: DailyForecastProps) {
  const dailyForecasts = getDailyForecasts(data.list, data.city.timezone);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className={`rounded-3xl glass-strong p-6 shadow-2xl gradient-card neon-glow-purple transition-all duration-300 ${isUpdating ? 'opacity-75' : 'opacity-100'}`}>
      {/* Header - Data section label */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl glass-subtle animate-pulse">
          <Calendar className="text-purple-400" size={18} />
        </div>
        <h3 className="text-xl font-bold text-gradient-primary">5-Day Forecast</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
      </div>

      {/* Daily forecast list - Data nodes */}
      <div className="space-y-2">
        {dailyForecasts.map((daily, index) => {
          const icon = getWeatherIcon(daily.weather);
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={daily.date}
              className="animate-slide-in"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`w-full rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01] dataflow-connector ${
                  isExpanded 
                    ? 'glass border-purple-400/30 shadow-lg shadow-purple-500/10 neon-glow-purple' 
                    : 'glass-subtle hover:glass hover:neon-glow-indigo'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Date */}
                    <p className="text-white font-medium w-24 text-left text-gradient-primary">
                      {daily.date}
                    </p>
                    
                    {/* Weather icon */}
                    <p className="text-2xl drop-shadow-lg">{icon}</p>
                    
                    {/* Weather condition */}
                    <p className="text-white/60 text-sm flex-1 text-left hidden sm:block">
                      {daily.weather.main}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Temperature range */}
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {daily.tempMax}°
                      </p>
                      <p className="text-white/50 text-sm">
                        {daily.tempMin}°
                      </p>
                    </div>
                    
                    {/* Expand indicator */}
                    <ChevronDown
                      className={`text-white/50 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-purple-400' : ''
                      }`}
                      size={18}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded details - Detailed data view */}
              {isExpanded && (
                <div className="mt-2 grid grid-cols-2 gap-3 animate-expand-in">
                  <div className="glass-subtle rounded-xl p-3 flex items-center gap-3 hover:neon-glow-blue transition-all duration-300">
                    <Droplets className="text-blue-400" size={16} />
                    <div>
                      <p className="text-white/50 text-xs">Humidity</p>
                      <p className="text-base font-semibold text-white">
                        {daily.humidity}%
                      </p>
                    </div>
                  </div>
                  <div className="glass-subtle rounded-xl p-3 flex items-center gap-3 hover:neon-glow-indigo transition-all duration-300">
                    <Wind className="text-cyan-400" size={16} />
                    <div>
                      <p className="text-white/50 text-xs">Wind Speed</p>
                      <p className="text-base font-semibold text-white">
                        {daily.windSpeed.toFixed(1)} m/s
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}