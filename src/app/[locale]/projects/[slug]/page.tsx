import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../../../site.config";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { PageShell } from "@/components/page-shell";
import { TagList } from "@/components/tag-list";
import { entryAlternates, languageTargets } from "@/lib/alternates";
import { getEntry, getProjects } from "@/lib/content";
import { formatDate, isoDateTime } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";
import type { ProjectFrontmatter } from "@/lib/schema";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { localePath } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): { locale: Locale; slug: string }[] {
  return LOCALES.flatMap((locale) =>
    getProjects(locale).map((project) => ({ locale, slug: project.slug })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const project = getEntry("projects", locale, slug);
  if (!project) return pageMetadata({ locale, path: `/projects/${slug}` });

  const fm = project.frontmatter as ProjectFrontmatter;
  return pageMetadata({
    locale,
    path: `/projects/${project.slug}`,
    title: fm.title,
    description: fm.description,
    type: "article",
    publishedTime: fm.date,
    modifiedTime: fm.updated,
    tags: fm.tags,
    alternates: entryAlternates(project),
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const project = getEntry("projects", locale, slug);
  if (!project) notFound();

  const dict = getDictionary(locale);
  const fm = project.frontmatter as ProjectFrontmatter;
  const path = `/projects/${project.slug}`;

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(entryAlternates(project))}
      activePath="/projects"
    >
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: dict.projects.title, path: "/projects" },
          { name: fm.title, path },
        ])}
      />

      <Container width="prose" as="article">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">
            <Link
              href={localePath(locale, "/projects")}
              className="link-underline"
            >
              {dict.projects.title}
            </Link>
          </p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {fm.title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[1.05rem] text-muted">
            {fm.description}
          </p>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.85rem]">
            <dt className="eyebrow self-center">{dict.projects.status}</dt>
            <dd className="text-muted">
              {dict.projects.statusLabel[fm.status]}
            </dd>

            <dt className="eyebrow self-center">{dict.projects.started}</dt>
            <dd className="text-muted">
              <time dateTime={isoDateTime(fm.date)}>
                {formatDate(fm.date, locale)}
              </time>
            </dd>

            {fm.url ? (
              <>
                <dt className="eyebrow self-center">{dict.projects.live}</dt>
                <dd>
                  <a href={fm.url} className="link-underline" rel="noreferrer">
                    {displayHost(fm.url)}
                  </a>
                </dd>
              </>
            ) : null}

            {fm.repo ? (
              <>
                <dt className="eyebrow self-center">{dict.projects.source}</dt>
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
          <TagList tags={fm.tags} label={dict.topics} />
          <p className="mt-6 text-[0.85rem] text-muted">
            <Link
              href={localePath(locale, "/projects")}
              className="link-underline"
            >
              {dict.projects.allProjects}
            </Link>
          </p>
        </footer>
      </Container>
    </PageShell>
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
