import { getEntry, getProjects } from "@/lib/content";
import { entryCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { siteConfig } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Projects — " + siteConfig.name;

export function generateStaticParams() {
  return getProjects().map((entry) => ({ slug: entry.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("projects", slug);

  return entryCard({
    eyebrow: "Projects",
    title: entry?.frontmatter.title ?? siteConfig.name,
    meta: entry?.frontmatter.date.slice(0, 10),
  });
}
