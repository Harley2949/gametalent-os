/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gametalent/ui'],

  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@gametalent/db'],
    // 启用优化
    // optimizeCss: true, // 禁用：需要 critters 依赖，开发环境不需要
    optimizePackageImports: ['@gametalent/ui', 'recharts', 'd3'],
  },

  // ========================================
  // 图片优化
  // ========================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天
  },

  // ========================================
  // 代码分割和打包优化
  // ========================================
  webpack: (config, { isServer }) => {
    // 优化打包
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // vendor 代码分割
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // commons 代码分割
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // React 代码分割
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 30,
          },
          // UI 组件分割
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@radix-ui|@gametalent)[\\/]/,
            priority: 25,
          },
          // D3 图表库分割
          charts: {
            name: 'charts',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](d3|recharts|vis-network)[\\/]/,
            priority: 24,
          },
        },
      },
    };

    // 模块解析优化
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // 减少路径解析
        '@': require('path').resolve(__dirname, './src'),
      },
    };

    return config;
  },

  // ========================================
  // 压缩优化
  // ========================================
  compress: true,

  // ========================================
  // 生产优化
  // ========================================
  productionBrowserSourceMaps: false,

  // ========================================
  // 静态资源缓存
  // ========================================
  generateEtags: true,

  // ========================================
  // 输出优化
  // ========================================
  poweredByHeader: false,

  // ========================================
  // 预加载配置
  // ========================================
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // ========================================
  // ESLint 和 TypeScript
  // ========================================
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // ========================================
  // 实验性功能
  // ========================================
  // 启用 App Router 的优化
  modularizeImports: {
    '@gametalent/ui': {
      transform: '@gametalent/ui/dist/{{member}}',
    },
    'd3': {
      transform: 'd3/{{member}}',
    },
  },
};

module.exports = nextConfig;
