/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Production optimizations for Hostinger
  output: 'standalone',
  // Turbopack configuration for Next.js 16
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [{ loader: '@svgr/webpack' }],
        as: '*.js',
      },
    },
  },
  // Webpack configuration for fallback
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': process.cwd(),
    };
    
    // Only apply webpack optimizations in development or when explicitly using webpack
    if (dev || process.env.NEXT_WEBPACK_USE_POLLING) {
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        };
      }
    }
    
    return config;
  },
  // Ensure proper asset handling
  generateEtags: false,
  // Handle trailing slashes
  trailingSlash: false,
}

export default nextConfig
