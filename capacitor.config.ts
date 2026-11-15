import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Carsai YT Studio — Capacitor configuration.
 *
 * Two usage modes:
 *  1. Bundled static app (default):
 *     `npm run build:mobile` generates ./out (static export), then
 *     `npx cap sync android` copies it into the native project.
 *  2. Remote shell (recommended for live data):
 *     set CAP_SERVER_URL to your deployed Next.js URL — the native
 *     app loads the live site and keeps native splash/status-bar.
 */
const config: CapacitorConfig = {
  appId: "mz.carsai.ytstudio",
  appName: "Carsai YT Studio",
  webDir: "out",
  server: process.env.CAP_SERVER_URL
    ? { url: process.env.CAP_SERVER_URL, cleartext: false, androidScheme: "https" }
    : undefined,
  android: {
    allowMixedContent: false,
    backgroundColor: "#0b0d12",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0b0d12",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b0d12",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
