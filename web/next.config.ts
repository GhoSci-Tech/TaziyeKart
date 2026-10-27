import type { NextConfig } from 'next';

const apiUrl = (process.env.API_URL ?? 'http://localhost:3002').replace(/\/$/, '');

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
