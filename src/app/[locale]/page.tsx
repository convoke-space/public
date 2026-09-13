import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "../../../site.config";
import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { languageTargets, sharedPage } from "@/lib/alternates";
import { getPosts, getProjects, splitEvents } from "@/lib/content";
import { formatEventWhen } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { localePath } from "@/lib/site";

type Params = { locale: string };

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata({
    locale,
    path: "/",
    alternates: sharedPage("/"),
    includeXDefault: true,
  });
}

export default async function HomePage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const posts = getPosts(locale).slice(0, 5);
  const projects = getProjects(locale).slice(0, 4);
  const { upcoming } = splitEvents(locale);
  const nextGathering = upcoming[0];

  return (
    <PageShell
      locale={locale}
      languageTargets={languageTargets(sharedPage("/"))}
      activePath="/"
    >
      <JsonLd data={websiteJsonLd(locale)} />

      <Container width="page">
        <section className="pt-14 pb-4 sm:pt-20">
          <h1 className="max-w-[20ch] font-serif text-[2.1rem] leading-[1.12] sm:text-[3rem]">
            {dict.tagline}
          </h1>
          <p className="mt-6 max-w-[54ch] text-[1.05rem] text-muted">
            {dict.home.lede}
          </p>
        </section>

        {nextGathering ? (
          <section
            aria-labelledby="next-gathering"
            className="mt-10 rounded border border-rule bg-surface p-5 sm:p-6"
          >
            <h2 id="next-gathering" className="eyebrow">
              {dict.home.nextGathering}
            </h2>
            <p className="mt-2 font-serif text-[1.2rem]">
              <Link
                href={localePath(locale, `/gatherings/${nextGathering.slug}`)}
                className="link-underline"
              >
                {nextGathering.frontmatter.title}
              </Link>
            </p>
            <p className="mt-1.5 text-[0.9rem] text-muted">
              {formatEventWhen(
                nextGathering.frontmatter.date,
                nextGathering.frontmatter.end,
                locale,
              )}{" "}
              · {nextGathering.frontmatter.location}
            </p>
          </section>
        ) : null}

        {posts.length > 0 ? (
          <Section
            id="writing"
            title={dict.nav.writing}
            href={localePath(locale, "/writing")}
            linkLabel={dict.home.allWriting}
          >
            <EntryList
              locale={locale}
              emptyMessage={dict.writing.empty}
              items={posts.map((post) => ({
                href: localePath(locale, `/writing/${post.slug}`),
                title: post.frontmatter.title,
                description: post.frontmatter.description,
                date: post.frontmatter.date,
              }))}
            />
          </Section>
        ) : null}

        {projects.length > 0 ? (
          <Section
            id="projects"
            title={dict.nav.projects}
            href={localePath(locale, "/projects")}
            linkLabel={dict.home.allProjects}
          >
            <EntryList
              locale={locale}
              emptyMessage={dict.projects.empty}
              items={projects.map((project) => ({
                href: localePath(locale, `/projects/${project.slug}`),
                title: project.frontmatter.title,
                description: project.frontmatter.description,
                date: project.frontmatter.date,
                badge: dict.projects.statusLabel[project.frontmatter.status],
              }))}
            />
          </Section>
        ) : null}
      </Container>
    </PageShell>
  );
}

function Section({
  id,
  title,
  href,
  linkLabel,
  children,
}: {
  id: string;
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-16 sm:mt-20">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 id={id} className="eyebrow">
          {title}
        </h2>
        <Link href={href} className="link-underline text-[0.82rem] text-muted">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}
