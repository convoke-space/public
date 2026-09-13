import Link from "next/link";
import { LOCALES, siteConfig } from "../../../site.config";
import { getDictionary } from "@/lib/i18n";
import { footerSections } from "@/lib/navigation";
import { getRequestLocale } from "@/lib/request-locale";
import { localePath } from "@/lib/site";

/**
 * The 404 for everything under a locale prefix, and for an unsupported prefix.
 *
 * Two framework constraints shape this file, both verified against Next 16 and
 * both documented in docs/ARCHITECTURE.md:
 *
 *  1. A not-found boundary renders *outside* the root layout, and the layout's
 *     stylesheet is not linked into it. So this page carries its own styles
 *     rather than Tailwind utilities, and its own `lang` — there is no
 *     `<html lang>` to inherit. The token values below are the only duplicates
 *     of src/app/globals.css in the codebase; keep them in step.
 *  2. A Client Component inside the boundary fails to render at all, so the
 *     locale comes from the per-request store the locale layout writes to.
 *
 * A null locale means the prefix was not a supported locale, so the reader's
 * language is genuinely unknown and both are offered — as the gateway does.
 */

const STYLES = `
:root {
  color-scheme: light;
  --nf-bg: #fbfaf7;
  --nf-ink: #1a1917;
  --nf-muted: #5c5952;
  --nf-faint: #767268;
  --nf-rule: #e5e1d8;
  --nf-accent: #96351b;
}
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --nf-bg: #121110;
    --nf-ink: #ecebe6;
    --nf-muted: #a5a199;
    --nf-faint: #87847c;
    --nf-rule: #2b2925;
    --nf-accent: #e79a76;
  }
}
.nf {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  background: var(--nf-bg);
  color: var(--nf-ink);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Apple SD Gothic Neo", "Noto Sans KR",
    "Malgun Gothic", sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  margin: 0;
}
.nf-inner { width: 100%; max-width: 64rem; margin: 0 auto; padding: 5rem 1.25rem; }
@media (min-width: 640px) { .nf-inner { padding-left: 2rem; padding-right: 2rem; } }
.nf-eyebrow {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.11em;
  text-transform: uppercase; color: var(--nf-faint); margin: 0 0 0.75rem;
}
.nf h1, .nf h2 {
  font-family: ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino,
    Charter, Georgia, "Times New Roman", "Apple SD Gothic Neo", "Noto Serif KR",
    "Malgun Gothic", serif;
  font-weight: 600; letter-spacing: -0.012em; line-height: 1.15;
  text-wrap: balance; margin: 0;
}
.nf h1 { font-size: 2rem; }
.nf h2 { font-size: 1.5rem; }
@media (min-width: 640px) { .nf h1 { font-size: 2.6rem; } .nf h2 { font-size: 1.9rem; } }
.nf p { margin: 0; }
.nf .nf-lede { margin-top: 1rem; max-width: 52ch; font-size: 1.05rem; color: var(--nf-muted); }
.nf .nf-body { margin-top: 2rem; font-size: 0.95rem; color: var(--nf-muted); }
.nf ul { list-style: none; margin: 0.75rem 0 0; padding: 0; }
.nf li + li { margin-top: 0.375rem; }
.nf a { color: inherit; text-decoration: underline; text-decoration-color: var(--nf-rule); text-underline-offset: 0.22em; }
.nf a:hover { text-decoration-color: var(--nf-accent); }
.nf a:focus-visible { outline: 2px solid var(--nf-accent); outline-offset: 3px; }
.nf-group { margin: 0; padding: 0; list-style: none; }
.nf-group > li + li { margin-top: 2.5rem; }
.nf :lang(ko) { word-break: keep-all; }
.nf-sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
`;

export default function LocaleNotFound() {
  const locale = getRequestLocale();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {locale ? <Localized locale={locale} /> : <Bilingual />}
    </>
  );
}

function Localized({ locale }: { locale: (typeof LOCALES)[number] }) {
  const dict = getDictionary(locale);

  return (
    <div className="nf" lang={siteConfig.htmlLang[locale]}>
      <main id="main" className="nf-inner">
        <p className="nf-eyebrow">{dict.notFound.eyebrow}</p>
        <h1>{dict.notFound.title}</h1>
        <p className="nf-lede">{dict.notFound.lede}</p>

        <p className="nf-body">{dict.notFound.body}</p>
        <ul>
          <li>
            <Link href={localePath(locale, "/")}>{dict.nav.home}</Link>
          </li>
          {footerSections(locale).map((section) => (
            <li key={section.path}>
              <Link href={localePath(locale, section.path)}>{section.label}</Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function Bilingual() {
  return (
    <div className="nf">
      <main id="main" className="nf-inner">
        <p className="nf-eyebrow" aria-hidden="true">
          404
        </p>
        {/* One h1 per page, in the one string that needs no translation. */}
        <h1 className="nf-sr">404</h1>
        <ul className="nf-group">
          {LOCALES.map((candidate) => {
            const dict = getDictionary(candidate);
            return (
              <li key={candidate} lang={siteConfig.htmlLang[candidate]}>
                <h2>{dict.notFound.title}</h2>
                <p className="nf-lede">{dict.notFound.lede}</p>
                <p className="nf-body">
                  <Link
                    href={localePath(candidate, "/")}
                    hrefLang={siteConfig.htmlLang[candidate]}
                  >
                    {dict.languageSwitch.to[candidate]}
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
