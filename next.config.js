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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      // Add domains where your images are hosted
      'localhost',
      'innobid-ew09bg30a-kevinyamatta50-gmailcoms-projects.vercel.app',
      'vercel.app'
    ],
    path: '/_next/image',
    loader: 'default'
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false, // Changed to catch potential type issues
  },
  experimental: {
    typedRoutes: false
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
