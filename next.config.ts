import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev, isServer }) => {
    // Fix for WebSocket connection issues
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }
    return config;
  },
  // Experimental options are not needed for this fix
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds as well
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
