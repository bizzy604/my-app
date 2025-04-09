/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false,
      crypto: false,
      stream: false,
      assert: false 
    }

    return config
  },
  images: {
    // Enable image optimization
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
    loader: 'default'
  },
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    typedRoutes: false,
    serverActions: {
      bodySizeLimit: '5mb', // Reduced from 10mb
    }
  },
  // Vercel-specific optimizations
  output: 'standalone', 
  productionBrowserSourceMaps: false, 
  swcMinify: true, 
  compress: true,
  
  // Static export configuration
  trailingSlash: true,
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',

  // Webpack 5 configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Fix for splitChunks configuration
    if (config.optimization && config.optimization.splitChunks) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Some modules might not have a context or the expected structure
              // So we need to safely handle this case
              if (!module.context) return 'vendor';
              
              const packageNameMatch = module.context.match(/[\\/]node_modules[\\/](.+?)(?:[\\/]|$)/);
              if (!packageNameMatch || !packageNameMatch[1]) return 'vendor';
              
              return `npm.${packageNameMatch[1].replace('@', '')}`;
            },
          },
        },
      };
    }
    
    return config
  }
}

module.exports = nextConfig
