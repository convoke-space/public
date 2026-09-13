import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { LOCALES, type Locale } from "../../site.config";
import {
  COLLECTIONS,
  ContentValidationError,
  parseFrontmatter,
  SLUG_PATTERN,
  type Collection,
  type EventFrontmatter,
  type FrontmatterFor,
  type PostFrontmatter,
  type ProjectFrontmatter,
} from "./schema";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * Content is laid out as `content/<collection>/<locale>/<slug>.mdx`.
 * The directory is the authoritative source of an entry's locale; nothing
 * reads a locale out of frontmatter.
 */
export type Entry<C extends Collection = Collection> = {
  collection: C;
  locale: Locale;
  slug: string;
  /** Locale-independent identity linking the two language editions. */
  translationKey: string;
  /** Repository-relative path, used in error messages. */
  source: string;
  frontmatter: FrontmatterFor<C>;
  /** Raw MDX body, compiled lazily by the renderer. */
  body: string;
};

export type Post = Entry<"posts"> & { frontmatter: PostFrontmatter };
export type Project = Entry<"projects"> & { frontmatter: ProjectFrontmatter };
export type EventEntry = Entry<"events"> & { frontmatter: EventFrontmatter };

const CONTENT_EXTENSIONS = [".mdx", ".md"];

const cache = new Map<string, Entry[]>();

export class UnsupportedLocaleError extends Error {
  constructor(value: string) {
    super(
      `Unsupported locale "${value}". Supported locales: ${LOCALES.join(", ")}.`,
    );
    this.name = "UnsupportedLocaleError";
  }
}

function assertLocale(locale: string): asserts locale is Locale {
  if (!(LOCALES as readonly string[]).includes(locale)) {
    throw new UnsupportedLocaleError(locale);
  }
}

/**
 * Read and validate one collection in one locale.
 *
 * Throws on the first invalid file: content problems must fail the build rather
 * than silently ship a broken page. Results are memoised per process.
 *
 * `root` exists so tests can point at fixtures; production always uses the
 * default.
 */
export function readCollection<C extends Collection>(
  collection: C,
  locale: Locale,
  root: string = CONTENT_ROOT,
): Entry<C>[] {
  assertLocale(locale);

  const cacheKey = `${root}|${collection}|${locale}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as Entry<C>[];

  const dir = path.join(root, collection, locale);
  const entries: Entry<C>[] = [];

  if (fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter(
        (f) => f.isFile() && CONTENT_EXTENSIONS.includes(path.extname(f.name)),
      )
      .map((f) => f.name)
      .sort();

    const seenSlugs = new Set<string>();
    const seenKeys = new Map<string, string>();

    for (const file of files) {
      const slug = path.basename(file, path.extname(file)).normalize("NFC");
      const source = `content/${collection}/${locale}/${file}`;

      if (!SLUG_PATTERN.test(slug)) {
        throw new ContentValidationError(source, [
          `filename must be lowercase kebab-case (ASCII or Hangul, got "${slug}")`,
        ]);
      }
      if (seenSlugs.has(slug)) {
        throw new ContentValidationError(source, [
          `duplicate slug "${slug}" in ${collection}/${locale} — .md and .mdx cannot share a name`,
        ]);
      }
      seenSlugs.add(slug);

      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const frontmatter = parseFrontmatter(
        collection,
        data as Record<string, unknown>,
        source,
      );

      const previous = seenKeys.get(frontmatter.translationKey);
      if (previous) {
        throw new ContentValidationError(source, [
          `duplicate translationKey "${frontmatter.translationKey}" in ${collection}/${locale} — already used by ${previous}`,
        ]);
      }
      seenKeys.set(frontmatter.translationKey, source);

      if (content.trim() === "") {
        throw new ContentValidationError(source, ["body is empty"]);
      }

      entries.push({
        collection,
        locale,
        slug,
        translationKey: frontmatter.translationKey,
        source,
        frontmatter,
        body: content,
      });
    }
  }

  cache.set(cacheKey, entries as Entry[]);
  return entries;
}

/** Published entries only: drafts never reach a listing, route, sitemap or feed. */
export function published<C extends Collection>(
  collection: C,
  locale: Locale,
  root: string = CONTENT_ROOT,
): Entry<C>[] {
  return readCollection(collection, locale, root).filter(
    (e) => !e.frontmatter.draft,
  );
}

export function getEntry<C extends Collection>(
  collection: C,
  locale: Locale,
  slug: string,
  root: string = CONTENT_ROOT,
): Entry<C> | undefined {
  const wanted = slug.normalize("NFC");
  return published(collection, locale, root).find((e) => e.slug === wanted);
}

export function getEntryByTranslationKey<C extends Collection>(
  collection: C,
  locale: Locale,
  translationKey: string,
  root: string = CONTENT_ROOT,
): Entry<C> | undefined {
  return published(collection, locale, root).find(
    (e) => e.translationKey === translationKey,
  );
}

/**
 * The same piece in a given language, or undefined when that edition is not
 * published. Callers must never synthesise a URL from a missing counterpart.
 *
 * The entry's own locale is looked up the same way as any other, so a draft
 * reports no published edition anywhere — including its own language.
 */
export function getCounterpart<C extends Collection>(
  entry: Entry<C>,
  locale: Locale,
  root: string = CONTENT_ROOT,
): Entry<C> | undefined {
  return getEntryByTranslationKey(
    entry.collection,
    locale,
    entry.translationKey,
    root,
  );
}

/** Every locale in which this piece is actually published, including its own. */
export function publishedLocales(
  entry: Entry,
  root: string = CONTENT_ROOT,
): Locale[] {
  return LOCALES.filter((locale) =>
    Boolean(getCounterpart(entry, locale, root)),
  );
}

function byDateDesc(a: Entry, b: Entry): number {
  return (
    new Date(b.frontmatter.date).getTime() -
    new Date(a.frontmatter.date).getTime()
  );
}

export function getPosts(locale: Locale, root: string = CONTENT_ROOT): Post[] {
  return (published("posts", locale, root) as Post[]).slice().sort(byDateDesc);
}

const PROJECT_ORDER = { active: 0, maintained: 1, exploring: 2, archived: 3 };

export function getProjects(
  locale: Locale,
  root: string = CONTENT_ROOT,
): Project[] {
  return (published("projects", locale, root) as Project[])
    .slice()
    .sort((a, b) => {
      const rank =
        PROJECT_ORDER[a.frontmatter.status] - PROJECT_ORDER[b.frontmatter.status];
      return rank !== 0 ? rank : byDateDesc(a, b);
    });
}

export function getEvents(
  locale: Locale,
  root: string = CONTENT_ROOT,
): EventEntry[] {
  return (published("events", locale, root) as EventEntry[])
    .slice()
    .sort(byDateDesc);
}

/** An event is upcoming until its end (or the close of its start day). */
export function isUpcoming(event: EventEntry, now = new Date()): boolean {
  const reference = event.frontmatter.end ?? event.frontmatter.date;
  const ends = new Date(reference);
  if (/^\d{4}-\d{2}-\d{2}$/.test(reference)) {
    ends.setUTCHours(23, 59, 59, 999);
  }
  return ends.getTime() >= now.getTime();
}

export function splitEvents(
  locale: Locale,
  now = new Date(),
  root: string = CONTENT_ROOT,
) {
  const all = getEvents(locale, root);
  const upcoming = all
    .filter((e) => isUpcoming(e, now))
    .sort(
      (a, b) =>
        new Date(a.frontmatter.date).getTime() -
        new Date(b.frontmatter.date).getTime(),
    );
  const past = all.filter((e) => !isUpcoming(e, now));
  return { upcoming, past };
}

/** Most recent update for an entry — used by the sitemap. */
export function lastModified(entry: Entry): Date {
  return new Date(entry.frontmatter.updated ?? entry.frontmatter.date);
}

/** Every published entry across every collection and locale. */
export function allPublished(root: string = CONTENT_ROOT): Entry[] {
  return COLLECTIONS.flatMap((collection) =>
    LOCALES.flatMap((locale) => published(collection, locale, root)),
  );
}

export type PairingProblem = {
  source: string;
  missingLocale: Locale;
  translationKey: string;
};

/**
 * Entries that claim to be paired but have no counterpart.
 *
 * This is what separates an accidental missing translation from a deliberate
 * single-language edition: `translation: pending` or `standalone` opts out.
 * Asserted by tests/content.test.ts rather than thrown here, so a half-finished
 * pair can still be previewed locally.
 */
export function findPairingProblems(
  root: string = CONTENT_ROOT,
): PairingProblem[] {
  const problems: PairingProblem[] = [];
  for (const entry of allPublished(root)) {
    const state = entry.frontmatter.translation ?? "paired";
    if (state !== "paired") continue;
    for (const locale of LOCALES) {
      if (locale === entry.locale) continue;
      if (!getCounterpart(entry, locale, root)) {
        problems.push({
          source: entry.source,
          missingLocale: locale,
          translationKey: entry.translationKey,
        });
      }
    }
  }
  return problems;
}

/** Rough reading time, used as a reader affordance only. */
export function readingTimeMinutes(body: string): number {
  const trimmed = body.trim();
  if (trimmed === "") return 1;
  // Korean prose has no spaces between most words, so words-per-minute
  // undercounts badly. Count Hangul syllables separately at ~500/min.
  const hangul = (trimmed.match(/[ㄱ-ㆎ가-힣]/g) ?? []).length;
  const latinWords = trimmed
    .replace(/[ㄱ-ㆎ가-힣]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(latinWords / 220 + hangul / 500));
}

/** Clears the memoised index. Tests only. */
export function clearContentCache(): void {
  cache.clear();
}

export { COLLECTIONS, LOCALES };
export type { Collection, Locale };
