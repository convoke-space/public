import Link from "next/link";
import { siteConfig, type Locale } from "../../site.config";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/site";
import { Container } from "./container";

export function SiteFooter({
  locale,
  sections,
}: {
  locale: Locale;
  /** Locale-relative paths with labels; empty sections are already filtered. */
  sections: { path: string; label: string }[];
}) {
  const dict = getDictionary(locale);
  const year = new Date().getUTCFullYear();

  return (
    <footer className="mt-24 border-t border-rule py-10">
      <Container
        width="wide"
        className="flex flex-col gap-6 text-[0.85rem] text-muted sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="max-w-sm">
          <p className="font-serif text-base text-ink">{siteConfig.name}</p>
          <p className="mt-1.5">{dict.tagline}</p>
        </div>

        <nav aria-label={dict.footer.nav}>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1.5 sm:grid-cols-1 sm:text-right">
            {sections.map((section) => (
              <li key={section.path}>
                <Link
                  href={localePath(locale, section.path)}
                  className="link-underline"
                >
                  {section.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={localePath(locale, "/about")} className="link-underline">
                {dict.nav.about}
              </Link>
            </li>
            <li>
              <a href={localePath(locale, "/feed.xml")} className="link-underline">
                {dict.footer.rss}
              </a>
            </li>
          </ul>
        </nav>
      </Container>

      <Container width="wide" className="mt-8 text-[0.78rem] text-faint">
        <p>
          © {year} {siteConfig.name}. {dict.footer.builtInTheOpen}{" "}
          <a
            href={siteConfig.repositoryUrl}
            className="link-underline"
            rel="noreferrer"
          >
            {dict.footer.sourceOnGitHub}
          </a>
          .
        </p>
      </Container>
    </footer>
  );
}
