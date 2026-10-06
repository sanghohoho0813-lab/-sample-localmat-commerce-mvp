import type { NextConfig } from "next";

/** 기본 보안 헤더 — 외부 사이트가 이 화면을 iframe으로 감싸지 못하게 하고(스마트폰 미리보기는 같은 출처라 허용), 불필요한 브라우저 권한을 끕니다. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
