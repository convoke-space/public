import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { TagList } from "@/components/tag-list";
import { getEntry, getProjects } from "@/lib/content";
import { formatDate, isoDateTime } from "@/lib/format";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import type { ProjectFrontmatter } from "@/lib/schema";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getEntry("projects", slug);
  if (!project) {
    return pageMetadata({ title: "Not found", path: `/projects/${slug}` });
  }

  const fm = project.frontmatter as ProjectFrontmatter;
  return pageMetadata({
    title: fm.title,
    description: fm.description,
    path: `/projects/${slug}`,
    type: "article",
    publishedTime: fm.date,
    modifiedTime: fm.updated,
    tags: fm.tags,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getEntry("projects", slug);
  if (!project) notFound();

  const fm = project.frontmatter as ProjectFrontmatter;
  const path = `/projects/${slug}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Projects", path: "/projects" },
          { name: fm.title, path },
        ])}
      />

      <Container width="prose" as="article">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">
            <Link href="/projects" className="link-underline">
              Projects
            </Link>
          </p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {fm.title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[1.05rem] text-muted">
            {fm.description}
          </p>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.85rem]">
            <dt className="eyebrow self-center">Status</dt>
            <dd className="text-muted">{fm.status}</dd>

            <dt className="eyebrow self-center">Started</dt>
            <dd className="text-muted">
              <time dateTime={isoDateTime(fm.date)}>{formatDate(fm.date)}</time>
            </dd>

            {fm.url ? (
              <>
                <dt className="eyebrow self-center">Live</dt>
                <dd>
                  <a href={fm.url} className="link-underline" rel="noreferrer">
                    {displayHost(fm.url)}
                  </a>
                </dd>
              </>
            ) : null}

            {fm.repo ? (
              <>
                <dt className="eyebrow self-center">Source</dt>
                <dd>
                  <a href={fm.repo} className="link-underline" rel="noreferrer">
                    {displayHost(fm.repo)}
                  </a>
                </dd>
              </>
            ) : null}
          </dl>
        </header>

        <Mdx source={project.body} />

        <footer className="mt-14 border-t border-rule pt-6 pb-16">
          <TagList tags={fm.tags} />
          <p className="mt-6 text-[0.85rem] text-muted">
            <Link href="/projects" className="link-underline">
              ← All projects
            </Link>
          </p>
        </footer>
      </Container>
    </>
  );
}

function displayHost(url: string): string {
  try {
    const { host, pathname } = new URL(url);
    return `${host.replace(/^www\./, "")}${pathname === "/" ? "" : pathname}`;
  } catch {
    return url;
  }
}
