/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable modern browsers optimization while maintaining IE11 compatibility
  experimental: {
    typedRoutes: false,
    serverActions: {
      bodySizeLimit: '5mb',
    },
    optimizePackageImports: ['swagger-ui-react']
  },
  
  // Cross-browser polyfills and optimizations
  webpack: (config, { dev, isServer }) => {
    // Add polyfill for older browsers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
  
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    path: '/_next/image',
    loader: 'default',
    unoptimized: true,
  },
  
  reactStrictMode: false,
  
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },
  
  eslint: {
    ignoreDuringBuilds: true
  },
 
  output: 'standalone',
  staticPageGenerationTimeout: 180,
  productionBrowserSourceMaps: false,
  compress: true,
  
  // Transpile swagger-ui-react
  transpilePackages: ['swagger-ui-react', 'swagger-ui-dist'],
  
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Simple optimization config without custom CSS loaders
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };

      config.optimization.splitChunks.maxSize = 244000;
      config.optimization.splitChunks.minSize = 20000;
    }
    return config;
  }
}

module.exports = nextConfig