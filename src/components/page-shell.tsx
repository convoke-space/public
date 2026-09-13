import type { ReactNode } from "react";
import type { Locale } from "../../site.config";
import { footerSections, navItems } from "@/lib/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import type { LanguageTarget } from "./language-switcher";

/**
 * Header + main + footer for every locale page.
 *
 * This lives in the page rather than the layout so that `languageTargets` can
 * be computed per page: a section maps to the same section in the other
 * language, an article maps to its counterpart, and a piece with no counterpart
 * offers no link at all.
 */
export function PageShell({
  locale,
  languageTargets,
  activePath,
  children,
}: {
  locale: Locale;
  languageTargets: LanguageTarget[];
  activePath?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader
        locale={locale}
        nav={navItems(locale)}
        languageTargets={languageTargets}
        activePath={activePath}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} sections={footerSections(locale)} />
    </>
  );
}
