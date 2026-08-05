import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.26.12.103", "172.26.132.156", "localhost", "127.0.0.1"],
  output: "standalone",
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
