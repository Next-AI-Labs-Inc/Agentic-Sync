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
  // Optimize memory usage for webpack
  webpack: (config, { dev, isServer }) => {
    // Optimize production builds for memory usage
    if (!dev) {
      config.optimization.minimize = true;
      
      // Split chunks for better memory distribution
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the package name
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };
    }
    
    return config;
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