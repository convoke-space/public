# AGENTS.md — Convoke shared agent constitution

This file governs every AI coding agent that works in `convoke-space/public`,
regardless of vendor. Read it before making a change. If something here
contradicts a conversation, this file wins — conversations are not durable,
this repository is.

The private counterpart lives at `convoke-space/private/AGENTS.md` and governs
private working material.

---

## 1. What this project is

Convoke.space is a **bilingual personal publication**: an editorial archive of
writing, projects and gatherings, published in Korean and English as equals. It
is not a portfolio template, not a SaaS landing page, and not a blog engine to
be generalised.

It is operated as an **AI-native software system**: a human sets direction from
a phone or a browser, cloud agents work against GitHub, and automated checks
validate. System changes end in a human merge; an explicitly authorized,
independently reviewed content-only publication may be validated and committed
directly to `main`. There is no permanent development machine in the loop. The repository is the durable state; agents are disposable.

Two consequences follow, and they drive nearly every rule below:

1. **The repository must explain itself.** Anything a fresh session needs must
   be committed, not remembered.
2. **Nothing may depend on a specific laptop, a persistent local checkout, or a
   previous conversation.**

## 2. Canonical identity

| Thing | Value |
| --- | --- |
| GitHub owner | `convoke-space` |
| Public repository | `convoke-space/public` |
| Private repository | `convoke-space/private` |
| Production domain | `https://convoke.space` |
| Production branch | `main` |
| Host | Vercel, deploying `convoke-space/public@main` |
| Locales | `ko` (authoring language), `en` |

Always use the full repository names. The bare words "public" and "private" are
ambiguous with GitHub visibility settings.

Never rename or replace either repository.

## 3. The public/private boundary

**`convoke-space/public` is permanently, irrevocably public.** Assume every
commit is indexed the moment it is pushed.

**`convoke-space/private` is private by default.** Drafts, research, raw notes,
unpublished work.

The invariant, stated as a build property:

> A clean machine with access to **only** `convoke-space/public` must be able to
> run `npm ci && npm run build` and produce the production site.

Therefore the following are forbidden, without exception:

- Git submodules pointing at `convoke-space/private`
- Cloning or fetching the private repository during build or at runtime
- Build tokens whose purpose is to reach private content
- Any content synchronisation that production depends on

`tests/boundary.test.ts` enforces the mechanical parts of this two ways: it
parses `package.json` and `package-lock.json` and rejects any dependency
resolved from a git URL, a local path or a host other than the public npm
registry, and it runs a credential-pattern guard over every file `git` reports
as tracked or newly added. The second half matches known credential shapes, not
arbitrary secrets — it is a guard, not a secret scanner. A failure in either
means the architecture broke, not that the test is wrong.

Material becomes public through an explicit promotion. See `docs/PUBLISHING.md`.

## 4. Security rules

Never commit to `convoke-space/public`:

- API keys, tokens, passwords, OAuth secrets, service-role credentials
- Personal contact information (the operator's own, or anyone else's)
- Event attendee data, customer data, or anything identifying a private person
- Employer, client or third-party confidential material
- Unpublished commercial information
- Private notes or unsanitised drafts

Use environment variables when credentials become necessary. Commit
`.env.example` **only** when environment variables actually exist, and never
with real values. `.env` and `.env.*` are gitignored; keep them that way.

If a secret may have entered git history, deleting the file is **not**
sufficient. Treat the credential as compromised: rotate it, then tell the human.

## 5. Language, authorship and voice

This section is not a style preference. It is the product.

### 5.1 Two first-class languages

Korean and English are equals. Neither is a translation target bolted onto the
other; both are published editions with their own URLs, feeds, metadata and
navigation.

The operator's authoring language is **Korean**. The normal direction of travel
is Korean first, English adapted after.

### 5.2 The English edition is an adaptation, not a translation

The English edition must read as though it had been written in English from the
start — its own rhythm, its own examples where a Korean-specific reference would
not land, its own idiom.

What it may **not** do is diverge. Across the pair, these must match:

- the central claim
- every fact and number
- the experience being described
- the judgement being made

Changing an argument in translation is a content bug, not an editorial liberty.

### 5.3 The human is the author

The operator is the intellectual owner of everything published. An AI agent's
role is:

- **editor** — structure, clarity, cuts
- **researcher** — finding and checking sources
- **translator** — adapting between editions
- **challenger** — arguing against a weak claim

An agent is **not** the author. Concretely, never:

- invent the operator's personal experience, anecdotes, habits or routines
- attribute an opinion or judgement the operator has not expressed
- invent a client story, a company situation, or a conversation
- state that something is live, shipped, used in production or adopted unless
  it verifiably is
- write a biography, a byline, a job history or a credential

When a piece needs a fact only the operator has, ask — do not fill the gap.

### 5.4 No published author identity yet

The operator has not settled a public author name or byline. Until they do:

- structured data names an **Organization** (`siteConfig.publisher`), not a
  `Person`
- no `author` is asserted in metadata or JSON-LD
- no name, pseudonym, biography or photograph is invented

Do not "fix" this by inventing an identity. It is a human decision.

### 5.5 Generic AI prose is a defect

Avoid, in both languages:

- cliché openings that restate the title
- excessive "not X, but Y" constructions
- a summary paragraph that repeats what was just said
- generic motivational conclusions
- grand claims with nothing under them
- LinkedIn-register exaggeration
- invented personal experience
- artificially polished corporate voice

An agent may improve clarity, structure and correctness. It must preserve the
human's actual judgement, including the parts that are blunt, uncertain or
unfashionable.

## 6. Technology and dependency policy

Current stack: Next.js (App Router), React, TypeScript, Tailwind CSS, MDX
content on disk, deployed on Vercel.

- **YAGNI.** Do not add infrastructure for a requirement that does not exist.
  Specifically not now: database, authentication, user accounts, CMS, comments,
  newsletter backend, paid membership, attendee database, analytics stack.
- **No i18n framework.** Two locales, a `[locale]` route segment, and a typed
  dictionary in `src/lib/i18n.ts`. That is the whole mechanism; keep it.
- **Prefer the platform.** If Next.js, the web platform, or twenty lines of
  local code will do it, do not add a package.
- Every dependency is a maintenance liability for the lifetime of the site.
  Justify additions in the pull request.
- Do not architect in a way that *prevents* those future capabilities. Just do
  not pre-build them.

## 7. Code conventions

- TypeScript everywhere, `strict` on. No `any` without a comment explaining why.
- Path alias `@/*` resolves to `src/*`.
- Server Components by default. Add `"use client"` only when a component needs
  browser state or events.
- Site origin, locales and navigation live in `site.config.ts`. **Never
  hard-code `https://convoke.space`** anywhere else — import from `@/lib/site`.
- **Never hard-code user-facing copy in a component.** It belongs in
  `src/lib/i18n.ts`, where TypeScript guarantees both locales define it.
- **Never pass request state through a mutable store.** No `React.cache`
  write-then-read between components, no module-level variable holding
  something about the current request, no correctness that depends on render
  order. If a value is hard to reach, change the design instead. (Ordinary
  `React.cache` memoisation of a pure function is fine.)
- Build every internal link with `localePath(locale, path)` so it stays inside
  the reader's language.
- Colours, type scale and spacing come from the tokens in
  `src/app/globals.css`. Do not introduce ad-hoc hex values in components.
- Comments explain *why*, not *what*. Match the density of the surrounding code.
- No web fonts, no third-party scripts, no trackers, no embeds. This is a
  product decision, not an oversight.

Code, comments and repository documentation are written in English, for
technical consistency. Reader-facing copy is bilingual.

## 8. Content conventions

Published content lives in `content/<collection>/<locale>/` as `.mdx`:

```
content/posts/ko/      → /ko/writing/<slug>
content/posts/en/      → /en/writing/<slug>
content/projects/ko/   → /ko/projects/<slug>
content/events/en/     → /en/gatherings/<slug>
```

- **The directory is the authority on locale.** There is no `locale`
  frontmatter field, and adding one fails validation. Two sources of truth for
  one fact is how drift starts.
- Filename is the slug. Lowercase kebab-case; Hangul is allowed, so a Korean
  piece gets a Korean URL. Slugs may differ between the two editions.
- **`translationKey` is required and pairs the editions.** It is
  locale-independent ASCII kebab-case, identical across the pair, unique within
  a collection and locale. The language switcher, hreflang and the sitemap's
  alternates are all built on it.
- `translation:` declares intent when an edition is missing: `paired` (the
  default, and checked by the tests), `pending` (the other edition is being
  adapted), `standalone` (single-language on purpose). This is what separates a
  deliberate partial publication from an oversight.
- **Never generate a URL or an hreflang for an edition that does not exist.**
- `draft: true` keeps an entry out of listings, routes, sitemap and feed. It is
  a staging tool, not a privacy mechanism — the file is still public.
- **Normal content is locale-specific; the error surface is not.** Every
  unmatched route resolves to one bilingual, server-rendered 404
  (`src/app/global-not-found.tsx`). Do not make it follow the route's locale:
  every way to do that reintroduces per-request state or a hydration
  dependency, and an error page is not worth either.
- Frontmatter is validated by `src/lib/schema.ts`. **Unknown fields fail the
  build.** To add a field: extend the schema, document it in
  `docs/PUBLISHING.md`, extend `tests/schema.test.ts`.

Full schema reference and the publication workflow: `docs/PUBLISHING.md`.

## 9. Validation — the Definition of Done

A change is done when **all** of these pass locally and in CI:

```bash
npm run lint        # eslint
npm run typecheck   # next typegen && tsc --noEmit
npm test            # vitest
npm run build       # next build (production)
npm run verify:http # raw HTTP against a real production server
```

`npm run verify` runs all five in order.

**A browser test is not proof that a page works.** Anything that renders only
after hydration looks correct in Playwright and is an empty document to `curl`
and to a crawler. Server-rendered output is checked on the raw response — that
is what `verify:http` is for.

Beyond the commands, a change is not done until:

- Affected pages were checked **in both languages**, at mobile width (~390px)
  and desktop
- The language switcher lands on the right page, and offers no link where no
  edition exists
- `<html lang>` matches the route
- No secrets, personal data or private material were added
- Production still builds from `convoke-space/public` alone
- Documentation matches what the code now does
- This file still describes reality
- The working tree is clean and the commit history is understandable

**Do not equate file creation with completion.** Run the commands.

## 10. Branches, pull requests and the content-only exception

System work uses one task, one owner, one branch. Two agents must never work on
the same branch.

```
claude/<task>     work owned by Claude
codex/<task>      work owned by ChatGPT/Codex
fix/<task>        a repair
```

For **code, dependencies, configuration, schema, shared UI copy, repository
documentation, CI, deployment rules or architecture**, always use:

```
branch → pull request → independent review → human merge
```

Describe the reasoning, keep the PR to one concern, and state exactly which
validation ran.

### Content-only direct publication

A narrow exception exists for an exact content candidate that already passed the
private Content OS review/verification gates and that the human explicitly
authorizes with a publication command such as `공개 진행해`.

That publication may commit directly to `main` only when **all** of these hold:

- every changed path is under `content/posts/`, `content/projects/` or
  `content/events/`;
- the prose is the exact reviewed candidate, apart from mechanical frontmatter,
  locale pairing, slug and metadata packaging allowed by the current publishing
  contract;
- no substantive claim, experience, judgement or argument is added or changed;
- the full `npm run verify` passes on the exact intended bytes against current
  `main`;
- the publisher confirms `main` has not changed since that validated snapshot;
- the commit is non-force and contains no code, docs, config, dependency or CI
  change;
- the resulting `main` commit and published blob hashes are fetched and
  confirmed after the write.

The human's explicit publication command is the final content publication
authorization. Do not require a second PR/merge ceremony for that content-only
case. If any condition above fails, stop and use the system-change PR path.

`main` is production. Direct content publication is therefore intentionally
narrow and must be fully validated before the commit.

## Code Review Rules

These are the repository-wide rules for Codex Code Review on GitHub.

For system changes, GitHub Codex Code Review is the normal independent review
surface. When automatic review is enabled for this repository, an ordinary pull
request should not require a second manual Codex Cloud review. Use `@codex review`
for a rerun or a focused extra pass when needed. A separate deep Cloud review is
reserved for exceptional investigation, not duplicated on every PR.

### High-impact public-repository invariants

- **Public/private boundary:** flag any change that introduces a build-time or
  runtime dependency on `convoke-space/private`, copies private drafts/research
  into this repository, weakens boundary tests, or risks exposing credentials,
  personal data, attendee/customer data, employer/client confidential material,
  or unpublished commercial information.
- **Production correctness:** flag realistic regressions that can break the
  production build, deployment, routing, server rendering, raw HTTP output,
  sitemap/feed generation, metadata, or canonical URL behavior.
- **Request-state safety:** flag mutable request state, render-order dependency,
  or cross-request leakage, including module-level request data or unsafe
  write-then-read caching patterns.
- **Locale integrity:** flag changes that can send readers to the wrong locale,
  emit the wrong `<html lang>`, create broken or invented hreflang/canonical
  relationships, expose a language-switch target for a missing edition, or
  hard-code locale-sensitive links outside the established helpers.
- **Bilingual content integrity:** when content or reader-facing copy changes,
  flag divergence in central claim, facts, numbers, described experience, or
  judgement between Korean and English editions. Also flag invented experience,
  opinions, clients, credentials, adoption claims, or an invented author identity.
- **Schema and publishing contract:** flag changes that bypass frontmatter
  validation, weaken translation pairing, publish draft-only material, or expand
  the narrow content-only direct-publication exception into code, config, schema,
  dependency, shared UI copy, documentation, CI, or deployment changes.
- **Accessibility and SEO:** flag concrete regressions in semantic structure,
  keyboard/accessibility behavior, responsive use, metadata, crawlability,
  noindex/canonical behavior on previews, sitemap, RSS, or raw server-rendered
  output.
- **Dependency and architecture discipline:** flag unnecessary dependencies,
  infrastructure added without a real requirement, third-party scripts/trackers,
  web fonts, or changes that violate the deliberately small Next.js architecture.
- **Security and privacy:** flag realistic credential exposure, unsafe environment
  handling, sensitive information entering tracked files, or any change that
  weakens existing public-repository security guards.

### Review discipline

- Review the actual PR diff and relevant current repository state, not only the
  PR description or implementer's explanation.
- Prefer concrete, reproducible findings with a realistic execution path and
  material impact. Do not manufacture speculative edge cases or cosmetic comments
  to appear thorough.
- Do not duplicate mechanical CI output as review noise unless the PR weakens,
  bypasses, or invalidates those checks.
- Where UI or reader-visible behavior changes, inspect both locales and consider
  mobile and desktop behavior rather than reasoning from one screenshot or one route.
- Codex Code Review is the independent reviewer, not the implementer. It does not
  remediate, push implementation commits, or merge the PR.
- Human merge remains required for system/code/config/schema/shared-copy/docs/CI/
  deployment changes.

## 11. Cross-agent review

Convoke is maintained by more than one agent family (Claude and
ChatGPT/Codex). They share no memory. GitHub is the only collaboration layer.

Preferred flow for system changes:

```
Issue → implementation (agent A) → PR → independent review (agent B)
      → remediation (agent A) → CI → human approval → merge
```

For direct content publication, the substantive review happens in the private
Content OS before the explicit human publication command. Public-side packaging
must not rewrite the article. If it does, the candidate goes back through
independent content review before publication.

A reviewer inspects the implementation itself. Do not approve a summary.

Review at least: requirement coverage, regressions, runtime correctness, build
correctness, broken links, type safety, responsive behaviour, accessibility,
SEO, performance, dependency risk, security, privacy leakage, boundary
violations, unnecessary complexity, maintainability.

On any change that touches content or reader-facing copy, also review:

- **bilingual consistency** — do the two editions make the same claims?
- **human voice** — does this read as the operator, or as generic AI prose?
- **invented substance** — is any experience, opinion or fact unattributable?
- **locale integrity** — correct `<html lang>`, canonical, hreflang, feed,
  switcher target, and no link that leaves the reader's language by accident

Severity labels: **P0** production/security/privacy/data · **P1** must fix
before merge · **P2** important, merge decision required · **P3** optional.

Do not file twenty cosmetic P3 comments to look thorough.

Details: `docs/AGENT-COLLABORATION.md`.

## 12. Recording decisions

If a decision would surprise the next agent, write it down — in the PR body for
a local choice, in `docs/ARCHITECTURE.md` for a structural one.

The test for whether something belongs in documentation is narrow: *would a
competent agent, given only this repository, plausibly do the wrong thing?* If
yes, document it. If no, let the code speak. Documentation sprawl is its own
failure mode.

## 13. Deployment

`convoke-space/public@main` → Vercel → `https://convoke.space`.

Pull requests get preview deployments. Previews set `VERCEL_ENV=preview`, which
makes `src/lib/site.ts` serve `noindex` and keep canonical URLs pointed at
production. Do not defeat that.

Details: `docs/DEPLOYMENT.md`.

## 14. When to stop and ask

Ask a human only when the work genuinely requires something an agent cannot
have: credentials, account ownership, DNS control, billing, or a decision about
what the human wants to say publicly — including anything covered by §5.3 and
§5.4.

Everything else — directory layout, component structure, styling organisation,
package choices, test structure, metadata details — is yours to decide. For
system changes, decide it, do it, and explain the reasoning in the PR. For an
already authorized content-only publication, apply only the validated content
bytes and complete the direct-main publication flow.

When you do need a human: finish everything that does not depend on the answer
first, prepare the repository for the missing step, and state the exact action
required.
