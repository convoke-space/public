import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { LOCALES } from "../site.config";
import {
  clearContentCache,
  COLLECTIONS,
  CONTENT_ROOT,
  findTranslationProblems,
  getCounterpart,
  getEntry,
  getEntryByTranslationKey,
  getEvents,
  getPosts,
  getProjects,
  isUpcoming,
  publishedLocales,
  readCollection,
  readingTimeMinutes,
  splitEvents,
  UnsupportedLocaleError,
  type EventEntry,
} from "@/lib/content";
import { SLUG_PATTERN } from "@/lib/schema";

const FIXTURES = path.join(__dirname, "fixtures", "content");

beforeEach(() => {
  clearContentCache();
});

describe("locale handling", () => {
  it("rejects an unsupported locale rather than guessing", () => {
    // @ts-expect-error deliberately passing an unsupported value
    expect(() => readCollection("posts", "fr")).toThrow(UnsupportedLocaleError);
    // @ts-expect-error deliberately passing an unsupported value
    expect(() => readCollection("posts", "ko-KR")).toThrow(/Supported locales/);
  });

  it("loads only the requested locale's files", () => {
    const ko = readCollection("posts", "ko", FIXTURES);
    const en = readCollection("posts", "en", FIXTURES);

    expect(ko.every((e) => e.locale === "ko")).toBe(true);
    expect(en.every((e) => e.locale === "en")).toBe(true);
    expect(ko.map((e) => e.slug)).toContain("깃허브를-공용기억으로");
    expect(en.map((e) => e.slug)).toContain("shared-memory");
    expect(en.map((e) => e.slug)).not.toContain("깃허브를-공용기억으로");
  });

  it("accepts Hangul slugs and keeps them addressable", () => {
    const entry = getEntry("posts", "ko", "깃허브를-공용기억으로", FIXTURES);
    expect(entry?.frontmatter.title).toBe("깃허브를 공용 기억으로");
  });
});

describe("content validation", () => {
  it("rejects a duplicate translationKey inside one locale", () => {
    const root = path.join(__dirname, "fixtures", "duplicate-key");
    expect(() => readCollection("posts", "ko", root)).toThrow(
      /duplicate translationKey "collision"/,
    );
  });

  it("rejects a filename that is not a usable slug", () => {
    const root = path.join(__dirname, "fixtures", "bad-slug");
    expect(() => readCollection("posts", "ko", root)).toThrow(
      /filename must be lowercase kebab-case/,
    );
  });

  it("excludes drafts from every published listing", () => {
    const slugs = getPosts("ko", FIXTURES).map((e) => e.slug);
    expect(slugs).not.toContain("초안");
    expect(readCollection("posts", "ko", FIXTURES).map((e) => e.slug)).toContain(
      "초안",
    );
  });
});

describe("translation pairing", () => {
  it("finds the counterpart across differing slugs", () => {
    const ko = getEntry("posts", "ko", "깃허브를-공용기억으로", FIXTURES)!;
    const en = getCounterpart(ko, "en", FIXTURES);
    expect(en?.slug).toBe("shared-memory");
    expect(en?.translationKey).toBe(ko.translationKey);
  });

  it("returns the entry itself for its own locale", () => {
    const ko = getEntry("posts", "ko", "깃허브를-공용기억으로", FIXTURES)!;
    expect(getCounterpart(ko, "ko", FIXTURES)).toBe(ko);
    expect(publishedLocales(ko, FIXTURES)).toEqual(["ko", "en"]);
  });

  it("returns nothing when the other edition does not exist", () => {
    const ko = getEntry("posts", "ko", "번역-대기중", FIXTURES)!;
    expect(getCounterpart(ko, "en", FIXTURES)).toBeUndefined();
    expect(publishedLocales(ko, FIXTURES)).toEqual(["ko"]);
  });

  it("looks an entry up by translationKey", () => {
    const en = getEntryByTranslationKey("posts", "en", "shared-memory", FIXTURES);
    expect(en?.slug).toBe("shared-memory");
    expect(
      getEntryByTranslationKey("posts", "en", "korean-only", FIXTURES),
    ).toBeUndefined();
  });

  it("never pairs a draft, in either direction", () => {
    const drafted = readCollection("posts", "ko", FIXTURES).find(
      (e) => e.slug === "초안",
    )!;
    // A draft has no published edition anywhere — not even in its own language,
    // so it can never acquire an hreflang or a language-switch target.
    expect(getCounterpart(drafted, "ko", FIXTURES)).toBeUndefined();
    expect(getCounterpart(drafted, "en", FIXTURES)).toBeUndefined();
    expect(publishedLocales(drafted, FIXTURES)).toEqual([]);
  });

  it("separates a deliberate single-language edition from a missing one", () => {
    const problems = findTranslationProblems(FIXTURES);
    const keys = problems.map((p) => p.translationKey);

    // `pending` and `standalone` opt out; the default `paired` does not.
    expect(keys).not.toContain("awaiting-translation");
    expect(keys).not.toContain("korean-only");
    expect(keys).toContain("missing-pair");

    const missing = problems.find((p) => p.translationKey === "missing-pair")!;
    expect(missing.sources).toEqual(["content/posts/en/missing-pair.mdx"]);
    expect(missing.reason).toMatch(/no published ko edition/);
  });
});

describe("translation state contradictions", () => {
  const CONTRADICTIONS = path.join(__dirname, "fixtures", "contradictions");
  const problems = () => findTranslationProblems(CONTRADICTIONS);
  const reasonFor = (key: string) =>
    problems().find((p) => p.translationKey === key)?.reason ?? "";

  it("rejects two published editions that both claim to stand alone", () => {
    expect(reasonFor("both-published-standalone")).toMatch(
      /published in 2 locales.*must be "paired"/s,
    );
  });

  it("rejects pending when the counterpart is already published", () => {
    const reason = reasonFor("stale-pending");
    expect(reason).toMatch(/published in 2 locales/);
    expect(reason).toContain('content/posts/ko/짝이있는데-pending.mdx is "pending"');
  });

  it("rejects a pair whose two sides disagree", () => {
    const reason = reasonFor("mismatched-states");
    expect(reason).toMatch(/published in 2 locales/);
    expect(reason).toContain('content/posts/en/mismatched-states.mdx is "standalone"');
  });

  it("names every file involved, so the fix is obvious", () => {
    const problem = problems().find(
      (p) => p.translationKey === "mismatched-states",
    )!;
    expect(problem.sources).toEqual([
      "content/posts/en/mismatched-states.mdx",
      "content/posts/ko/상태-불일치.mdx",
    ]);
    expect(problem.collection).toBe("posts");
  });

  it("accepts a consistent pair", () => {
    expect(problems().map((p) => p.translationKey)).not.toContain(
      "consistent-pair",
    );
  });

  it("reports each contradiction once, not once per file", () => {
    const keys = problems().map((p) => p.translationKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("the published archive", () => {
  it("has a directory for every collection in every locale", () => {
    for (const collection of COLLECTIONS) {
      for (const locale of LOCALES) {
        expect(
          fs.existsSync(path.join(CONTENT_ROOT, collection, locale)),
          `content/${collection}/${locale} is missing`,
        ).toBe(true);
      }
    }
  });

  it("parses and validates every published file", () => {
    for (const collection of COLLECTIONS) {
      for (const locale of LOCALES) {
        expect(() => readCollection(collection, locale)).not.toThrow();
      }
    }
  });

  it("uses URL-safe, unique slugs per locale", () => {
    for (const collection of COLLECTIONS) {
      for (const locale of LOCALES) {
        const slugs = readCollection(collection, locale).map((e) => e.slug);
        for (const slug of slugs) expect(slug).toMatch(SLUG_PATTERN);
        expect(new Set(slugs).size).toBe(slugs.length);
      }
    }
  });

  it("declares translation states that match what is actually published", () => {
    // An intentional single-language edition sets `translation: pending` or
    // `standalone`. Anything else here is an oversight — see docs/PUBLISHING.md.
    expect(
      findTranslationProblems().map(
        (p) => `${p.sources.join(", ")}: ${p.reason}`,
      ),
    ).toEqual([]);
  });

  it("orders posts newest first in every locale", () => {
    for (const locale of LOCALES) {
      const dates = getPosts(locale).map((p) =>
        new Date(p.frontmatter.date).getTime(),
      );
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    }
  });

  it("orders projects by liveness, then recency", () => {
    const rank = { active: 0, maintained: 1, exploring: 2, archived: 3 };
    for (const locale of LOCALES) {
      const ranks = getProjects(locale).map((p) => rank[p.frontmatter.status]);
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
  });
});

describe("events", () => {
  const makeEvent = (date: string, end?: string): EventEntry => ({
    collection: "events",
    locale: "en",
    slug: "x",
    translationKey: "x",
    source: "content/events/en/x.mdx",
    body: "body",
    frontmatter: {
      title: "T",
      description: "D",
      date,
      end,
      location: "Online",
      format: "online",
      translationKey: "x",
    },
  });

  it("treats a date-only event as running to the end of that day", () => {
    const now = new Date("2026-05-01T20:00:00Z");
    expect(isUpcoming(makeEvent("2026-05-01"), now)).toBe(true);
    expect(isUpcoming(makeEvent("2026-04-30"), now)).toBe(false);
  });

  it("uses the end time when one is given", () => {
    const now = new Date("2026-05-01T20:00:00Z");
    expect(
      isUpcoming(makeEvent("2026-05-01T18:00:00Z", "2026-05-01T19:00:00Z"), now),
    ).toBe(false);
    expect(
      isUpcoming(makeEvent("2026-05-01T18:00:00Z", "2026-05-01T21:00:00Z"), now),
    ).toBe(true);
  });

  it("splits into upcoming (soonest first) and past, per locale", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const { upcoming, past } = splitEvents("ko", now, FIXTURES);
    const starts = upcoming.map((e) => new Date(e.frontmatter.date).getTime());
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(upcoming.length + past.length).toBe(getEvents("ko", FIXTURES).length);
    expect(upcoming).toHaveLength(1);
  });
});

describe("readingTimeMinutes", () => {
  it("never reports less than a minute", () => {
    expect(readingTimeMinutes("")).toBe(1);
    expect(readingTimeMinutes("   ")).toBe(1);
  });

  it("counts Latin words", () => {
    expect(readingTimeMinutes("word ".repeat(440))).toBe(2);
  });

  it("counts Hangul syllables rather than space-delimited words", () => {
    // Korean prose has few spaces, so a word count would read as ~1 minute.
    const korean = "한국어문장입니다".repeat(125); // 1,000 syllables
    expect(readingTimeMinutes(korean)).toBe(2);
  });
});
