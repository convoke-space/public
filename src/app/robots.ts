import type { MetadataRoute } from "next";
import { canonicalUrl, isIndexable } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never be indexed alongside production.
  if (!isIndexable()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: canonicalUrl("/sitemap.xml"),
    host: canonicalUrl("/").replace(/\/$/, ""),
  };
}
