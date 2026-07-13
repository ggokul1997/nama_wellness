import type { NextConfig } from 'next';

// NEXT_PUBLIC_API_BASE_URL = base URL without /api/v1 (e.g. https://api.onrender.com)
// NEXT_PUBLIC_API_URL      = full URL with /api/v1  (e.g. https://api.onrender.com/api/v1)
// The rewrite needs the BASE URL so it can append /api/v1/:path* without doubling the path.
const apiBaseUrl =
  process.env['NEXT_PUBLIC_API_BASE_URL'] ??
  (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Proxy all /api/v1/* requests through Next.js to avoid cross-origin cookie issues.
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${apiBaseUrl}/socket.io/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
