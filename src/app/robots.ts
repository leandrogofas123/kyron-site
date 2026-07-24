import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/kyron/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rotas de API não têm conteúdo indexável.
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
