/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during build
    ignoreBuildErrors: true,
  },
  // Use environment variable to determine if we're in Tauri build mode
  ...(process.env.TAURI_BUILD === 'true'
    ? {
        output: 'export', // Static export for Tauri
        distDir: 'out', // Output directory for Tauri
        images: {
          unoptimized: true, // Required for static export
        }
      }
    : {
        // For development with API routes
        images: {
          domains: ['localhost'],
        }
      }
  )
};

module.exports = nextConfig;