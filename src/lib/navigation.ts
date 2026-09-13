import { siteConfig, type Locale } from "../../site.config";
import { published } from "./content";
import { getDictionary } from "./i18n";
import type { Collection } from "./schema";

/** Which section renders which collection. */
export const SECTION_PATH: Record<Collection, string> = {
  posts: "/writing",
  projects: "/projects",
  events: "/gatherings",
};

const NAV_LABEL: Record<string, keyof ReturnType<typeof getDictionary>["nav"]> = {
  "/writing": "writing",
  "/projects": "projects",
  "/gatherings": "gatherings",
  "/about": "about",
};

export type NavEntry = { path: string; label: string };

/**
 * Navigation only advertises destinations that hold something *in this locale*.
 * A section with Korean content but no English content is absent from the
 * English navigation rather than leading to an empty page.
 */
export function navItems(locale: Locale): NavEntry[] {
  const dict = getDictionary(locale);
  return siteConfig.nav
    .filter(
      (item) =>
        !item.requiresContent ||
        published(item.requiresContent, locale).length > 0,
    )
    .map((item) => ({
      path: item.path,
      label: dict.nav[NAV_LABEL[item.path] ?? "home"],
    }));
}

/** Section links for the footer: navigation minus About, which it adds itself. */
export function footerSections(locale: Locale): NavEntry[] {
  return navItems(locale).filter((item) => item.path !== "/about");
}
