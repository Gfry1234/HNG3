import { CurrentWeatherResponse, ForecastResponse } from './types';

const API_KEY = "254f29497ae960c1e1d54c5c3d3a45b6";
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherResponse> {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  
  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      if (response.status === 401) throw new Error('Invalid API key.');
      throw new Error(`Weather API error: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') throw new Error('Request timed out.');
    throw error;
  }
}

export async function getForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  
  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
    return response.json();
  } catch (error: any) {
    throw error;
  }
}

export async function searchCity(query: string): Promise<Array<{ name: string; lat: number; lon: number; country?: string }>> {
  if (!query.trim()) throw new Error('Please enter a city name');
  const url = `${BASE_URL}/find?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Search API error: ${response.status}`);
  
  const data = await response.json();
  return data.list.slice(0, 5).map((item: any) => ({
    name: item.name,
    lat: item.coord.lat,
    lon: item.coord.lon,
    country: item.sys?.country,
  }));
}