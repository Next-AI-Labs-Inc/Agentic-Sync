/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3030/api/:path*' // Proxy to backend
      }
    ];
  }
};

module.exports = nextConfig;