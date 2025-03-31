import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
