import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize problematic server-side packages
  serverExternalPackages: [
    "pino",
    "thread-stream",
    "sharp",
    "minio",
    "pdf-to-img",
  ],
  // Configure experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
