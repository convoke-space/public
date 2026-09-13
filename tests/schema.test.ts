import { describe, expect, it } from "vitest";
import {
  ContentValidationError,
  isValidDateString,
  parseFrontmatter,
} from "@/lib/schema";

const validPost = {
  title: "A title",
  description: "A description.",
  date: "2026-01-02",
};

describe("parseFrontmatter", () => {
  it("accepts a minimal post", () => {
    expect(parseFrontmatter("posts", { ...validPost }, "test.mdx")).toEqual({
      title: "A title",
      description: "A description.",
      date: "2026-01-02",
    });
  });

  it("normalises tags to lowercase and drops empty arrays", () => {
    const fm = parseFrontmatter(
      "posts",
      { ...validPost, tags: ["Architecture", " AI-Native "] },
      "test.mdx",
    );
    expect(fm.tags).toEqual(["architecture", "ai-native"]);
    expect(parseFrontmatter("posts", { ...validPost, tags: [] }, "t").tags).toBeUndefined();
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
    }
  });

  it("rejects unknown fields so schema drift cannot ship silently", () => {
    expect(() =>
      parseFrontmatter("posts", { ...validPost, cover: "/x.png" }, "t.mdx"),
    ).toThrow(/unknown field\(s\): cover/);
  });

  it("rejects non-absolute canonical URLs", () => {
    expect(() =>
      parseFrontmatter("posts", { ...validPost, canonical: "/elsewhere" }, "t.mdx"),
    ).toThrow(/absolute http\(s\) URL/);
  });

  it("accepts Date objects parsed by the YAML loader", () => {
    const fm = parseFrontmatter(
      "posts",
      { ...validPost, date: new Date("2026-03-04T00:00:00Z") },
      "t.mdx",
    );
    expect(fm.date).toBe("2026-03-04");
  });

  it("requires a valid project status", () => {
    expect(() =>
      parseFrontmatter("projects", { ...validPost, status: "wip" }, "p.mdx"),
    ).toThrow(/"status" must be one of/);
    expect(
      parseFrontmatter("projects", { ...validPost, status: "active" }, "p.mdx").status,
    ).toBe("active");
  });

  it("requires location and format on events", () => {
    expect(() =>
      parseFrontmatter("events", { ...validPost }, "e.mdx"),
    ).toThrow(/"location"/);

    const fm = parseFrontmatter(
      "events",
      {
        ...validPost,
        date: "2026-05-01T18:00:00Z",
        location: "Seoul",
        format: "in-person",
      },
      "e.mdx",
    );
    expect(fm.format).toBe("in-person");
    expect(fm.location).toBe("Seoul");
  });

  it("enforces the description length budget used by meta tags", () => {
    expect(() =>
      parseFrontmatter(
        "posts",
        { ...validPost, description: "x".repeat(201) },
        "t.mdx",
      ),
    ).toThrow(/200 characters or fewer/);
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
