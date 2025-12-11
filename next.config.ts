import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize problematic server-side packages
  serverExternalPackages: [
    "pino",
    "thread-stream",
    "sharp",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "pdf-to-img",
    "fastembed",
    "@anush008/tokenizers",
    "onnxruntime-node",
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
