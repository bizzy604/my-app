/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
    serverActions: {
      bodySizeLimit: '5mb',
    },
    // Add optimized handling of package imports
    optimizePackageImports: ['swagger-ui-react']
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
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV !== 'production',

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
  productionBrowserSourceMaps: false, 
  swcMinify: true, 
  compress: true,
  // Ensure Vercel treats this as a server/standalone build and not a static export
  // This prevents "ENOENT .next/export-detail.json" errors during deployment
  output: 'standalone',
  
  // Transpile swagger-ui-react
  transpilePackages: ['swagger-ui-react', 'swagger-ui-dist'],
  
  // Configure webpack 
  webpack: (config, { isServer, dev }) => {
    // Optimize client-side bundle
    if (!isServer) {
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

      // Limit the number of modules in each chunk
      config.optimization.splitChunks.maxSize = 244000;
      config.optimization.splitChunks.minSize = 20000;
    }

    return config;
  }
}

module.exports = nextConfig
