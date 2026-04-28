import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weatherapp.app',
  appName: 'WeatherApp',
  webDir: 'out',
  server: {
    androidScheme: 'http', // Use http for local internal traffic
    cleartext: true        // This allows the webview to fetch data
  }
};

export default config;