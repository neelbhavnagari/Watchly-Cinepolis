import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["th.bing.com"], // allow Bing-hosted images
    // OR use remotePatterns for more control:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "th.bing.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
  allowedDevOrigins: ['immotile-disintegrable-robbyn.ngrok-free.dev'],
};

export default nextConfig;
