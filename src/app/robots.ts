import type { MetadataRoute } from "next";

import { isSiteNoindex, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (isSiteNoindex()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: siteUrl,
    };
  }

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
