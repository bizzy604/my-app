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
  
  // For Vercel deployments, simply use the default settings
  // This ensures Vercel's optimized build process handles everything correctly
  productionBrowserSourceMaps: false, 
  swcMinify: true, 
  compress: true,
  
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

    // Handle Swagger CSS in production builds
    if (!dev) {
      config.module.rules.push({
        test: /swagger-ui\.css$/,
        use: 'null-loader',
      });
      
      // Handle additional swagger-related resources for production
      config.resolve.alias = {
        ...config.resolve.alias,
        'swagger-ui-react/swagger-ui.css': 'null-loader',
      };
    } else {
      // For development only - use style and css loaders
      config.module.rules.push({
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [
          /node_modules\/swagger-ui-react/,
          /node_modules\/swagger-ui-dist/,
        ],
      });
    }

    // Add a rule for processing Tailwind CSS files with postcss-loader
    config.module.rules.push({
      test: /\.css$/,
      use: ['postcss-loader'],
      exclude: [
        /node_modules\/swagger-ui-react/,
        /node_modules\/swagger-ui-dist/,
      ],
    });

    return config;
  }
}

module.exports = nextConfig
