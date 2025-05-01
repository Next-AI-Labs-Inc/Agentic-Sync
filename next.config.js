/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Determine if this is a production build or development
    const isDev = process.env.NODE_ENV !== 'production';
    const serverPort = isDev ? 3045 : 3046;
    
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3030/api/:path*' // Proxy to backend
      }
    ];
  }
};

module.exports = nextConfig;