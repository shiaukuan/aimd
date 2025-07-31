/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // 解決在 WSL2 中 HMR (Hot Module Replacement) 失效的問題
    if (!isServer) {
      config.watchOptions = {
        poll: 1000, // 每 1000 毫秒 (1 秒) 檢查一次檔案變動
        aggregateTimeout: 300, // 變動後等待 300 毫秒再重新編譯
      };
    }
    return config;
  },
};

export default nextConfig;
