import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.26.12.103", "172.26.132.156", "localhost", "127.0.0.1"],
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  typescript: {
    // !! WARNING !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
