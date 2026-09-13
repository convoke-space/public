import { notFound } from "next/navigation";
import { LOCALES, siteConfig, type Locale } from "../../../../../site.config";
import { getEntry, published } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { entryCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = siteConfig.name;

export function generateStaticParams(): { locale: Locale; slug: string }[] {
  return LOCALES.flatMap((locale) =>
    published("events", locale).map((entry) => ({ locale, slug: entry.slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const entry = getEntry("events", locale, slug);

  return entryCard({
    eyebrow: dict.gatherings.title,
    title: entry?.frontmatter.title ?? siteConfig.name,
    meta: entry?.frontmatter.date.slice(0, 10),
  });
}
