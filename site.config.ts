/**
 * Single source of truth for site-wide identity, origin and navigation.
 *
 * The canonical origin lives here and nowhere else. Never hard-code
 * "https://convoke.space" anywhere in the application — import `siteConfig`.
 */

export type NavItem = {
  href: string;
  label: string;
  /** Collection whose emptiness hides this item from primary navigation. */
  requiresContent?: "posts" | "projects" | "events";
};

export const siteConfig = {
  name: "Convoke",
  /** Used in <title> templates and structured data. */
  title: "Convoke",
  tagline: "Thinking, building, and gathering in public.",
  description:
    "Convoke is a personal digital platform: an editorial archive of writing, projects and gatherings, operated as an AI-native software system.",
  /**
   * Canonical production origin. No trailing slash.
   * Preview and local environments override it through NEXT_PUBLIC_SITE_URL
   * (Vercel sets VERCEL_URL for previews; see src/lib/site.ts).
   */
  canonicalOrigin: "https://convoke.space",
  locale: "en",
  /** Feed + sitemap owner. Kept generic until the owner publishes a byline. */
  author: {
    name: "Convoke",
    url: "https://convoke.space/about",
  },
  nav: [
    { href: "/writing", label: "Writing", requiresContent: "posts" },
    { href: "/projects", label: "Projects", requiresContent: "projects" },
    { href: "/gatherings", label: "Gatherings", requiresContent: "events" },
    { href: "/about", label: "About" },
  ] satisfies NavItem[],
} as const;

export type SiteConfig = typeof siteConfig;
