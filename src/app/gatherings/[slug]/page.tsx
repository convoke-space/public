import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { getEntry, getEvents, isUpcoming } from "@/lib/content";
import { formatEventWhen, isoDateTime } from "@/lib/format";
import { breadcrumbJsonLd, eventJsonLd, pageMetadata } from "@/lib/seo";
import type { EventFrontmatter } from "@/lib/schema";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getEvents().map((event) => ({ slug: event.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const event = getEntry("events", slug);
  if (!event) {
    return pageMetadata({ title: "Not found", path: `/gatherings/${slug}` });
  }

  const fm = event.frontmatter as EventFrontmatter;
  return pageMetadata({
    title: fm.title,
    description: fm.description,
    path: `/gatherings/${slug}`,
    type: "article",
    publishedTime: fm.date,
    modifiedTime: fm.updated,
    tags: fm.tags,
  });
}

export default async function GatheringPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const event = getEntry("events", slug);
  if (!event) notFound();

  const fm = event.frontmatter as EventFrontmatter;
  const path = `/gatherings/${slug}`;
  const upcoming = isUpcoming(event);

  return (
    <>
      <JsonLd
        data={eventJsonLd({
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
        data={breadcrumbJsonLd([
          { name: "Gatherings", path: "/gatherings" },
          { name: fm.title, path },
        ])}
      />

      <Container width="prose" as="article">
        <header className="pt-12 pb-8 sm:pt-16">
          <p className="eyebrow mb-3">
            <Link href="/gatherings" className="link-underline">
              Gatherings
            </Link>
            {!upcoming ? " · past" : null}
          </p>
          <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
            {fm.title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[1.05rem] text-muted">
            {fm.description}
          </p>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.85rem]">
            <dt className="eyebrow self-center">When</dt>
            <dd className="text-muted">
              <time dateTime={isoDateTime(fm.date)}>
                {formatEventWhen(fm.date, fm.end)}
              </time>
            </dd>

            <dt className="eyebrow self-center">Where</dt>
            <dd className="text-muted">{fm.location}</dd>

            <dt className="eyebrow self-center">Format</dt>
            <dd className="text-muted">{fm.format}</dd>
          </dl>

          {upcoming && fm.registrationUrl ? (
            <p className="mt-7">
              <a
                href={fm.registrationUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-block rounded border border-accent px-4 py-2 text-[0.9rem] text-accent transition-colors hover:bg-accent-soft"
              >
                Register →
              </a>
            </p>
          ) : null}
        </header>

        <Mdx source={event.body} />

        <footer className="mt-14 border-t border-rule pt-6 pb-16 text-[0.85rem] text-muted">
          <Link href="/gatherings" className="link-underline">
            ← All gatherings
          </Link>
        </footer>
      </Container>
    </>
  );
}
