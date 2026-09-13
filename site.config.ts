/**
 * Single source of truth for site identity, supported locales and navigation.
 *
 * The canonical origin lives here and nowhere else. Never hard-code
 * "https://convoke.space" anywhere in the application — import from
 * `@/lib/site`. Locale-dependent copy lives in `src/lib/i18n.ts`, not here.
 */

/** Supported locales. Korean is the authoring language and comes first. */
export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Used where a single locale must be picked for a locale-neutral surface
 * (the `/` gateway document language). It is NOT a fallback for content:
 * a missing translation is never silently substituted.
 */
export const DEFAULT_LOCALE: Locale = "ko";

/** Sections that exist under every locale. */
export const SECTIONS = ["writing", "projects", "gatherings"] as const;
export type Section = (typeof SECTIONS)[number];

export type NavItem = {
  /** Locale-relative path, e.g. "/writing". */
  path: string;
  /** Collection whose emptiness hides this item from primary navigation. */
  requiresContent?: "posts" | "projects" | "events";
};

export const siteConfig = {
  name: "Convoke",
  /**
   * Canonical production origin. No trailing slash.
   * Preview and local environments override it through NEXT_PUBLIC_SITE_URL
   * (Vercel sets VERCEL_URL for previews; see src/lib/site.ts).
   */
  canonicalOrigin: "https://convoke.space",
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  /**
   * Convoke is a publication, not a person. Until the operator publishes a
   * public author identity, structured data names an Organization and no
   * `author` is asserted. Do not invent one — see AGENTS.md §5.
   */
  publisher: {
    name: "Convoke",
    type: "Organization" as const,
  },
  /** BCP 47 tags and Open Graph locale codes, per supported locale. */
  htmlLang: { ko: "ko", en: "en" } satisfies Record<Locale, string>,
  intlLocale: { ko: "ko-KR", en: "en-US" } satisfies Record<Locale, string>,
  openGraphLocale: { ko: "ko_KR", en: "en_US" } satisfies Record<Locale, string>,
  nav: [
    { path: "/writing", requiresContent: "posts" },
    { path: "/projects", requiresContent: "projects" },
    { path: "/gatherings", requiresContent: "events" },
    { path: "/about" },
  ] satisfies NavItem[],
  repositoryUrl: "https://github.com/convoke-space/public",
} as const;

export type SiteConfig = typeof siteConfig;
