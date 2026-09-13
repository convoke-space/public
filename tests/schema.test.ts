import { describe, expect, it } from "vitest";
import {
  ContentValidationError,
  isValidDateString,
  parseFrontmatter,
  SLUG_PATTERN,
  TRANSLATION_KEY_PATTERN,
} from "@/lib/schema";

const valid = {
  title: "A title",
  description: "A description.",
  date: "2026-01-02",
  translationKey: "a-title",
};

describe("parseFrontmatter", () => {
  it("accepts a minimal post", () => {
    expect(parseFrontmatter("posts", { ...valid }, "test.mdx")).toEqual({
      title: "A title",
      description: "A description.",
      date: "2026-01-02",
      translationKey: "a-title",
    });
  });

  it("requires a translationKey so both editions can be paired", () => {
    const { translationKey: _omitted, ...withoutKey } = valid;
    expect(() => parseFrontmatter("posts", withoutKey, "t.mdx")).toThrow(
      /"translationKey" is required/,
    );
  });

  it("keeps translationKey language-independent", () => {
    expect(() =>
      parseFrontmatter(
        "posts",
        { ...valid, translationKey: "깃허브-공용기억" },
        "t.mdx",
      ),
    ).toThrow(/language-independent/);
    expect(() =>
      parseFrontmatter("posts", { ...valid, translationKey: "Not-Kebab" }, "t.mdx"),
    ).toThrow(/language-independent/);
  });

  it("rejects a locale field — the directory decides locale", () => {
    expect(() =>
      parseFrontmatter("posts", { ...valid, locale: "ko" }, "t.mdx"),
    ).toThrow(/"locale" is not a frontmatter field/);
  });

  it("accepts the three translation states and nothing else", () => {
    for (const translation of ["paired", "pending", "standalone"]) {
      expect(
        parseFrontmatter("posts", { ...valid, translation }, "t.mdx").translation,
      ).toBe(translation);
    }
    expect(() =>
      parseFrontmatter("posts", { ...valid, translation: "todo" }, "t.mdx"),
    ).toThrow(/"translation" must be one of/);
  });

  it("normalises tags to lowercase and drops empty arrays", () => {
    const fm = parseFrontmatter(
      "posts",
      { ...valid, tags: ["Architecture", " AI-Native "] },
      "test.mdx",
    );
    expect(fm.tags).toEqual(["architecture", "ai-native"]);
    expect(
      parseFrontmatter("posts", { ...valid, tags: [] }, "t").tags,
    ).toBeUndefined();
  });

  it("reports every problem in one pass", () => {
    try {
      parseFrontmatter("posts", { date: "not-a-date" }, "bad.mdx");
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      const message = (error as Error).message;
      expect(message).toContain("bad.mdx");
      expect(message).toContain('"title"');
      expect(message).toContain('"description"');
      expect(message).toContain('"date"');
      expect(message).toContain('"translationKey"');
    }
  });

  it("rejects unknown fields so schema drift cannot ship silently", () => {
    expect(() =>
      parseFrontmatter("posts", { ...valid, cover: "/x.png" }, "t.mdx"),
    ).toThrow(/unknown field\(s\): cover/);
  });

  it("rejects non-absolute canonical URLs", () => {
    expect(() =>
      parseFrontmatter("posts", { ...valid, canonical: "/elsewhere" }, "t.mdx"),
    ).toThrow(/absolute http\(s\) URL/);
  });

  it("accepts Date objects parsed by the YAML loader", () => {
    const fm = parseFrontmatter(
      "posts",
      { ...valid, date: new Date("2026-03-04T00:00:00Z") },
      "t.mdx",
    );
    expect(fm.date).toBe("2026-03-04");
  });

  it("requires updated to be on or after the publication date", () => {
    expect(() =>
      parseFrontmatter("posts", { ...valid, updated: "2026-01-01" }, "t.mdx"),
    ).toThrow(/"updated" \(2026-01-01\) must not be earlier than "date"/);
    expect(
      parseFrontmatter("posts", { ...valid, updated: "2026-01-02" }, "t.mdx")
        .updated,
    ).toBe("2026-01-02");
  });

  it("requires a project status", () => {
    expect(() =>
      parseFrontmatter("projects", { ...valid, status: "wip" }, "p.mdx"),
    ).toThrow(/"status" must be one of/);
    expect(
      parseFrontmatter("projects", { ...valid, status: "active" }, "p.mdx").status,
    ).toBe("active");
  });

  it("requires location and format on events", () => {
    expect(() => parseFrontmatter("events", { ...valid }, "e.mdx")).toThrow(
      /"location"/,
    );

    const fm = parseFrontmatter(
      "events",
      {
        ...valid,
        date: "2026-05-01T18:00:00Z",
        location: "서울",
        format: "in-person",
      },
      "e.mdx",
    );
    expect(fm.format).toBe("in-person");
    expect(fm.location).toBe("서울");
  });

  it("requires an event to end on or after it starts", () => {
    const base = {
      ...valid,
      date: "2026-05-01T18:00:00Z",
      location: "Online",
      format: "online",
    };
    expect(() =>
      parseFrontmatter("events", { ...base, end: "2026-05-01T17:00:00Z" }, "e.mdx"),
    ).toThrow(/"end" .* must not be earlier than "date"/);
    expect(
      parseFrontmatter("events", { ...base, end: "2026-05-01T20:00:00Z" }, "e.mdx")
        .end,
    ).toBe("2026-05-01T20:00:00Z");
  });

  it("enforces the description length budget used by meta tags", () => {
    expect(() =>
      parseFrontmatter(
        "posts",
        { ...valid, description: "x".repeat(201) },
        "t.mdx",
      ),
    ).toThrow(/200 characters or fewer/);
  });
});

describe("slug and key patterns", () => {
  it.each([
    ["github-as-agent-memory", true],
    ["깃허브를-공용기억으로", true],
    ["ai와-일하기", true],
    ["Not-Kebab", false],
    ["has space", false],
    ["trailing-", false],
  ])("slug %s -> %s", (value, expected) => {
    expect(SLUG_PATTERN.test(value)).toBe(expected);
  });

  it.each([
    ["shared-memory", true],
    ["공용기억", false],
    ["Shared-Memory", false],
  ])("translationKey %s -> %s", (value, expected) => {
    expect(TRANSLATION_KEY_PATTERN.test(value)).toBe(expected);
  });
});

describe("isValidDateString", () => {
  it.each([
    ["2026-01-01", true],
    ["2026-01-01T09:30:00Z", true],
    ["2026-01-01T09:30", true],
    ["2026-13-01", false],
    ["01/01/2026", false],
    ["", false],
  ])("%s -> %s", (value, expected) => {
    expect(isValidDateString(value)).toBe(expected);
  });
});
