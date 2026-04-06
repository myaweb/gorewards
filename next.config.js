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
  
  // Redirects for old blog URLs moved to blog subdomain
  async redirects() {
    return [
      // Old blog posts - redirect to new blog subdomain
      {
        source: '/are-canadian-mortgage-rates-finally-on-the-decline',
        destination: 'https://blog.creditrich.net/are-canadian-mortgage-rates-finally-on-the-decline',
        permanent: true,
      },
      {
        source: '/good-credit-score-canada',
        destination: 'https://blog.creditrich.net/good-credit-score-canada',
        permanent: true,
      },
      {
        source: '/no-credit-check-loans-canada',
        destination: 'https://blog.creditrich.net/no-credit-check-loans-canada',
        permanent: true,
      },
      {
        source: '/best-credit-cards-canada',
        destination: 'https://blog.creditrich.net/best-credit-cards-canada',
        permanent: true,
      },
      {
        source: '/no-fee-credit-cards-canada',
        destination: 'https://blog.creditrich.net/no-fee-credit-cards-canada',
        permanent: true,
      },
      {
        source: '/how-net-30-accounts-can-boost-your-canadian-business-cash-flow',
        destination: 'https://blog.creditrich.net/how-net-30-accounts-can-boost-your-canadian-business-cash-flow',
        permanent: true,
      },
      {
        source: '/mortgages',
        destination: 'https://blog.creditrich.net/mortgages',
        permanent: true,
      },
      {
        source: '/improve-credit-score-canada',
        destination: 'https://blog.creditrich.net/improve-credit-score-canada',
        permanent: true,
      },
      {
        source: '/forex-and-business-credit-canada-update',
        destination: 'https://blog.creditrich.net/forex-and-business-credit-canada-update',
        permanent: true,
      },
      {
        source: '/multiple-orders-vendor-business-credit-canada',
        destination: 'https://blog.creditrich.net/multiple-orders-vendor-business-credit-canada',
        permanent: true,
      },
      {
        source: '/personal-loans-canada',
        destination: 'https://blog.creditrich.net/personal-loans-canada',
        permanent: true,
      },
      {
        source: '/5-essential-tips-for-first-time-home-buyers-in-canada',
        destination: 'https://blog.creditrich.net/5-essential-tips-for-first-time-home-buyers-in-canada',
        permanent: true,
      },
      {
        source: '/taxes',
        destination: 'https://blog.creditrich.net/taxes',
        permanent: true,
      },
      {
        source: '/7-tips-for-securing-the-best-personal-loan-in-canada',
        destination: 'https://blog.creditrich.net/7-tips-for-securing-the-best-personal-loan-in-canada',
        permanent: true,
      },
      // Catch-all for any other blog-related paths
      {
        source: '/tag/:slug*',
        destination: 'https://blog.creditrich.net/tag/:slug*',
        permanent: true,
      },
      {
        source: '/category/:slug*',
        destination: 'https://blog.creditrich.net/category/:slug*',
        permanent: true,
      },
      // Redirect /lander to homepage
      {
        source: '/lander',
        destination: '/',
        permanent: true,
      },
      // Redirect /home to root (route group issue)
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
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
