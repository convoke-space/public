import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Mechanical enforcement of the two-repository invariant and the "nothing
 * secret in the public repository" rule.
 *
 * The file list comes from `git ls-files`, so the scan covers everything that
 * is actually tracked — not a hand-maintained allowlist that silently stops
 * matching reality. These are architecture tests: when one fails, the fix is in
 * the code, not the test. See AGENTS.md §3 and §4.
 */

const ROOT = path.join(__dirname, "..");

/** Paths excluded from the text scan, with the reason each is safe to skip. */
const SCAN_EXCLUSIONS: [RegExp, string][] = [
  [/^package-lock\.json$/, "generated; integrity hashes look like secrets"],
  [/^tests\/boundary\.test\.ts$/, "contains the patterns it searches for"],
  [
    /\.(png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|otf|pdf|zip|gz)$/i,
    "binary or font asset",
  ],
];

/**
 * Tracked files plus files that are new but not gitignored, so a secret is
 * caught before it is ever staged rather than after.
 */
function trackedFiles(): string[] {
  const output = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  return [...new Set(output.split("\0").filter(Boolean))].sort();
}

const ALL_TRACKED = trackedFiles();

const SCANNED = ALL_TRACKED.filter(
  (file) => !SCAN_EXCLUSIONS.some(([pattern]) => pattern.test(file)),
);

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

describe("the scan itself", () => {
  it("reads the file list from git, not a hardcoded list", () => {
    expect(ALL_TRACKED.length).toBeGreaterThan(30);
    expect(ALL_TRACKED).toContain("package.json");
    expect(ALL_TRACKED).toContain("AGENTS.md");
    expect(ALL_TRACKED.some((f) => f.startsWith("src/app/"))).toBe(true);
    expect(ALL_TRACKED.some((f) => f.startsWith("content/"))).toBe(true);
  });

  it("every tracked file is either scanned or excluded for a stated reason", () => {
    for (const file of ALL_TRACKED) {
      if (SCANNED.includes(file)) continue;
      const reason = SCAN_EXCLUSIONS.find(([pattern]) => pattern.test(file))?.[1];
      expect(reason, `${file} is skipped without a reason`).toBeTruthy();
    }
  });
});

describe("public/private boundary", () => {
  it("has no git submodules", () => {
    expect(ALL_TRACKED).not.toContain(".gitmodules");
    expect(fs.existsSync(path.join(ROOT, ".gitmodules"))).toBe(false);
  });

  it("never fetches the private repository at build or run time", () => {
    // Documentation may name the private repository; code and config may not
    // use it as a dependency, a remote, or a clone target.
    const isProse = (file: string) =>
      file.startsWith("docs/") || /\.(md|mdx)$/.test(file);

    const offenders = SCANNED.filter((file) => !isProse(file)).filter((file) =>
      /(clone|fetch|checkout|submodule)[^\n]{0,80}convoke-space\/private/i.test(
        read(file),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("declares no dependency resolved from a git URL or local path", () => {
    const pkg = JSON.parse(read("package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    for (const spec of Object.values({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    })) {
      expect(spec).not.toMatch(/^(git\+|github:|file:|link:)/);
    }
  });
});

describe("no secrets in the public repository", () => {
  const SECRET_PATTERNS: [string, RegExp][] = [
    ["private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
    ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{20,}\b/],
    ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
    ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
    ["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
    [
      "generic API key assignment",
      /\b(api[_-]?key|secret|password|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{24,}["']/i,
    ],
  ];

  it.each(SECRET_PATTERNS)("contains no %s", (_label, pattern) => {
    expect(SCANNED.filter((file) => pattern.test(read(file)))).toEqual([]);
  });

  it("tracks no .env file other than an example", () => {
    const envFiles = ALL_TRACKED.filter(
      (file) => path.basename(file).startsWith(".env") && file !== ".env.example",
    );
    expect(envFiles).toEqual([]);
  });

  it("ignores .env files in git", () => {
    const gitignore = read(".gitignore");
    expect(gitignore).toMatch(/^\.env$/m);
    expect(gitignore).toMatch(/^\.env\.\*$/m);
  });

  it("carries no personal contact details", () => {
    // Convoke publishes as an organisation; no personal email or phone number
    // belongs in a permanently public repository. See AGENTS.md §4.
    const email = /[A-Za-z0-9._%+-]+@(?!example\.|schema\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
    const allowed = /noreply@anthropic\.com/;
    const offenders = SCANNED.filter((file) => {
      const matches = read(file).match(new RegExp(email, "g")) ?? [];
      return matches.some((match) => !allowed.test(match));
    });
    expect(offenders).toEqual([]);
  });
});
