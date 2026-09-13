import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
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

export type Entry<C extends Collection = Collection> = {
  collection: C;
  slug: string;
  /** Repository-relative path, used in error messages and editing links. */
  source: string;
  frontmatter: FrontmatterFor<C>;
  /** Raw MDX body, compiled lazily by the renderer. */
  body: string;
};

export type Post = Entry<"posts"> & { frontmatter: PostFrontmatter };
export type Project = Entry<"projects"> & { frontmatter: ProjectFrontmatter };
export type EventEntry = Entry<"events"> & { frontmatter: EventFrontmatter };

const CONTENT_EXTENSIONS = [".mdx", ".md"];

const cache = new Map<Collection, Entry[]>();

/**
 * Read and validate every file in a collection.
 *
 * Throws on the first invalid file: content problems must fail the build rather
 * than silently ship a broken page. Results are memoised per process.
 */
export function readCollection<C extends Collection>(collection: C): Entry<C>[] {
  const cached = cache.get(collection);
  if (cached) return cached as Entry<C>[];

  const dir = path.join(CONTENT_ROOT, collection);
  const entries: Entry<C>[] = [];

  if (fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter(
        (f) => f.isFile() && CONTENT_EXTENSIONS.includes(path.extname(f.name)),
      )
      .map((f) => f.name)
      .sort();

    const seen = new Set<string>();

    for (const file of files) {
      const slug = path.basename(file, path.extname(file));
      const source = `content/${collection}/${file}`;

      if (!SLUG_PATTERN.test(slug)) {
        throw new ContentValidationError(source, [
          `filename must be lowercase kebab-case (got "${slug}")`,
        ]);
      }
      if (seen.has(slug)) {
        throw new ContentValidationError(source, [
          `duplicate slug "${slug}" — .md and .mdx cannot share a name`,
        ]);
      }
      seen.add(slug);

      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const frontmatter = parseFrontmatter(
        collection,
        data as Record<string, unknown>,
        source,
      );

      if (content.trim() === "") {
        throw new ContentValidationError(source, ["body is empty"]);
      }

      entries.push({ collection, slug, source, frontmatter, body: content });
    }
  }

  cache.set(collection, entries as Entry[]);
  return entries;
}

/** Published entries only: drafts never reach a listing or a route. */
export function published<C extends Collection>(collection: C): Entry<C>[] {
  return readCollection(collection).filter((e) => !e.frontmatter.draft);
}

export function getEntry<C extends Collection>(
  collection: C,
  slug: string,
): Entry<C> | undefined {
  return published(collection).find((e) => e.slug === slug);
}

function byDateDesc(a: Entry, b: Entry): number {
  return (
    new Date(b.frontmatter.date).getTime() -
    new Date(a.frontmatter.date).getTime()
  );
}

export function getPosts(): Post[] {
  return (published("posts") as Post[]).slice().sort(byDateDesc);
}

export function getProjects(): Project[] {
  const order = { active: 0, maintained: 1, exploring: 2, archived: 3 };
  return (published("projects") as Project[]).slice().sort((a, b) => {
    const rank = order[a.frontmatter.status] - order[b.frontmatter.status];
    return rank !== 0 ? rank : byDateDesc(a, b);
  });
}

export function getEvents(): EventEntry[] {
  return (published("events") as EventEntry[]).slice().sort(byDateDesc);
}

/** An event is upcoming until its end (or its start, when there is no end). */
export function isUpcoming(event: EventEntry, now = new Date()): boolean {
  const reference = event.frontmatter.end ?? event.frontmatter.date;
  const ends = new Date(reference);
  // Date-only values mean "all day": treat them as ending at midnight following.
  if (/^\d{4}-\d{2}-\d{2}$/.test(reference)) {
    ends.setUTCHours(23, 59, 59, 999);
  }
  return ends.getTime() >= now.getTime();
}

export function splitEvents(now = new Date()) {
  const all = getEvents();
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

/** Most recent update across all published content — used by the sitemap. */
export function lastModified(entry: Entry): Date {
  return new Date(entry.frontmatter.updated ?? entry.frontmatter.date);
}

export function allPublishedEntries(): Entry[] {
  return COLLECTIONS.flatMap((c) => published(c));
}

/** Tag index across a collection, ordered by frequency then alphabetically. */
export function tagCounts(entries: Entry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.frontmatter.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Rough reading time, used as a reader affordance only. */
export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export { COLLECTIONS };
export type { Collection };
