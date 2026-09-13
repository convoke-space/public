import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../../site.config";
import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { languageTargets, sharedPage } from "@/lib/alternates";
import { splitEvents } from "@/lib/content";
import { formatEventWhen } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { localePath } from "@/lib/site";

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
    path: "/gatherings",
    title: dict.gatherings.title,
    description: dict.gatherings.description,
    alternates: sharedPage("/gatherings"),
  });
}

export default async function GatheringsIndexPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { upcoming, past } = splitEvents(locale);

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(sharedPage("/gatherings"))}
      activePath="/gatherings"
    >
      <Container width="page">
        <PageHeader title={dict.gatherings.title} lede={dict.gatherings.lede} />

        <div className="pb-16">
          <section aria-labelledby="upcoming" className="mb-14">
            <h2 id="upcoming" className="eyebrow mb-5">
              {dict.gatherings.upcoming}
            </h2>
            <EntryList
              locale={locale}
              emptyMessage={dict.gatherings.empty}
              items={upcoming.map((event) => ({
                href: localePath(locale, `/gatherings/${event.slug}`),
                title: event.frontmatter.title,
                description: event.frontmatter.description,
                date: event.frontmatter.date,
                badge: dict.gatherings.formatLabel[event.frontmatter.format],
                meta: `${formatEventWhen(event.frontmatter.date, event.frontmatter.end, locale)} · ${event.frontmatter.location}`,
              }))}
            />
          </section>

          {past.length > 0 ? (
            <section aria-labelledby="past">
              <h2 id="past" className="eyebrow mb-5">
                {dict.gatherings.past}
              </h2>
              <EntryList
                locale={locale}
                emptyMessage={dict.gatherings.empty}
                items={past.map((event) => ({
                  href: localePath(locale, `/gatherings/${event.slug}`),
                  title: event.frontmatter.title,
                  description: event.frontmatter.description,
                  date: event.frontmatter.date,
                  badge: dict.gatherings.formatLabel[event.frontmatter.format],
                  meta: event.frontmatter.location,
                }))}
              />
            </section>
          ) : null}
        </div>
      </Container>
    </PageShell>
  );
}
