import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../../../site.config";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { PageShell } from "@/components/page-shell";
import { TagList } from "@/components/tag-list";
import { entryAlternates, languageTargets } from "@/lib/alternates";
import { getEntry, getPosts, readingTimeMinutes } from "@/lib/content";
import { formatDate, isoDateTime } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";
import type { PostFrontmatter } from "@/lib/schema";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { localePath } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): { locale: Locale; slug: string }[] {
  return LOCALES.flatMap((locale) =>
    getPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const post = getEntry("posts", locale, slug);
  if (!post) {
    return pageMetadata({ locale, path: `/writing/${slug}` });
  }

  const fm = post.frontmatter as PostFrontmatter;
  return pageMetadata({
    locale,
    path: `/writing/${post.slug}`,
    title: fm.title,
    description: fm.description,
    type: "article",
    publishedTime: fm.date,
    modifiedTime: fm.updated,
    tags: fm.tags,
    alternates: entryAlternates(post),
    canonicalOverride: fm.canonical,
  });
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const post = getEntry("posts", locale, slug);
  if (!post) notFound();

  const dict = getDictionary(locale);
  const fm = post.frontmatter as PostFrontmatter;
  const path = `/writing/${post.slug}`;

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(entryAlternates(post))}
      activePath="/writing"
    >
      <JsonLd
        data={articleJsonLd({
          locale,
          title: fm.title,
          description: fm.description,
          path,
          datePublished: fm.date,
          dateModified: fm.updated,
          tags: fm.tags,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: dict.writing.title, path: "/writing" },
          { name: fm.title, path },
        ])}
      />

      <Container width="prose" as="article">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">
            <Link href={localePath(locale, "/writing")} className="link-underline">
              {dict.writing.title}
            </Link>
          </p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {fm.title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[1.05rem] text-muted">
            {fm.description}
          </p>
          <p className="mt-5 text-[0.8rem] text-faint">
            <time dateTime={isoDateTime(fm.date)}>
              {formatDate(fm.date, locale)}
            </time>
            {fm.updated ? (
              <>
                {` · ${dict.writing.updatedOn} `}
                <time dateTime={isoDateTime(fm.updated)}>
                  {formatDate(fm.updated, locale)}
                </time>
              </>
            ) : null}
            {" · "}
            {dict.writing.readingTime(readingTimeMinutes(post.body))}
          </p>
          {fm.canonical ? (
            <p className="mt-3 text-[0.8rem] text-faint">
              <a href={fm.canonical} className="link-underline" rel="noreferrer">
                {dict.writing.originallyPublished}
              </a>
            </p>
          ) : null}
        </header>

        <Mdx source={post.body} />

        <footer className="mt-14 border-t border-rule pt-6 pb-16">
          <TagList tags={fm.tags} label={dict.topics} />
          <p className="mt-6 text-[0.85rem] text-muted">
            <Link href={localePath(locale, "/writing")} className="link-underline">
              {dict.writing.allWriting}
            </Link>
          </p>
        </footer>
      </Container>
    </PageShell>
  );
}
