import { cache } from "react";
import type { Locale } from "../../site.config";

/**
 * The locale of the route being rendered, scoped to a single request.
 *
 * Next renders a `not-found` boundary without the segment's params and outside
 * the root layout, and a Client Component inside that boundary fails to render
 * at all — so neither `params` nor `usePathname()` can tell the 404 which
 * language the reader was in. `React.cache` gives a per-request store instead:
 * the locale layout records the locale it matched, and the 404 reads it back.
 *
 * `cache()` is request-scoped in the React Server Components runtime, so
 * concurrent requests never observe each other's value.
 *
 * `null` means no supported locale was matched — an unsupported prefix such as
 * `/fr`, where the reader's language is genuinely unknown.
 */
const store = cache((): { locale: Locale | null } => ({ locale: null }));

export function setRequestLocale(locale: Locale): void {
  store().locale = locale;
}

export function getRequestLocale(): Locale | null {
  return store().locale;
}
