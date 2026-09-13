import { Fragment } from "react";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../../site.config";
import { Container } from "@/components/container";
import { PageShell } from "@/components/page-shell";
import { ProseCopy } from "@/components/prose-copy";
import { languageTargets, sharedPage } from "@/lib/alternates";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type Params = { locale: string };

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/about",
    title: dict.about.title,
    description: dict.about.description,
    alternates: sharedPage("/about"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { about } = getDictionary(locale);

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(sharedPage("/about"))}
      activePath="/about"
    >
      <Container width="prose">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">{about.title}</p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {about.heading}
          </h1>
        </header>

        <div className="prose">
          {about.lede.map((paragraph, index) => (
            <p key={index}>
              <ProseCopy locale={locale} prose={paragraph} />
            </p>
          ))}

          {/* Fragments, not <section>: `.prose > * + *` sets the vertical
              rhythm between direct children, so the blocks must stay flat. */}
          {about.sections.map((section) => (
            <Fragment key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>
                  <ProseCopy locale={locale} prose={paragraph} />
                </p>
              ))}
              {section.list ? (
                <ul>
                  {section.list.map((item, index) => (
                    <li key={index}>
                      <ProseCopy locale={locale} prose={item} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </Fragment>
          ))}
        </div>

        <div className="pb-16" />
      </Container>
    </PageShell>
  );
}
