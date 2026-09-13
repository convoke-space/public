import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COLLECTIONS,
  CONTENT_ROOT,
  getEvents,
  getPosts,
  getProjects,
  isUpcoming,
  readCollection,
  readingTimeMinutes,
  splitEvents,
  tagCounts,
  type EventEntry,
} from "@/lib/content";
import { SLUG_PATTERN } from "@/lib/schema";

/**
 * These run against the real content directory. A content file that would break
 * the production build fails here first, in a second rather than a minute.
 */
describe("content directory", () => {
  it("has a directory for every collection", () => {
    for (const collection of COLLECTIONS) {
      expect(
        fs.existsSync(path.join(CONTENT_ROOT, collection)),
        `content/${collection} is missing`,
      ).toBe(true);
    }
  });

  it("parses and validates every file", () => {
    for (const collection of COLLECTIONS) {
      expect(() => readCollection(collection)).not.toThrow();
    }
  });

  it("uses URL-safe, unique slugs", () => {
    for (const collection of COLLECTIONS) {
      const slugs = readCollection(collection).map((e) => e.slug);
      for (const slug of slugs) expect(slug).toMatch(SLUG_PATTERN);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("orders posts newest first", () => {
    const dates = getPosts().map((p) => new Date(p.frontmatter.date).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("orders projects by liveness, then recency", () => {
    const rank = { active: 0, maintained: 1, exploring: 2, archived: 3 };
    const ranks = getProjects().map((p) => rank[p.frontmatter.status]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("excludes drafts from published listings", () => {
    for (const collection of COLLECTIONS) {
      const all = readCollection(collection);
      const drafted = all.filter((e) => e.frontmatter.draft);
      const publishedSlugs = new Set(
        [...getPosts(), ...getProjects(), ...getEvents()].map((e) => e.slug),
      );
      for (const entry of drafted) {
        expect(publishedSlugs.has(entry.slug)).toBe(false);
      }
    }
  });
});

describe("internal links in content resolve", () => {
  const routes = new Set<string>([
    "/",
    "/about",
    "/writing",
    "/projects",
    "/gatherings",
    "/feed.xml",
    "/sitemap.xml",
    "/robots.txt",
  ]);
  for (const post of getPosts()) routes.add(`/writing/${post.slug}`);
  for (const project of getProjects()) routes.add(`/projects/${project.slug}`);
  for (const event of getEvents()) routes.add(`/gatherings/${event.slug}`);

  const entries = COLLECTIONS.flatMap((c) => readCollection(c));

  it("finds no broken site-relative links", () => {
    const broken: string[] = [];
    for (const entry of entries) {
      const matches = entry.body.matchAll(/\]\((\/[^)\s]*)\)/g);
      for (const match of matches) {
        const href = (match[1] ?? "").split("#")[0]!.replace(/\/$/, "") || "/";
        if (!routes.has(href)) broken.push(`${entry.source} -> ${match[1]}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("events", () => {
  const makeEvent = (date: string, end?: string): EventEntry => ({
    collection: "events",
    slug: "x",
    source: "content/events/x.mdx",
    body: "body",
    frontmatter: {
      title: "T",
      description: "D",
      date,
      end,
      location: "Online",
      format: "online",
    },
  });

  it("treats a date-only event as running to the end of that day", () => {
    const now = new Date("2026-05-01T20:00:00Z");
    expect(isUpcoming(makeEvent("2026-05-01"), now)).toBe(true);
    expect(isUpcoming(makeEvent("2026-04-30"), now)).toBe(false);
  });

  it("uses the end time when one is given", () => {
    const now = new Date("2026-05-01T20:00:00Z");
    expect(isUpcoming(makeEvent("2026-05-01T18:00:00Z", "2026-05-01T19:00:00Z"), now)).toBe(false);
    expect(isUpcoming(makeEvent("2026-05-01T18:00:00Z", "2026-05-01T21:00:00Z"), now)).toBe(true);
  });

  it("splits into upcoming (soonest first) and past", () => {
    const { upcoming, past } = splitEvents();
    const starts = upcoming.map((e) => new Date(e.frontmatter.date).getTime());
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(upcoming.length + past.length).toBe(getEvents().length);
  });
});

describe("helpers", () => {
  it("counts tags by frequency then alphabetically", () => {
    const counts = tagCounts(getPosts());
    for (let i = 1; i < counts.length; i += 1) {
      const prev = counts[i - 1]!;
      const current = counts[i]!;
      expect(
        prev.count > current.count ||
          (prev.count === current.count && prev.tag < current.tag),
      ).toBe(true);
    }
  });

  it("never reports a reading time below one minute", () => {
    expect(readingTimeMinutes("")).toBe(1);
    expect(readingTimeMinutes("word ".repeat(440))).toBe(2);
  });
});
