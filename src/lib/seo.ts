import type { Metadata } from "next";
import { absoluteUrl, canonicalUrl, siteConfig } from "./site";

type PageMetaInput = {
  title?: string;
  description?: string;
  /** Site-relative path, e.g. "/writing/some-post". */
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Set when the piece was first published elsewhere. */
  canonicalOverride?: string;
};

/**
 * Every page builds its metadata here so canonical URLs, Open Graph and
 * Twitter cards stay consistent. `metadataBase` is set once in the root layout.
 */
export function pageMetadata({
  title,
  description = siteConfig.description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  canonicalOverride,
}: PageMetaInput): Metadata {
  const url = canonicalUrl(path);
  const resolvedTitle = title ? `${title} — ${siteConfig.name}` : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalOverride ?? url,
      types: {
        "application/rss+xml": [
          { url: absoluteUrl("/feed.xml"), title: `${siteConfig.name} — Writing` },
        ],
      },
    },
    openGraph: {
      type,
      url,
      title: resolvedTitle ?? siteConfig.name,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(type === "article"
        ? { publishedTime, modifiedTime, tags, authors: [siteConfig.author.name] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle ?? siteConfig.name,
      description,
    },
  };
}

type JsonLd = Record<string, unknown>;

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: canonicalUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  tags?: string[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    mainEntityOfPage: canonicalUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: siteConfig.locale,
    author: { "@type": "Person", name: siteConfig.author.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    ...(input.tags?.length ? { keywords: input.tags.join(", ") } : {}),
  };
}

export function eventJsonLd(input: {
  title: string;
  description: string;
  path: string;
  startDate: string;
  endDate?: string;
  location: string;
  format: "in-person" | "online" | "hybrid";
  registrationUrl?: string;
}): JsonLd {
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
    url: canonicalUrl(input.path),
    startDate: input.startDate,
    ...(input.endDate ? { endDate: input.endDate } : {}),
    eventAttendanceMode: attendanceMode,
    eventStatus: "https://schema.org/EventScheduled",
    location:
      input.format === "online"
        ? { "@type": "VirtualLocation", url: input.registrationUrl ?? canonicalUrl(input.path) }
        : { "@type": "Place", name: input.location, address: input.location },
    organizer: { "@type": "Organization", name: siteConfig.name, url: canonicalUrl("/") },
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
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
