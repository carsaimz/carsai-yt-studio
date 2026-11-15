import type { NextConfig } from "next";

const isMobileExport = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  // 'standalone' powers the Electron shell + web deploys;
  // 'export' produces ./out for Capacitor (Android/iOS) bundles.
  output: isMobileExport ? "export" : "standalone",
  ...(isMobileExport ? { images: { unoptimized: true } } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
