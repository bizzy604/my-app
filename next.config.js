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
}

module.exports = nextConfig
