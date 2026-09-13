# convoke-space/public

Public source for **[convoke.space](https://convoke.space)** — a bilingual
personal publication holding writing, projects, and gatherings, in Korean and
English as equals.

> Everything in this repository is public and permanent. Assume every commit is
> indexed the moment it is pushed. Private drafts and working material live in
> `convoke-space/private` and never reach production automatically.

## Quick start

```bash
npm ci
npm run dev      # http://localhost:3000
npm run verify   # lint + typecheck + test + build — the gate for every change
```

Node 22 or newer.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · MDX content on disk ·
deployed on Vercel.

No database, no CMS, no authentication, no analytics, no web fonts, no
third-party scripts, and no i18n framework. Content is files in git; publishing
is a pull request.

## Layout

```
site.config.ts   canonical origin, supported locales, navigation
content/         posts · projects · events, each split by locale (ko / en)
src/app/
  (gateway)/     the locale-neutral `/` language gateway
  [locale]/      every localized route, plus a per-locale RSS feed
src/components/  presentational building blocks
src/lib/         content loader, schema, i18n dictionary, alternates, SEO
tests/           vitest — schema, content, routing, dictionary, sitemap, 404, boundary
docs/            architecture, operations, publishing, deployment, collaboration
```

## Languages

`/` is a bilingual gateway that belongs to neither language — an explicit
choice, with no browser-language redirect. Everything else lives under `/ko` or
`/en`.

Content is `content/<collection>/<locale>/`, where the directory is the
authority on locale, and the two editions of one piece are paired by a
locale-independent `translationKey`. Slugs may differ per language, and Korean
slugs may be Hangul. An edition that does not exist never gets a URL, an
`hreflang`, or a language-switch link.

The English edition is an adaptation, not a literal translation — but the
claims, facts and judgements must match across the pair. The author is a human;
see [`AGENTS.md`](AGENTS.md) §5.

## Working on this repository

This project is maintained largely by AI coding agents working from cloud
sessions. Before making a change, read:

| File | What it covers |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | The shared constitution — rules every agent follows |
| [`CLAUDE.md`](CLAUDE.md) | Claude-specific notes and known pitfalls |
| [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) | What this project is and why it is shaped this way |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the code is put together |
| [`docs/PUBLISHING.md`](docs/PUBLISHING.md) | Content schema and the publication flow |
| [`docs/OPERATIONS.md`](docs/OPERATIONS.md) | Running the site day to day |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Vercel, domains, environment |
| [`docs/AGENT-COLLABORATION.md`](docs/AGENT-COLLABORATION.md) | How multiple agents share one repository |

Branch naming: `claude/<task>`, `codex/<task>`, `content/<slug>`, `fix/<task>`.
One task, one owner, one branch. `main` is production and a human merges.

## The two-repository boundary

| Repository | Visibility | Holds |
| --- | --- | --- |
| `convoke-space/public` | public | application, published content, docs, CI |
| `convoke-space/private` | private | drafts, research, notes, unpublished work |

**Production must be reproducible from this repository alone.** No submodules,
no build-time clone of the private repository, no runtime dependency on it.
`tests/boundary.test.ts` enforces it by parsing the lockfile for dependencies
resolved outside the public npm registry, and guards against committed
credentials with a pattern check over every tracked file.

## Licence

No open-source licence is granted. The source is public to be read, audited and
learned from; written content and design remain the author's. Ask before
reusing.
