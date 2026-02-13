/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Static export for Hostinger compatibility
  output: 'export',
  trailingSlash: true,
  // Disable server-side features for static export
  distDir: 'out',
  // Webpack configuration for static build
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': process.cwd(),
    };
    
    // Optimize chunks for static export
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
    
    return config;
  },
  // Ensure proper asset handling
  generateEtags: false,
}

export default nextConfig
