import type { MetadataRoute } from "next";

const SITE_URL = "https://simsimplay.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    "",
    "/psychology",
    "/fortune",
    "/music",
    "/diary",
    "/blog",
    "/privacy",
    "/terms",
    "/contact",
    "/about",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
