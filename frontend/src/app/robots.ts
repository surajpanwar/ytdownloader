import type { MetadataRoute } from "next";

const APP_URL = "https://grabvideo.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}