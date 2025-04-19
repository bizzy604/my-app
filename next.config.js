/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
    serverActions: {
      bodySizeLimit: '5mb',
    }
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
