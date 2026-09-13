/**
 * Frontmatter schemas for the content-as-code layer.
 *
 * Deliberately dependency-free: the rules are small, the error messages need to
 * be precise enough for a human or an AI agent to fix a content file without
 * reading this module, and the whole thing is covered by tests/schema.test.ts.
 *
 * Locale is NOT a frontmatter field. The directory a file lives in is the
 * authoritative source of its locale — see docs/ARCHITECTURE.md. Storing it
 * twice only creates drift.
 *
 * Adding a field? Add it here, document it in docs/PUBLISHING.md, and extend
 * the tests.
 */

export const COLLECTIONS = ["posts", "projects", "events"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export const PROJECT_STATUSES = [
  "exploring",
  "active",
  "maintained",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const EVENT_FORMATS = ["in-person", "online", "hybrid"] as const;
export type EventFormat = (typeof EVENT_FORMATS)[number];

/**
 * Whether this entry is expected to have an edition in the other language.
 *
 * `paired` (the default) is checked by tests/content.test.ts, so an accidental
 * missing translation fails validation instead of shipping a half-bilingual
 * archive. The other two values are the explicit way to say "this one is
 * single-language on purpose" or "the other edition is still being adapted".
 */
export const TRANSLATION_STATES = ["paired", "pending", "standalone"] as const;
export type TranslationState = (typeof TRANSLATION_STATES)[number];

type BaseFrontmatter = {
  title: string;
  description: string;
  /** ISO 8601 date (YYYY-MM-DD) or datetime. */
  date: string;
  updated?: string;
  tags?: string[];
  draft?: boolean;
  /**
   * Locale-independent identity shared by both language editions of one piece.
   * The language switcher and hreflang pairing are built on this.
   */
  translationKey: string;
  translation?: TranslationState;
};

export type PostFrontmatter = BaseFrontmatter & {
  /** Set when the piece was first published elsewhere. */
  canonical?: string;
};

export type ProjectFrontmatter = BaseFrontmatter & {
  status: ProjectStatus;
  /** Where the project itself lives, if it is publicly reachable today. */
  url?: string;
  repo?: string;
};

export type EventFrontmatter = BaseFrontmatter & {
  /** `date` is the start; `end` is optional. */
  end?: string;
  location: string;
  format: EventFormat;
  /**
   * External registration (Tally, Luma, a form, …). Convoke is the presentation
   * layer only — attendee data is never stored in this repository.
   */
  registrationUrl?: string;
};

export type FrontmatterFor<C extends Collection> = C extends "posts"
  ? PostFrontmatter
  : C extends "projects"
    ? ProjectFrontmatter
    : EventFrontmatter;

export class ContentValidationError extends Error {
  constructor(source: string, problems: string[]) {
    super(
      `Invalid frontmatter in ${source}:\n` +
        problems.map((p) => `  - ${p}`).join("\n"),
    );
    this.name = "ContentValidationError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

/** Records collected problems so one pass reports every issue in a file. */
class Collector {
  readonly problems: string[] = [];

  constructor(private readonly data: Record<string, unknown>) {}

  requiredString(key: string, { maxLength }: { maxLength?: number } = {}) {
    const value = this.data[key];
    if (typeof value !== "string" || value.trim() === "") {
      this.problems.push(`"${key}" is required and must be a non-empty string`);
      return "";
    }
    if (maxLength && value.length > maxLength) {
      this.problems.push(
        `"${key}" must be ${maxLength} characters or fewer (got ${value.length})`,
      );
    }
    return value.trim();
  }

  optionalString(key: string): string | undefined {
    const value = this.data[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string" || value.trim() === "") {
      this.problems.push(`"${key}" must be a non-empty string when present`);
      return undefined;
    }
    return value.trim();
  }

  optionalUrl(key: string): string | undefined {
    const value = this.optionalString(key);
    if (value === undefined) return undefined;
    if (!/^https?:\/\//.test(value)) {
      this.problems.push(`"${key}" must be an absolute http(s) URL`);
      return undefined;
    }
    return value;
  }

  requiredDate(key: string): string {
    const raw = this.data[key];
    const value = raw instanceof Date ? toIsoDate(raw) : raw;
    if (typeof value !== "string" || !isValidDateString(value)) {
      this.problems.push(
        `"${key}" is required and must be an ISO date (YYYY-MM-DD) or datetime`,
      );
      return "";
    }
    return value;
  }

  optionalDate(key: string): string | undefined {
    const raw = this.data[key];
    if (raw === undefined || raw === null) return undefined;
    const value = raw instanceof Date ? toIsoDate(raw) : raw;
    if (typeof value !== "string" || !isValidDateString(value)) {
      this.problems.push(
        `"${key}" must be an ISO date (YYYY-MM-DD) or datetime when present`,
      );
      return undefined;
    }
    return value;
  }

  optionalBoolean(key: string): boolean | undefined {
    const value = this.data[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "boolean") {
      this.problems.push(`"${key}" must be true or false when present`);
      return undefined;
    }
    return value;
  }

  optionalTags(key: string): string[] | undefined {
    const value = this.data[key];
    if (value === undefined || value === null) return undefined;
    if (!Array.isArray(value) || value.some((t) => typeof t !== "string")) {
      this.problems.push(`"${key}" must be an array of strings when present`);
      return undefined;
    }
    const tags = (value as string[])
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (new Set(tags).size !== tags.length) {
      this.problems.push(`"${key}" contains duplicate entries`);
    }
    return tags.length > 0 ? tags : undefined;
  }

  enum<T extends string>(key: string, allowed: readonly T[]): T {
    const value = this.data[key];
    if (typeof value !== "string" || !allowed.includes(value as T)) {
      this.problems.push(`"${key}" must be one of: ${allowed.join(", ")}`);
      return allowed[0] as T;
    }
    return value as T;
  }

  optionalEnum<T extends string>(
    key: string,
    allowed: readonly T[],
  ): T | undefined {
    const value = this.data[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string" || !allowed.includes(value as T)) {
      this.problems.push(
        `"${key}" must be one of: ${allowed.join(", ")} when present`,
      );
      return undefined;
    }
    return value as T;
  }

  translationKey(key: string): string {
    const value = this.requiredString(key);
    if (value && !TRANSLATION_KEY_PATTERN.test(value)) {
      this.problems.push(
        `"${key}" must be lowercase ASCII kebab-case so it stays language-independent (got "${value}")`,
      );
    }
    return value;
  }

  /** Dates must be ordered, or the page shows something nonsensical. */
  ordered(
    earlierKey: string,
    earlier: string | undefined,
    laterKey: string,
    later: string | undefined,
  ) {
    if (!earlier || !later) return;
    if (new Date(later).getTime() < new Date(earlier).getTime()) {
      this.problems.push(
        `"${laterKey}" (${later}) must not be earlier than "${earlierKey}" (${earlier})`,
      );
    }
  }

  rejectUnknown(known: readonly string[]) {
    const unknown = Object.keys(this.data).filter((k) => !known.includes(k));
    if (unknown.length > 0) {
      this.problems.push(
        `unknown field(s): ${unknown.join(", ")}. Add them to src/lib/schema.ts first`,
      );
    }
    if (Object.prototype.hasOwnProperty.call(this.data, "locale")) {
      this.problems.push(
        `"locale" is not a frontmatter field — the directory the file lives in determines its locale`,
      );
    }
  }
}

const BASE_FIELDS = [
  "title",
  "description",
  "date",
  "updated",
  "tags",
  "draft",
  "translationKey",
  "translation",
] as const;

function parseBase(c: Collector): BaseFrontmatter {
  const date = c.requiredDate("date");
  const updated = c.optionalDate("updated");
  c.ordered("date", date, "updated", updated);

  return {
    title: c.requiredString("title", { maxLength: 120 }),
    description: c.requiredString("description", { maxLength: 200 }),
    date,
    updated,
    tags: c.optionalTags("tags"),
    draft: c.optionalBoolean("draft"),
    translationKey: c.translationKey("translationKey"),
    translation: c.optionalEnum("translation", TRANSLATION_STATES),
  };
}

/**
 * Validate raw frontmatter for a collection.
 * @throws ContentValidationError with every problem found in the file.
 */
export function parseFrontmatter<C extends Collection>(
  collection: C,
  data: Record<string, unknown>,
  source: string,
): FrontmatterFor<C> {
  const c = new Collector(data);
  let result: PostFrontmatter | ProjectFrontmatter | EventFrontmatter;

  switch (collection) {
    case "projects": {
      c.rejectUnknown([...BASE_FIELDS, "status", "url", "repo"]);
      result = {
        ...parseBase(c),
        status: c.enum("status", PROJECT_STATUSES),
        url: c.optionalUrl("url"),
        repo: c.optionalUrl("repo"),
      } satisfies ProjectFrontmatter;
      break;
    }
    case "events": {
      c.rejectUnknown([
        ...BASE_FIELDS,
        "end",
        "location",
        "format",
        "registrationUrl",
      ]);
      const base = parseBase(c);
      const end = c.optionalDate("end");
      c.ordered("date", base.date, "end", end);
      result = {
        ...base,
        end,
        location: c.requiredString("location", { maxLength: 120 }),
        format: c.enum("format", EVENT_FORMATS),
        registrationUrl: c.optionalUrl("registrationUrl"),
      } satisfies EventFrontmatter;
      break;
    }
    default: {
      c.rejectUnknown([...BASE_FIELDS, "canonical"]);
      result = {
        ...parseBase(c),
        canonical: c.optionalUrl("canonical"),
      } satisfies PostFrontmatter;
    }
  }

  if (c.problems.length > 0) {
    throw new ContentValidationError(source, c.problems);
  }

  return stripUndefined(result) as FrontmatterFor<C>;
}

export function isValidDateString(value: string): boolean {
  if (!ISO_DATE.test(value) && !ISO_DATETIME.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T;
}

/**
 * Filenames become slugs. Korean slugs are first-class, so Hangul syllables are
 * allowed alongside lowercase ASCII — but not spaces, uppercase or punctuation,
 * which would make URLs unstable.
 */
export const SLUG_PATTERN = /^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/u;

/** translationKey is an identifier, not a URL, so it stays ASCII. */
export const TRANSLATION_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
