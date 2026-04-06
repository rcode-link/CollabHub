import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.collabhub.app',
  appName: 'CollabHub',
  webDir: 'dist',
  server: {
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      launchFadeOutDuration: 300,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#FFA500',
      splashImmersive: false,
      splashFullScreen: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#FFA500',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e',
      overlaysWebView: false,
    },
    SystemBars: {
      insetsHandling: 'disable',
      style: 'DARK',
    },
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
  },
};

export default config;
