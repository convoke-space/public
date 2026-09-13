import { siteConfig } from "../../site.config";

/**
 * Resolve the origin the current deployment is actually served from.
 *
 * Order of precedence:
 *  1. NEXT_PUBLIC_SITE_URL  — explicit override (local dev, self-hosting)
 *  2. VERCEL_ENV=production — always the canonical origin
 *  3. VERCEL_URL            — preview deployments
 *  4. canonical origin      — safe default
 *
 * Canonical URLs, sitemap, robots and feed all derive from this, so previews
 * never advertise themselves as the canonical site.
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    const vercelUrl = process.env.VERCEL_URL?.trim();
    if (vercelUrl) return `https://${stripTrailingSlash(vercelUrl)}`;
  }

  return siteConfig.canonicalOrigin;
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  const origin = getSiteOrigin();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The canonical origin, regardless of where this deployment runs.
 * Used for `rel=canonical` so previews point at production.
 */
export function canonicalUrl(path = "/"): string {
  const origin = siteConfig.canonicalOrigin;
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** True when this build should be indexable by search engines. */
export function isIndexable(): boolean {
  if (process.env.NEXT_PUBLIC_NOINDEX === "true") return false;
  if (!process.env.VERCEL_ENV) return true; // local / self-hosted
  return process.env.VERCEL_ENV === "production";
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export { siteConfig };
