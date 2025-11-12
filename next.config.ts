import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["shiki", "pg"],

  images: {
    remotePatterns: [
      // Images from google account profile
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },

      // Images from Vercel Blob
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
