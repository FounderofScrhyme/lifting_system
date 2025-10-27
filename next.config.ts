import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境用の設定
  output: "standalone",
  experimental: {
    // 本番環境でのパフォーマンス最適化
    optimizeCss: true,
  },
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
