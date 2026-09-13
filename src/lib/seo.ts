import type { Metadata } from "next";
import { LOCALES, siteConfig, type Locale } from "../../site.config";
import { getDictionary } from "./i18n";
import { canonicalUrl, localePath } from "./site";

/**
 * A page's locale alternates: for each locale, the locale-relative path of the
 * edition that actually exists. A locale is simply absent when that edition has
 * not been published — hreflang and the language switcher must never point at a
 * URL that does not exist.
 */
export type LocaleAlternates = Partial<Record<Locale, string>>;

/** Same path in every locale. Correct for sections, indexes and static pages. */
export function sharedAlternates(path: string): LocaleAlternates {
  return Object.fromEntries(LOCALES.map((locale) => [locale, path]));
}

type PageMetaInput = {
  locale: Locale;
  /** Locale-relative path, e.g. "/writing/some-post". */
  path: string;
  title?: string;
  description?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Locale-relative paths of the editions that exist. */
  alternates?: LocaleAlternates;
  /** Set when the piece was first published elsewhere. */
  canonicalOverride?: string;
  /** Whether `/` is the locale-neutral entry point for this page. */
  includeXDefault?: boolean;
};

/**
 * Every page builds its metadata here, so canonical URLs, hreflang, Open Graph
 * and Twitter cards stay consistent. `metadataBase` is set in the root layout.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  alternates,
  canonicalOverride,
  includeXDefault = false,
}: PageMetaInput): Metadata {
  const dict = getDictionary(locale);
  const resolvedDescription = description ?? dict.siteDescription;
  const canonical = canonicalUrl(localePath(locale, path));
  const resolvedTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name;

  const languages: Record<string, string> = {};
  for (const [alternateLocale, alternatePath] of Object.entries(
    alternates ?? {},
  ) as [Locale, string][]) {
    languages[siteConfig.htmlLang[alternateLocale]] = canonicalUrl(
      localePath(alternateLocale, alternatePath),
    );
  }
  if (includeXDefault) languages["x-default"] = canonicalUrl("/");

  const alternateOpenGraphLocales = (Object.keys(alternates ?? {}) as Locale[])
    .filter((l) => l !== locale)
    .map((l) => siteConfig.openGraphLocale[l]);

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical: canonicalOverride ?? canonical,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
      types: {
        "application/rss+xml": [
          {
            url: canonicalUrl(localePath(locale, "/feed.xml")),
            title: dict.feed.title,
          },
        ],
      },
    },
    openGraph: {
      type,
      url: canonical,
      title: resolvedTitle,
      description: resolvedDescription,
      siteName: siteConfig.name,
      locale: siteConfig.openGraphLocale[locale],
      ...(alternateOpenGraphLocales.length > 0
        ? { alternateLocale: alternateOpenGraphLocales }
        : {}),
      // No `authors`: Convoke has no published author identity yet, and one is
      // never invented. See AGENTS.md §5.
      ...(type === "article" ? { publishedTime, modifiedTime, tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
    },
  };
}

type JsonLd = Record<string, unknown>;

/** Convoke is a publication. Until an author identity exists, so is its owner. */
function publisher(): JsonLd {
  return { "@type": siteConfig.publisher.type, name: siteConfig.publisher.name };
}

export function websiteJsonLd(locale: Locale): JsonLd {
  const dict = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: canonicalUrl(localePath(locale, "/")),
    description: dict.siteDescription,
    inLanguage: siteConfig.htmlLang[locale],
    publisher: publisher(),
  };
}

export function articleJsonLd(input: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  tags?: string[];
}): JsonLd {
  const url = canonicalUrl(localePath(input.locale, input.path));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: siteConfig.htmlLang[input.locale],
    publisher: publisher(),
    ...(input.tags?.length ? { keywords: input.tags.join(", ") } : {}),
  };
}

export function eventJsonLd(input: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  startDate: string;
  endDate?: string;
  location: string;
  format: "in-person" | "online" | "hybrid";
  registrationUrl?: string;
}): JsonLd {
  const url = canonicalUrl(localePath(input.locale, input.path));
  const attendanceMode = {
    "in-person": "https://schema.org/OfflineEventAttendanceMode",
    online: "https://schema.org/OnlineEventAttendanceMode",
    hybrid: "https://schema.org/MixedEventAttendanceMode",
  }[input.format];

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.title,
    description: input.description,
    url,
    inLanguage: siteConfig.htmlLang[input.locale],
    startDate: input.startDate,
    ...(input.endDate ? { endDate: input.endDate } : {}),
    eventAttendanceMode: attendanceMode,
    eventStatus: "https://schema.org/EventScheduled",
    location:
      input.format === "online"
        ? { "@type": "VirtualLocation", url: input.registrationUrl ?? url }
        : { "@type": "Place", name: input.location, address: input.location },
    organizer: {
      ...publisher(),
      url: canonicalUrl(localePath(input.locale, "/")),
    },
    ...(input.registrationUrl
      ? {
          offers: {
            "@type": "Offer",
            url: input.registrationUrl,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(
  locale: Locale,
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(localePath(locale, item.path)),
    })),
  };
}
