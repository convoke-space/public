import Link from "next/link";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { DEFAULT_LOCALE } from "../../../site.config";
import { getDictionary } from "@/lib/i18n";
import { footerSections } from "@/lib/navigation";
import { localePath } from "@/lib/site";

/**
 * Localized 404 for addresses under a valid locale prefix.
 *
 * Next renders a `not-found` boundary without the segment's params, so the
 * locale cannot be read here. It falls back to the authoring language and keeps
 * every link inside that locale rather than guessing.
 */
export default function LocaleNotFound() {
  const locale = DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <main id="main" className="flex-1">
      <Container width="page">
        <PageHeader
          eyebrow={dict.notFound.eyebrow}
          title={dict.notFound.title}
          lede={dict.notFound.lede}
        />
        <div className="pb-16 text-[0.95rem] text-muted">
          <p>{dict.notFound.body}</p>
          <ul className="mt-3 space-y-1.5">
            {footerSections(locale).map((section) => (
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
              <Link href={localePath(locale, "/")} className="link-underline">
                {dict.nav.home}
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </main>
  );
}
