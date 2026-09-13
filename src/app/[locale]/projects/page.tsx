import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../../site.config";
import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { languageTargets, sharedPage } from "@/lib/alternates";
import { getProjects } from "@/lib/content";
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
    path: "/projects",
    title: dict.projects.title,
    description: dict.projects.description,
    alternates: sharedPage("/projects"),
  });
}

export default async function ProjectsIndexPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const projects = getProjects(locale);

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(sharedPage("/projects"))}
      activePath="/projects"
    >
      <Container width="page">
        <PageHeader title={dict.projects.title} lede={dict.projects.lede} />
        <div className="pb-16">
          <EntryList
            locale={locale}
            headingLevel="h2"
            emptyMessage={dict.projects.empty}
            items={projects.map((project) => ({
              href: localePath(locale, `/projects/${project.slug}`),
              title: project.frontmatter.title,
              description: project.frontmatter.description,
              date: project.frontmatter.date,
              badge: dict.projects.statusLabel[project.frontmatter.status],
            }))}
          />
        </div>
      </Container>
    </PageShell>
  );
}
