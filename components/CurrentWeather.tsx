'use client';

import { CurrentWeatherResponse } from '@/lib/types';
import { getWeatherIcon, formatTemperature, formatFullDate } from '@/lib/weather';
import { Heart, RefreshCw, MapPin, Droplets, Wind, Eye, Gauge, Sunrise, Sunset } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CurrentWeatherProps {
  data: CurrentWeatherResponse;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isUpdating?: boolean;
}

// ============================================================================
// CURRENT WEATHER - Primary Data Visualization Node
// ============================================================================
// This component visualizes the current weather data from the store:
// 1. Receives weather data as input (data flows from store)
// 2. Displays temperature, conditions, and metrics
// 3. Provides interactive elements (favorite toggle)
// 4. Shows real-time update countdown
// ============================================================================

export function CurrentWeather({
  data,
  isFavorite,
  onToggleFavorite,
  isUpdating = false,
}: CurrentWeatherProps) {
  const weather = data.weather[0];
  const icon = getWeatherIcon(weather);
  const temp = formatTemperature(data.main.temp);
  const feelsLike = formatTemperature(data.main.feels_like);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [nextUpdate, setNextUpdate] = useState<string>('');

  // Calculate next weather update time (dataflow: time -> countdown)
  useEffect(() => {
    const calculateNextUpdate = () => {
      const now = new Date();
      const currentMinutes = now.getMinutes();
      const nextUpdateMinute = Math.ceil(currentMinutes / 10) * 10;
      const nextUpdate = new Date(now);
      
      if (nextUpdateMinute >= 60) {
        nextUpdate.setHours(now.getHours() + 1);
        nextUpdate.setMinutes(0);
      } else {
        nextUpdate.setMinutes(nextUpdateMinute);
      }
      nextUpdate.setSeconds(0);
      
      const diff = nextUpdate.getTime() - now.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes > 0) {
        setNextUpdate(`${minutes}m ${seconds}s`);
      } else {
        setNextUpdate(`${seconds}s`);
      }
    };

    calculateNextUpdate();
    const interval = setInterval(calculateNextUpdate, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFavoriteClick = () => {
    setIsHeartAnimating(true);
    onToggleFavorite();
    setTimeout(() => setIsHeartAnimating(false), 600);
  };

  // Dynamic glow color based on weather condition
  const getWeatherGlow = () => {
    const condition = weather.main.toLowerCase();
    if (condition.includes('clear') || condition.includes('sunny')) {
      return 'neon-glow-blue from-amber-500/15 via-orange-500/10 to-yellow-500/15';
    } else if (condition.includes('cloud')) {
      return 'neon-glow-indigo from-gray-500/15 via-blue-500/10 to-purple-500/15';
    } else if (condition.includes('rain')) {
      return 'neon-glow-blue from-blue-500/20 via-cyan-500/10 to-blue-600/15';
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      return 'neon-glow-purple from-purple-500/20 via-indigo-500/10 to-purple-600/15';
    }
    return 'neon-glow-blue';
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl glass-strong p-8 mb-8 shadow-2xl animate-fade-in gradient-card transition-all duration-300 ${getWeatherGlow()} ${isUpdating ? 'opacity-90' : 'opacity-100'}`}>
      {/* Loading indicator - Non-blocking update indicator */}
      {isUpdating && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-blue-400/30 neon-glow-blue">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-xs text-blue-300 font-medium">Updating...</span>
        </div>
      )}
      
      {/* Animated background gradient - Dataflow visualization */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-purple-500/15 opacity-100 animate-gradient-shift" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-glow-breathe" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-glow-breathe" style={{ animationDelay: '1.5s' }} />
      
      {/* Data flow lines decoration */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.3)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </linearGradient>
        </defs>
        <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="url(#flowGradient)" strokeWidth="1" className="animate-pulse" />
        <line x1="5%" y1="80%" x2="95%" y2="80%" stroke="url(#flowGradient)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      </svg>

      <div className="relative z-10">
        {/* Header with location and favorite - Data node header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-blue-400 animate-pulse" size={20} />
              <h2 className="text-4xl font-bold text-gradient-primary">{data.name}</h2>
            </div>
            <p className="text-white/60 text-sm pl-7">
              {formatFullDate(data.dt, data.timezone)}
            </p>
          </div>
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-xl glass-subtle transition-all duration-300 hover:scale-110 hover:neon-glow-blue ${
              isHeartAnimating ? 'scale-125' : ''
            }`}
          >
            <Heart
              className={`transition-all duration-300 ${
                isFavorite 
                  ? 'fill-rose-400 text-rose-400 animate-glow-breathe' 
                  : 'text-white/60 hover:text-white'
              }`}
              size={24}
            />
          </button>
        </div>

        {/* Main weather display - Primary data visualization */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Temperature Section - Main metric */}
          <div className="flex items-center gap-5">
            <div className="text-7xl transition-transform duration-500 hover:scale-110 animate-float drop-shadow-2xl">
              {icon}
            </div>
            <div>
              <div className="text-6xl font-bold text-white tracking-tight drop-shadow-lg">{temp}°</div>
              <p className="text-xl text-white/80 font-medium mt-1 text-gradient-primary">{weather.main}</p>
              <p className="text-white/50 text-sm mt-1">
                Feels like <span className="text-white/70">{feelsLike}°</span>
              </p>
            </div>
          </div>

          {/* Details Grid - Secondary metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-subtle rounded-2xl p-4 flex flex-col items-center justify-center hover:neon-glow-blue transition-all duration-300 dataflow-node">
              <Droplets className="text-blue-400 mb-1" size={18} />
              <p className="text-white/50 text-xs mb-1">Humidity</p>
              <p className="text-xl font-semibold text-white">{data.main.humidity}%</p>
            </div>
            <div className="glass-subtle rounded-2xl p-4 flex flex-col items-center justify-center hover:neon-glow-indigo transition-all duration-300 dataflow-node">
              <Wind className="text-cyan-400 mb-1" size={18} />
              <p className="text-white/50 text-xs mb-1">Wind</p>
              <p className="text-xl font-semibold text-white">{data.wind.speed.toFixed(1)} m/s</p>
            </div>
            <div className="glass-subtle rounded-2xl p-4 flex flex-col items-center justify-center hover:neon-glow-purple transition-all duration-300 dataflow-node">
              <Eye className="text-purple-400 mb-1" size={18} />
              <p className="text-white/50 text-xs mb-1">Visibility</p>
              <p className="text-xl font-semibold text-white">{(data.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div className="glass-subtle rounded-2xl p-4 flex flex-col items-center justify-center hover:neon-glow-blue transition-all duration-300 dataflow-node">
              <Gauge className="text-indigo-400 mb-1" size={18} />
              <p className="text-white/50 text-xs mb-1">Pressure</p>
              <p className="text-xl font-semibold text-white">{data.main.pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* Sun times and next update - Tertiary data */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-subtle rounded-2xl p-4 hover:neon-glow-blue transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Sunrise className="text-amber-400 animate-pulse" size={16} />
              <p className="text-white/50 text-xs">Sunrise</p>
            </div>
            <p className="text-lg font-semibold text-white">
              {new Date((data.sys.sunrise + data.timezone) * 1000)
                .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="glass-subtle rounded-2xl p-4 hover:neon-glow-purple transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Sunset className="text-orange-400 animate-pulse" size={16} />
              <p className="text-white/50 text-xs">Sunset</p>
            </div>
            <p className="text-lg font-semibold text-white">
              {new Date((data.sys.sunset + data.timezone) * 1000)
                .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="glass-subtle rounded-2xl p-4 relative overflow-hidden hover:neon-glow-blue transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="text-green-400 animate-spin" style={{ animationDuration: '3s' }} size={16} />
              <p className="text-white/50 text-xs">Next Update</p>
            </div>
            <p className="text-lg font-semibold text-green-400">
              in {nextUpdate}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500/50 via-green-400/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}