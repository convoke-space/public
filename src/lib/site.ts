import { siteConfig, type Locale } from "../../site.config";

/**
 * Resolve the origin the current deployment is actually served from.
 *
 * Order of precedence:
 *  1. NEXT_PUBLIC_SITE_URL  — explicit override (local dev, self-hosting)
 *  2. VERCEL_ENV=production — always the canonical origin
 *  3. VERCEL_URL            — preview deployments
 *  4. canonical origin      — safe default
 *
 * Canonical URLs, sitemap, robots and feeds all derive from this, so previews
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

/**
 * Percent-encode each path segment.
 *
 * Slugs may be Hangul (see docs/PUBLISHING.md), and an absolute URL in a
 * sitemap, a feed or a `rel=canonical` must be encoded. `next/link` encodes
 * the same way, so a raw path and an encoded URL always resolve to one route.
 */
export function encodePath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
}

/** Absolute URL on the origin this deployment is actually served from. */
export function absoluteUrl(path = "/"): string {
  return joinOrigin(getSiteOrigin(), path);
}

/**
 * The canonical origin, regardless of where this deployment runs.
 * Used for `rel=canonical` so previews point at production.
 */
export function canonicalUrl(path = "/"): string {
  return joinOrigin(siteConfig.canonicalOrigin, path);
}

/** Locale-prefixed site path: `localePath("ko", "/writing")` → `/ko/writing`. */
export function localePath(locale: Locale, path = "/"): string {
  if (!path || path === "/") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/** True when this build should be indexable by search engines. */
export function isIndexable(): boolean {
  if (process.env.NEXT_PUBLIC_NOINDEX === "true") return false;
  if (!process.env.VERCEL_ENV) return true; // local / self-hosted
  return process.env.VERCEL_ENV === "production";
}

function joinOrigin(origin: string, path: string): string {
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${encodePath(path)}`;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export { siteConfig };
export type { Locale };
