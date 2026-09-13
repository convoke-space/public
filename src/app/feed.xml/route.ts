import { getPosts } from "@/lib/content";
import { canonicalUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-static";

/**
 * RSS 2.0 for the Writing collection.
 *
 * Hand-built rather than pulled from a library: the format is stable, the
 * output is ten lines of XML, and a dependency here would be pure liability.
 * Only descriptions are syndicated — full text stays on the canonical page.
 */
export function GET(): Response {
  const posts = getPosts();
  const updated = posts[0]
    ? new Date(posts[0].frontmatter.updated ?? posts[0].frontmatter.date)
    : new Date();

  const items = posts
    .map((post) => {
      const url = canonicalUrl(`/writing/${post.slug}`);
      return [
        "    <item>",
        `      <title>${escapeXml(post.frontmatter.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.frontmatter.description)}</description>`,
        ...(post.frontmatter.tags ?? []).map(
          (tag) => `      <category>${escapeXml(tag)}</category>`,
        ),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} — Writing`)}</title>
    <link>${escapeXml(canonicalUrl("/writing"))}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.locale}</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(canonicalUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
