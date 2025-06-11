import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  experimental: {
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    webpackBuildWorker: true,
  },
  images: {
    remotePatterns: [
      // Images from google account profile
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
