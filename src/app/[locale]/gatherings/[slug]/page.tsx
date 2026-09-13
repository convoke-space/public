import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../../../site.config";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { PageShell } from "@/components/page-shell";
import { entryAlternates, languageTargets } from "@/lib/alternates";
import { getEntry, getEvents, isUpcoming } from "@/lib/content";
import { formatEventWhen, isoDateTime } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";
import type { EventFrontmatter } from "@/lib/schema";
import { breadcrumbJsonLd, eventJsonLd, pageMetadata } from "@/lib/seo";
import { localePath } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): { locale: Locale; slug: string }[] {
  return LOCALES.flatMap((locale) =>
    getEvents(locale).map((event) => ({ locale, slug: event.slug })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const event = getEntry("events", locale, slug);
  if (!event) return pageMetadata({ locale, path: `/gatherings/${slug}` });

  const fm = event.frontmatter as EventFrontmatter;
  return pageMetadata({
    locale,
    path: `/gatherings/${event.slug}`,
    title: fm.title,
    description: fm.description,
    type: "article",
    publishedTime: fm.date,
    modifiedTime: fm.updated,
    tags: fm.tags,
    alternates: entryAlternates(event),
  });
}

export default async function GatheringPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const event = getEntry("events", locale, slug);
  if (!event) notFound();

  const dict = getDictionary(locale);
  const fm = event.frontmatter as EventFrontmatter;
  const path = `/gatherings/${event.slug}`;
  const upcoming = isUpcoming(event);

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(entryAlternates(event))}
      activePath="/gatherings"
    >
      <JsonLd
        data={eventJsonLd({
          locale,
          title: fm.title,
          description: fm.description,
          path,
          startDate: fm.date,
          endDate: fm.end,
          location: fm.location,
          format: fm.format,
          registrationUrl: fm.registrationUrl,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: dict.gatherings.title, path: "/gatherings" },
          { name: fm.title, path },
        ])}
      />

      <Container width="prose" as="article">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">
            <Link
              href={localePath(locale, "/gatherings")}
              className="link-underline"
            >
              {dict.gatherings.title}
            </Link>
            {!upcoming ? ` · ${dict.gatherings.pastBadge}` : null}
          </p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {fm.title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[1.05rem] text-muted">
            {fm.description}
          </p>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.85rem]">
            <dt className="eyebrow self-center">{dict.gatherings.when}</dt>
            <dd className="text-muted">
              <time dateTime={isoDateTime(fm.date)}>
                {formatEventWhen(fm.date, fm.end, locale)}
              </time>
            </dd>

            <dt className="eyebrow self-center">{dict.gatherings.where}</dt>
            <dd className="text-muted">{fm.location}</dd>

            <dt className="eyebrow self-center">{dict.gatherings.format}</dt>
            <dd className="text-muted">
              {dict.gatherings.formatLabel[fm.format]}
            </dd>
          </dl>

          {upcoming && fm.registrationUrl ? (
            <p className="mt-7">
              <a
                href={fm.registrationUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-block rounded border border-accent px-4 py-2 text-[0.9rem] text-accent transition-colors hover:bg-accent-soft"
              >
                {dict.gatherings.register}
              </a>
            </p>
          ) : null}
        </header>

        <Mdx source={event.body} />

        <footer className="mt-14 border-t border-rule pt-6 pb-16 text-[0.85rem] text-muted">
          <Link
            href={localePath(locale, "/gatherings")}
            className="link-underline"
          >
            {dict.gatherings.allGatherings}
          </Link>
        </footer>
      </Container>
    </PageShell>
  );
}
