/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Tüm HTTPS domain'lere izin ver
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Local development için
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Static page generation
  output: 'standalone',
  
  // Webpack configuration to handle Node.js built-in modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Node.js built-in modules on client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
        'fs': false,
        'net': false,
        'tls': false,
        'crypto': false,
        'stream': false,
        'util': false,
        'http': false,
        'https': false,
        'zlib': false,
        'path': false,
      }
    }
    
    return config
  },
  
  // Headers for Core Web Vitals
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
