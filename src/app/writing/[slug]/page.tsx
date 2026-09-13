import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { TagList } from "@/components/tag-list";
import { getEntry, getPosts, readingTimeMinutes } from "@/lib/content";
import { formatDate, isoDateTime } from "@/lib/format";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import type { PostFrontmatter } from "@/lib/schema";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getEntry("posts", slug);
  if (!post) return pageMetadata({ title: "Not found", path: `/writing/${slug}` });

  const fm = post.frontmatter as PostFrontmatter;
  return pageMetadata({
    title: fm.title,
    description: fm.description,
    path: `/writing/${slug}`,
    type: "article",
    publishedTime: fm.date,
    modifiedTime: fm.updated,
    tags: fm.tags,
    canonicalOverride: fm.canonical,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getEntry("posts", slug);
  if (!post) notFound();

  const fm = post.frontmatter as PostFrontmatter;
  const path = `/writing/${slug}`;

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: fm.title,
          description: fm.description,
          path,
          datePublished: fm.date,
          dateModified: fm.updated,
          tags: fm.tags,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Writing", path: "/writing" },
          { name: fm.title, path },
        ])}
      />

      <Container width="prose" as="article">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">
            <Link href="/writing" className="link-underline">
              Writing
            </Link>
          </p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {fm.title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[1.05rem] text-muted">
            {fm.description}
          </p>
          <p className="mt-5 text-[0.8rem] text-faint">
            <time dateTime={isoDateTime(fm.date)}>{formatDate(fm.date)}</time>
            {fm.updated ? (
              <>
                {" · updated "}
                <time dateTime={isoDateTime(fm.updated)}>
                  {formatDate(fm.updated)}
                </time>
              </>
            ) : null}
            {" · "}
            {readingTimeMinutes(post.body)} min read
          </p>
          {fm.canonical ? (
            <p className="mt-3 text-[0.8rem] text-faint">
              Originally published at{" "}
              <a href={fm.canonical} className="link-underline" rel="noreferrer">
                its canonical home
              </a>
              .
            </p>
          ) : null}
        </header>

        <Mdx source={post.body} />

        <footer className="mt-14 border-t border-rule pt-6 pb-16">
          <TagList tags={fm.tags} />
          <p className="mt-6 text-[0.85rem] text-muted">
            <Link href="/writing" className="link-underline">
              ← All writing
            </Link>
          </p>
        </footer>
      </Container>
    </>
  );
}
