import { siteConfig } from "../../site.config";

/**
 * Dates are formatted in UTC on purpose: server and client must agree, and a
 * published date is a fact about the archive, not about the reader's timezone.
 */
const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

/** Includes a time only when the source value actually carried one. */
export function formatEventWhen(start: string, end?: string): string {
  const hasTime = !/^\d{4}-\d{2}-\d{2}$/.test(start);
  const format = hasTime ? dateTimeFormatter : dateFormatter;
  if (!end) return format.format(new Date(start));

  const sameDay = start.slice(0, 10) === end.slice(0, 10);
  if (sameDay && hasTime) {
    const endTime = new Intl.DateTimeFormat(siteConfig.locale, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(new Date(end));
    return `${format.format(new Date(start))} – ${endTime}`;
  }
  if (sameDay) return format.format(new Date(start));
  return `${dateFormatter.format(new Date(start))} – ${dateFormatter.format(new Date(end))}`;
}

/** Machine-readable value for <time dateTime>. */
export function isoDateTime(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : new Date(value).toISOString();
}
