/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
    serverActions: {
      bodySizeLimit: '5mb', // Reduced from 10mb
    }
  },
  
  webpack: (config, { isServer, dev }) => {
    // Add memory optimizations for 8GB RAM laptop
    config.optimization.minimize = true;
    
    // Reduce memory usage by turning off source maps in production
    if (!dev) {
      config.devtool = false;
    }

    // Add proper fallbacks for Node.js modules
    config.resolve.fallback = {
      fs: false,
      crypto: false,
      stream: false,
      assert: false,
      net: false,
      tls: false,
      path: false,
      os: false
    };
    
    // Critical fix: prevent AWS SDK packages from being bundled with server code
    if (isServer) {
      // Handle the AWS SDK 'self is not defined' error by excluding these packages from SSR
      const originalExternals = Array.isArray(config.externals) 
        ? config.externals 
        : typeof config.externals === 'function' 
          ? [config.externals] 
          : [];
          
      config.externals = [
        ...originalExternals,
        // Critical: externalize all AWS SDK packages during server build
        // This prevents 'self is not defined' errors
        function(context, request, callback) {
          if (
            request.includes('@aws-sdk/') || 
            request.includes('aws-sdk') ||
            request.includes('styled-jsx') ||
            request.includes('cookie')
          ) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        }
      ];
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
              if (!module.context) return 'vendor';
              
              const packageNameMatch = module.context.match(/[\\/]node_modules[\\/](.+?)(?:[\\/]|$)/);
              if (!packageNameMatch || !packageNameMatch[1]) return 'vendor';
              
              return `npm.${packageNameMatch[1].replace('@', '')}`;
            },
          },
        },
      };
    }
    
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
  
  // Vercel-specific optimizations
  output: 'standalone', 
  productionBrowserSourceMaps: false, 
  swcMinify: true, 
  compress: true,
  
  // Static export configuration
  trailingSlash: true,
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
}

module.exports = nextConfig
