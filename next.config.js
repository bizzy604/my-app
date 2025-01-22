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
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    typedRoutes: false
  },
  // Vercel-specific optimizations
  output: 'standalone', // Enables Vercel's build optimization
  productionBrowserSourceMaps: false, // Reduces bundle size
  swcMinify: true, // Enables SWC minification
  compress: true, // Enables compression
}

module.exports = nextConfig
