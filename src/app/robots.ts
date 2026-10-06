import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // 장바구니·주문·마이페이지는 사람마다 다른 화면이라 색인하지 않습니다.
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/orders", "/order-complete/", "/mypage"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
