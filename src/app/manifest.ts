import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "로컬맘 — 우리 동네, 신선한 한 끼",
    short_name: "로컬맘",
    description: "지역 농가와 소비자를 직접 연결하는 신선식품 커머스",
    lang: "ko",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EC",
    theme_color: "#FAF6EC",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
