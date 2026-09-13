import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { getPosts, readingTimeMinutes } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Writing",
  description:
    "Essays and notes on software architecture, AI-native systems, and how durable software gets built.",
  path: "/writing",
});

export default function WritingIndexPage() {
  const posts = getPosts();

  return (
    <Container width="page">
      <PageHeader
        title="Writing"
        lede="Longer pieces, worked through rather than posted quickly. Ordered newest first."
      />

      <div className="pb-16">
        <EntryList
          headingLevel="h2"
          items={posts.map((post) => ({
            href: `/writing/${post.slug}`,
            title: post.frontmatter.title,
            description: post.frontmatter.description,
            date: post.frontmatter.date,
            meta: `${readingTimeMinutes(post.body)} min read`,
          }))}
          emptyMessage="No published pieces yet."
        />
      </div>
    </Container>
  );
}
