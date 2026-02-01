import type { NextConfig } from "next";

// Vercel 배포: VERCEL=1 자동 설정
// GitHub Pages: GITHUB_ACTIONS=true 자동 설정
const isVercel = process.env.VERCEL === "1";
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

let nextConfig: NextConfig = {};

if (isVercel) {
  // Vercel: 서버 기능(API Routes) 사용 가능, 설정 불필요
  nextConfig = {};
} else if (isGitHubPages) {
  // GitHub Pages: 정적 export만 (API 동작 불가)
  // /api/generate는 dynamic이라 빌드에서 제외됨
  nextConfig = {
    output: "export",
    trailingSlash: true,
    basePath,
    assetPrefix: basePath,
    // 동적 API 라우트를 빌드에서 제외
    experimental: {},
  };
} else {
  // 로컬 개발: 기본 설정
  nextConfig = {};
}

export default nextConfig;
