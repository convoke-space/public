import { notFound } from "next/navigation";
import { LOCALES, siteConfig, type Locale } from "../../../../site.config";
import { getPosts } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { canonicalUrl, localePath } from "@/lib/site";

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;
export const dynamic = "force-static";

/**
 * RSS 2.0 for one language's Writing collection.
 *
 * One feed per locale: a reader who subscribes in Korean should not be sent
 * English items. Hand-built rather than pulled from a library — the format is
 * stable and a dependency here would be pure liability. Only descriptions are
 * syndicated; full text stays on the canonical page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
): Promise<Response> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const posts = getPosts(locale);
  // An empty feed carries no lastBuildDate rather than claiming the epoch.
  const newest = posts[0]
    ? new Date(posts[0].frontmatter.updated ?? posts[0].frontmatter.date)
    : undefined;

  const items = posts
    .map((post) => {
      const url = canonicalUrl(localePath(locale, `/writing/${post.slug}`));
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
    <title>${escapeXml(dict.feed.title)}</title>
    <link>${escapeXml(canonicalUrl(localePath(locale, "/writing")))}</link>
    <description>${escapeXml(dict.feed.description)}</description>
    <language>${siteConfig.htmlLang[locale]}</language>
${newest ? `    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>\n` : ""}    <atom:link href="${escapeXml(canonicalUrl(localePath(locale, "/feed.xml")))}" rel="self" type="application/rss+xml" />
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
