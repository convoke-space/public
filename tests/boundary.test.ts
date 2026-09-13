import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Mechanical enforcement of the two-repository invariant and the "nothing
 * secret in the public repository" rule.
 *
 * These are architecture tests. If one fails, the fix is to change the code,
 * not the test — see AGENTS.md.
 */

const ROOT = path.join(__dirname, "..");

const SCANNED_DIRS = ["src", "content", "docs", ".github", "tests"];
const SCANNED_FILES = [
  "package.json",
  "next.config.ts",
  "site.config.ts",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

const trackedFiles = [
  ...SCANNED_DIRS.flatMap((d) => walk(path.join(ROOT, d))),
  ...SCANNED_FILES.map((f) => path.join(ROOT, f)).filter((f) =>
    fs.existsSync(f),
  ),
];

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

describe("public/private boundary", () => {
  it("has no git submodules", () => {
    expect(fs.existsSync(path.join(ROOT, ".gitmodules"))).toBe(false);
  });

  it("never fetches the private repository at build or run time", () => {
    // Documentation may name the private repo; code and config may not use it
    // as a dependency, remote, or clone target.
    const offenders = trackedFiles
      .filter((f) => !f.includes(`${path.sep}docs${path.sep}`))
      .filter((f) => !/AGENTS\.md$|CLAUDE\.md$|README\.md$/.test(f))
      .filter((f) => !f.endsWith("boundary.test.ts"))
      .filter((f) => {
        const source = read(f);
        return /(clone|fetch|checkout|submodule)[^\n]{0,80}convoke-space\/private/i.test(
          source,
        );
      });
    expect(offenders).toEqual([]);
  });

  it("declares no dependency resolved from a git URL or local path", () => {
    const pkg = JSON.parse(read(path.join(ROOT, "package.json"))) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const specs = Object.values({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    });
    for (const spec of specs) {
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
    ["generic API key assignment", /\b(api[_-]?key|secret|password|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{24,}["']/i],
  ];

  it.each(SECRET_PATTERNS)("contains no %s", (_label, pattern) => {
    const offenders = trackedFiles
      .filter((f) => !f.endsWith("boundary.test.ts"))
      .filter((f) => pattern.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("commits no real .env file", () => {
    const envFiles = fs
      .readdirSync(ROOT)
      .filter((f) => f.startsWith(".env") && f !== ".env.example");
    expect(envFiles).toEqual([]);
  });

  it("ignores .env files in git", () => {
    const gitignore = read(path.join(ROOT, ".gitignore"));
    expect(gitignore).toMatch(/^\.env$/m);
    expect(gitignore).toMatch(/^\.env\.\*$/m);
  });
});
