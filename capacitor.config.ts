import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.edu.ucc.bienestarica',
  appName: 'Bienestar ICA',
  webDir: 'dist/app/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
