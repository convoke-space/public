import { siteConfig, type Locale } from "../../site.config";

/**
 * Dates are formatted in UTC on purpose: server and client must agree, and a
 * published date is a fact about the archive, not about the reader's timezone.
 */

const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: Locale, options: Intl.DateTimeFormatOptions, key: string) {
  const cacheKey = `${locale}:${key}`;
  const existing = cache.get(cacheKey);
  if (existing) return existing;
  const created = new Intl.DateTimeFormat(siteConfig.intlLocale[locale], {
    timeZone: "UTC",
    ...options,
  });
  cache.set(cacheKey, created);
  return created;
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DATE_OPTIONS,
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

export function formatDate(value: string, locale: Locale): string {
  return formatter(locale, DATE_OPTIONS, "date").format(new Date(value));
}

/** Includes a time only when the source value actually carried one. */
export function formatEventWhen(
  start: string,
  end: string | undefined,
  locale: Locale,
): string {
  const hasTime = !isDateOnly(start);
  const primary = formatter(
    locale,
    hasTime ? DATE_TIME_OPTIONS : DATE_OPTIONS,
    hasTime ? "datetime" : "date",
  );
  if (!end) return primary.format(new Date(start));

  const sameDay = start.slice(0, 10) === end.slice(0, 10);
  if (sameDay && hasTime) {
    const endTime = formatter(locale, TIME_OPTIONS, "time").format(new Date(end));
    return `${primary.format(new Date(start))} – ${endTime}`;
  }
  if (sameDay) return primary.format(new Date(start));

  const dateOnly = formatter(locale, DATE_OPTIONS, "date");
  return `${dateOnly.format(new Date(start))} – ${dateOnly.format(new Date(end))}`;
}

/** Machine-readable value for <time dateTime>. */
export function isoDateTime(value: string): string {
  return isDateOnly(value) ? value : new Date(value).toISOString();
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
