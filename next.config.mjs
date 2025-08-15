/** @type {import('next').NextConfig} */
const nextConfig = {
  // 實驗性功能優化
  experimental: {
    // optimizeCss: true, // 暫時停用 CSS 優化（需要 critters 依賴）
    optimizePackageImports: ['lucide-react', 'zustand'], // 包導入優化
  },
  
  webpack: (config, { isServer }) => {
    // 解決在 WSL2 中 HMR (Hot Module Replacement) 失效的問題
    if (!isServer) {
      config.watchOptions = {
        poll: 2000, // 增加輪詢間隔以改善性能
        aggregateTimeout: 500, // 增加聚合超時
      };
    }
    return config;
  },
};

export default nextConfig;
