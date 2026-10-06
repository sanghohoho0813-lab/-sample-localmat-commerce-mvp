/**
 * 배포 주소 — 공유 미리보기(OG)·사이트맵의 절대 주소에 씁니다.
 * NEXT_PUBLIC_SITE_URL > Vercel 배포 주소 > 로컬 순서로 정합니다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
  "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "로컬맘";
