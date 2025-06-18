
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.458b60e3986d47f997fcf5d59fac2fe1',
  appName: 'melody-mix-mobile',
  webDir: 'dist',
  server: {
    url: 'https://458b60e3-986d-47f9-97fc-f5d59fac2fe1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Filesystem: {
      iosDatabaseLocation: 'Documents',
      androidDatabaseLocation: 'default'
    },
    MediaControls: {
      playIcon: 'play_arrow',
      pauseIcon: 'pause',
      previousIcon: 'skip_previous',
      nextIcon: 'skip_next'
    }
  }
};

export default config;
