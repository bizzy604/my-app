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
  
  // For Vercel deployments, use the default settings
  // This ensures Vercel's optimized build process handles everything correctly
  productionBrowserSourceMaps: false, 
  swcMinify: true, 
  compress: true,
  
  // Ensure Vercel treats this as a server/standalone build and not a static export
  output: 'standalone',
  
  // Transpile swagger-ui-react
  transpilePackages: ['swagger-ui-react', 'swagger-ui-dist'],
  
  // Enable file tracing for standalone mode
  outputFileTracing: true,
}

module.exports = nextConfig
