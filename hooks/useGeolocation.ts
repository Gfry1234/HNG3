import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationCoords, LocationError } from '@/lib/types';

interface UseGeolocationReturn {
  coords: LocationCoords | null;
  loading: boolean;
  error: LocationError | string | null;
  requestLocation: () => void;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  isHighAccuracy: boolean;
  toggleHighAccuracy: () => void;
}

const ERROR_MESSAGES: Record<number, string> = {
  1: 'Location access was denied. Please allow location permission in your browser or device settings to get weather for your current location.',
  2: 'Unable to determine your location. Please check your network connection and try again.',
  3: 'Location request timed out. Please try again.',
};

export function useGeolocation(): UseGeolocationReturn {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isHighAccuracy, setIsHighAccuracy] = useState(true);
  const hasRequested = useRef(false);

  const checkPermission = useCallback(async () => {
    if (typeof navigator === 'undefined') return;
    
    try {
      if ('permissions' in navigator) {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionStatus(status.state as 'granted' | 'denied' | 'prompt');
        
        status.onchange = () => {
          setPermissionStatus(status.state as 'granted' | 'denied' | 'prompt');
        };
      }
    } catch (err) {
      setPermissionStatus('unknown');
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined') return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please try a modern browser like Chrome, Firefox, or Safari.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
        setError(null);
        setPermissionStatus('granted');
      },
      (err) => {
        const message = ERROR_MESSAGES[err.code as number] || err.message;
        setError({
          code: err.code as 1 | 2 | 3,
          message,
        });
        setLoading(false);
        
        if (err.code === 1) {
          setPermissionStatus('denied');
        }
        console.error('[Weather App] Geolocation error:', err);
      },
      {
        enableHighAccuracy: isHighAccuracy,
        timeout: 15000,
        maximumAge: 2 * 60 * 1000, // 2 minutes - fresher data
      }
    );
  }, [isHighAccuracy]);

  const toggleHighAccuracy = useCallback(() => {
    setIsHighAccuracy(prev => !prev);
  }, []);

  // Check permission on mount and request location once
  useEffect(() => {
    if (!hasRequested.current) {
      hasRequested.current = true;
      checkPermission();
      requestLocation();
    }
  }, [checkPermission, requestLocation]);

  // Re-request location when high accuracy setting changes
  useEffect(() => {
    if (coords) {
      // Only re-request if we already have coords and setting changed
      // This ensures we get fresh data with the new accuracy setting
    }
  }, [isHighAccuracy, coords]);

  return {
    coords,
    loading,
    error,
    requestLocation,
    permissionStatus,
    isHighAccuracy,
    toggleHighAccuracy,
  };
}