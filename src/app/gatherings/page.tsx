import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { splitEvents } from "@/lib/content";
import { formatEventWhen } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gatherings",
  description:
    "Small sessions, workshops and conversations hosted under Convoke — past and upcoming.",
  path: "/gatherings",
});

export default function GatheringsIndexPage() {
  const { upcoming, past } = splitEvents();

  return (
    <Container width="page">
      <PageHeader
        eyebrow="Gatherings"
        title="Gatherings"
        lede="Small, deliberately sized sessions. Registration, when it is open, is handled off-site — no attendee data is kept here."
      />

      <div className="pb-16">
        <section aria-labelledby="upcoming" className="mb-14">
          <h2 id="upcoming" className="eyebrow mb-5">
            Upcoming
          </h2>
          <EntryList
            items={upcoming.map((event) => ({
              href: `/gatherings/${event.slug}`,
              title: event.frontmatter.title,
              description: event.frontmatter.description,
              date: event.frontmatter.date,
              badge: event.frontmatter.format,
              meta: `${formatEventWhen(event.frontmatter.date, event.frontmatter.end)} · ${event.frontmatter.location}`,
            }))}
            emptyMessage="Nothing scheduled at the moment. New gatherings are announced here first."
          />
        </section>

        {past.length > 0 ? (
          <section aria-labelledby="past">
            <h2 id="past" className="eyebrow mb-5">
              Past
            </h2>
            <EntryList
              items={past.map((event) => ({
                href: `/gatherings/${event.slug}`,
                title: event.frontmatter.title,
                description: event.frontmatter.description,
                date: event.frontmatter.date,
                badge: event.frontmatter.format,
                meta: event.frontmatter.location,
              }))}
            />
          </section>
        ) : null}
      </div>
    </Container>
  );
}
