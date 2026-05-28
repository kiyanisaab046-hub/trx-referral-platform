import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode and SWC minification for faster builds
  reactStrictMode: true,
  swcMinify: true,
  // Optional: allow remote images (keep default behavior)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/signup',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
