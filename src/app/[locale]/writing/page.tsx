import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../../site.config";
import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { languageTargets, sharedPage } from "@/lib/alternates";
import { getPosts, readingTimeMinutes } from "@/lib/content";
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
    path: "/writing",
    title: dict.writing.title,
    description: dict.writing.description,
    alternates: sharedPage("/writing"),
  });
}

export default async function WritingIndexPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const posts = getPosts(locale);

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(sharedPage("/writing"))}
      activePath="/writing"
    >
      <Container width="page">
        <PageHeader title={dict.writing.title} lede={dict.writing.lede} />
        <div className="pb-16">
          <EntryList
            locale={locale}
            headingLevel="h2"
            emptyMessage={dict.writing.empty}
            items={posts.map((post) => ({
              href: localePath(locale, `/writing/${post.slug}`),
              title: post.frontmatter.title,
              description: post.frontmatter.description,
              date: post.frontmatter.date,
              meta: dict.writing.readingTime(readingTimeMinutes(post.body)),
            }))}
          />
        </div>
      </Container>
    </PageShell>
  );
}
