import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/personal/",
        "/account/",
        "/login/",
        "/register/",
        "/password/",
        "/verify/",
        "/basket/",
        "/search/",
        "/_styleguide/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
