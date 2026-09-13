import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Mechanical guards on the two-repository invariant and on credentials reaching
 * a permanently public repository.
 *
 * Two distinct things live here, and neither is a general-purpose secret
 * scanner:
 *
 *  1. A **pattern-based guard** over every file `git` reports as tracked or
 *     newly added. It matches a fixed list of well-known credential shapes. It
 *     will not catch an arbitrary secret in an unrecognised format, and is not
 *     a substitute for GitHub secret scanning.
 *  2. A **structural dependency-boundary check** that parses package.json and
 *     package-lock.json and rejects any dependency resolved from a git URL, a
 *     local path, or a host other than the public npm registry — which is how
 *     production would come to depend on convoke-space/private or on a machine.
 *
 * These are architecture tests: when one fails, the fix is in the code, not the
 * test. See AGENTS.md §3 and §4.
 */

const ROOT = path.join(__dirname, "..");

/** Paths excluded from the text scan, with the reason each is safe to skip. */
const SCAN_EXCLUSIONS: [RegExp, string][] = [
  [
    /^package-lock\.json$/,
    "generated; integrity hashes trip the pattern guard. Checked structurally instead — see the dependency boundary suite",
  ],
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
  return [...new Set(output.split("\0").filter(Boolean))]
    // `--cached` still lists a file deleted from the working tree but not yet
    // staged; there is nothing to scan in that case.
    .filter((file) => fs.existsSync(path.join(ROOT, file)))
    .sort();
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

type LockEntry = {
  resolved?: unknown;
  version?: unknown;
  link?: unknown;
  from?: unknown;
  dependencies?: Record<string, LockEntry>;
};

type Lockfile = {
  packages?: Record<string, LockEntry>;
  dependencies?: Record<string, LockEntry>;
};

/** npm's scheme prefixes for a resolution that is not the public registry. */
const NON_REGISTRY = /^(git\+|git:|github:|gitlab:|bitbucket:|file:|link:|portal:)/i;
const ALLOWED_REGISTRY_HOSTS = ["registry.npmjs.org"];

/** Every (path, entry) pair in a lockfile, in both the modern and legacy shapes. */
function lockEntries(lock: Lockfile): [string, LockEntry][] {
  const found: [string, LockEntry][] = [];

  for (const [name, entry] of Object.entries(lock.packages ?? {})) {
    found.push([name || "<root>", entry]);
  }

  const walkLegacy = (deps: Record<string, LockEntry>, prefix: string) => {
    for (const [name, entry] of Object.entries(deps)) {
      const at = prefix ? `${prefix} > ${name}` : name;
      found.push([at, entry]);
      if (entry.dependencies) walkLegacy(entry.dependencies, at);
    }
  };
  walkLegacy(lock.dependencies ?? {}, "");

  return found;
}

/**
 * Dependencies that would tie production to something other than the public
 * npm registry — a git URL, a path on the build machine, or another host.
 * Any of those is how `convoke-space/public` would stop building on its own.
 */
function offendingDependencies(lock: Lockfile): string[] {
  const offenders: string[] = [];

  for (const [name, entry] of lockEntries(lock)) {
    if (name === "<root>") continue;

    if (entry.link === true) {
      offenders.push(`${name}: linked to a local path`);
      continue;
    }

    for (const field of ["resolved", "version", "from"] as const) {
      const value = entry[field];
      if (typeof value !== "string") continue;

      if (NON_REGISTRY.test(value)) {
        offenders.push(`${name}: ${field} is "${value}"`);
        continue;
      }
      if (/convoke-space/i.test(value)) {
        offenders.push(`${name}: ${field} points at convoke-space`);
        continue;
      }
      if (field === "resolved") {
        let host: string;
        try {
          host = new URL(value).host;
        } catch {
          offenders.push(`${name}: resolved is not a URL ("${value}")`);
          continue;
        }
        if (!ALLOWED_REGISTRY_HOSTS.includes(host)) {
          offenders.push(`${name}: resolved from ${host}`);
        }
      }
    }
  }

  return offenders;
}

describe("dependency boundary", () => {
  const LOCK = JSON.parse(read("package-lock.json")) as Lockfile;

  it("parses the lockfile structurally rather than pattern-matching it", () => {
    const entries = lockEntries(LOCK);
    expect(entries.length).toBeGreaterThan(100);
    expect(entries.some(([name]) => name.includes("node_modules/next"))).toBe(true);
  });

  it("resolves every locked package from the public npm registry", () => {
    expect(offendingDependencies(LOCK)).toEqual([]);
  });

  it("declares no direct dependency resolved from a git URL or local path", () => {
    const pkg = JSON.parse(read("package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    for (const spec of Object.values({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    })) {
      expect(spec).not.toMatch(NON_REGISTRY);
    }
  });

  // The guard is only worth having if it actually catches these.
  describe("catches a lockfile that breaks the boundary", () => {
    it.each([
      [
        "a git dependency",
        { packages: { "node_modules/x": { resolved: "git+ssh://git@github.com/a/b.git#abc" } } },
      ],
      [
        "a file: dependency",
        { packages: { "node_modules/x": { version: "file:../local-thing" } } },
      ],
      [
        "a symlinked workspace outside the repository",
        { packages: { "node_modules/x": { link: true, resolved: "../elsewhere" } } },
      ],
      [
        "a package served from the private repository",
        {
          packages: {
            "node_modules/x": {
              resolved: "https://github.com/convoke-space/private/releases/x.tgz",
            },
          },
        },
      ],
      [
        "a package from an unexpected registry host",
        { packages: { "node_modules/x": { resolved: "https://npm.internal.example/x.tgz" } } },
      ],
      [
        "a legacy-shape lockfile with a nested git dependency",
        {
          dependencies: {
            outer: { version: "1.0.0", dependencies: { inner: { from: "github:a/b" } } },
          },
        },
      ],
    ] satisfies [string, Lockfile][])("%s", (_label, lock) => {
      expect(offendingDependencies(lock).length).toBeGreaterThan(0);
    });

    it("accepts an ordinary registry entry", () => {
      expect(
        offendingDependencies({
          packages: {
            "node_modules/x": {
              version: "1.2.3",
              resolved: "https://registry.npmjs.org/x/-/x-1.2.3.tgz",
            },
          },
        }),
      ).toEqual([]);
    });
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
