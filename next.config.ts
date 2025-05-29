import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only run ESLint during development
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
