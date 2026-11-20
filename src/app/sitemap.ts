import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Empty until NEXT_PUBLIC_SITE_URL is set, because a sitemap needs real absolute addresses.
export default function sitemap(): MetadataRoute.Sitemap {
  return siteUrl ? [{ url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }] : [];
}
