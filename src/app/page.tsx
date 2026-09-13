import Link from "next/link";
import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { JsonLd } from "@/components/json-ld";
import { getPosts, getProjects, splitEvents } from "@/lib/content";
import { formatEventWhen } from "@/lib/format";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({ path: "/" });

export default function HomePage() {
  const posts = getPosts().slice(0, 5);
  const projects = getProjects().slice(0, 4);
  const { upcoming } = splitEvents();

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      <Container width="page">
        <section className="pt-14 pb-4 sm:pt-20">
          <h1 className="max-w-[20ch] font-serif text-[2.1rem] leading-[1.12] sm:text-[3rem]">
            {siteConfig.tagline}
          </h1>
          <p className="mt-6 max-w-[54ch] text-[1.05rem] text-muted">
            Convoke is a working archive: notes on software architecture and
            AI-native systems, the projects those notes come out of, and the
            occasional gathering. Everything here is written to still be useful
            in a few years.
          </p>
        </section>

        {upcoming.length > 0 ? (
          <section
            aria-labelledby="next-gathering"
            className="mt-10 rounded border border-rule bg-surface p-5 sm:p-6"
          >
            <h2 id="next-gathering" className="eyebrow">
              Next gathering
            </h2>
            <p className="mt-2 font-serif text-[1.2rem]">
              <Link
                href={`/gatherings/${upcoming[0]!.slug}`}
                className="link-underline"
              >
                {upcoming[0]!.frontmatter.title}
              </Link>
            </p>
            <p className="mt-1.5 text-[0.9rem] text-muted">
              {formatEventWhen(
                upcoming[0]!.frontmatter.date,
                upcoming[0]!.frontmatter.end,
              )}{" "}
              · {upcoming[0]!.frontmatter.location}
            </p>
          </section>
        ) : null}

        {posts.length > 0 ? (
          <Section
            title="Writing"
            href="/writing"
            linkLabel="All writing"
            id="writing"
          >
            <EntryList
              items={posts.map((post) => ({
                href: `/writing/${post.slug}`,
                title: post.frontmatter.title,
                description: post.frontmatter.description,
                date: post.frontmatter.date,
              }))}
            />
          </Section>
        ) : null}

        {projects.length > 0 ? (
          <Section
            title="Projects"
            href="/projects"
            linkLabel="All projects"
            id="projects"
          >
            <EntryList
              items={projects.map((project) => ({
                href: `/projects/${project.slug}`,
                title: project.frontmatter.title,
                description: project.frontmatter.description,
                date: project.frontmatter.date,
                badge: project.frontmatter.status,
              }))}
            />
          </Section>
        ) : null}
      </Container>
    </>
  );
}

function Section({
  title,
  href,
  linkLabel,
  id,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-16 sm:mt-20">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 id={id} className="eyebrow">
          {title}
        </h2>
        <Link href={href} className="text-[0.82rem] text-muted link-underline">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}
