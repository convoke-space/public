# AGENTS.md — Convoke shared agent constitution

This file governs every AI coding agent that works in `convoke-space/public`,
regardless of vendor. Read it before making a change. If something here
contradicts a conversation, this file wins — conversations are not durable,
this repository is.

The private counterpart lives at `convoke-space/private/AGENTS.md` and governs
private working material.

---

## 1. What this project is

Convoke.space is a personal digital platform: an editorial archive of writing,
projects, and gatherings. It is not a portfolio template, not a SaaS landing
page, and not a blog engine to be generalised.

It is operated as an **AI-native software system**: a human sets direction from
a phone or a browser, cloud agents implement against GitHub, automated checks
validate, and a human merges. There is no permanent development machine in the
loop. The repository is the durable state; agents are disposable.

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

`tests/boundary.test.ts` enforces the mechanical parts of this. A failure there
means the architecture broke, not that the test is wrong.

Material becomes public through an explicit promotion:

```
private → review → edit → sanitize → promote → public → PR → CI → merge → deploy
```

See `docs/PUBLISHING.md`.

## 4. Security rules

Never commit to `convoke-space/public`:

- API keys, tokens, passwords, OAuth secrets, service-role credentials
- Personal contact information (own or anyone else's)
- Event attendee data, customer data, or anything identifying a private person
- Employer, client or third-party confidential material
- Unpublished commercial information
- Private notes or unsanitised drafts

Use environment variables when credentials become necessary. Commit
`.env.example` **only** when environment variables actually exist, and never
with real values. `.env` and `.env.*` are gitignored; keep them that way.

If a secret may have entered git history, deleting the file is **not**
sufficient. Treat the credential as compromised: rotate it, then tell the human.

## 5. Technology and dependency policy

Current stack: Next.js (App Router), React, TypeScript, Tailwind CSS, MDX
content on disk, deployed on Vercel.

- **YAGNI.** Do not add infrastructure for a requirement that does not exist.
  Specifically not now: database, authentication, user accounts, CMS, comments,
  newsletter backend, paid membership, attendee database, analytics stack.
- **Prefer the platform.** If Next.js, the web platform, or twenty lines of
  local code will do it, do not add a package.
- Every dependency is a maintenance liability for the lifetime of the site.
  Justify additions in the pull request.
- Do not architect in a way that *prevents* those future capabilities. Just do
  not pre-build them.

## 6. Code conventions

- TypeScript everywhere, `strict` on. No `any` without a comment explaining why.
- Path alias `@/*` resolves to `src/*`.
- Server Components by default. Add `"use client"` only when a component needs
  browser state or events.
- Site origin, name and navigation live in `site.config.ts`. **Never hard-code
  `https://convoke.space`** anywhere else — import from `@/lib/site`.
- Colours, type scale and spacing come from the tokens in
  `src/app/globals.css`. Do not introduce ad-hoc hex values in components.
- Comments explain *why*, not *what*. Match the density of the surrounding code.
- No web fonts, no third-party scripts, no trackers, no embeds. This is a
  product decision, not an oversight.

## 7. Content conventions

Published content lives in `content/` as `.mdx`:

```
content/posts/      → /writing/<slug>
content/projects/   → /projects/<slug>
content/events/     → /gatherings/<slug>
```

- Filename is the slug. Lowercase kebab-case, no dates in the filename.
- Frontmatter is validated by `src/lib/schema.ts`. **Unknown fields fail the
  build.** To add a field: extend the schema, document it in
  `docs/PUBLISHING.md`, extend `tests/schema.test.ts`.
- `draft: true` keeps an entry out of listings, routes, sitemap and feed. It is
  a staging tool, not a privacy mechanism — the file is still public.
- Every internal link must resolve; `tests/content.test.ts` checks this.

Full schema reference: `docs/PUBLISHING.md`.

## 8. Validation — the Definition of Done

A change is done when **all** of these pass locally and in CI:

```bash
npm run lint        # eslint
npm run typecheck   # next typegen && tsc --noEmit
npm test            # vitest
npm run build       # next build (production)
```

`npm run verify` runs all four in order.

Beyond the commands, a change is not done until:

- Affected pages were checked at mobile width (~390px) and desktop
- No secrets, personal data or private material were added
- Production still builds from `convoke-space/public` alone
- Documentation matches what the code now does
- This file still describes reality
- The working tree is clean and the commit history is understandable

**Do not equate file creation with completion.** Run the commands.

## 9. Branches and pull requests

One task, one owner, one branch. Two agents must never work on the same branch.

```
claude/<task>     work owned by Claude
codex/<task>      work owned by ChatGPT/Codex
content/<slug>    a publication
fix/<task>        a repair
```

Pull requests:

- Prefer a PR over a direct push to `main`, always.
- Describe the reasoning, not just the diff. The PR body is the handoff to
  whichever agent reads it next.
- Keep the PR to one concern. Do not widen scope opportunistically.
- State exactly which validation you ran.

`main` is production. During the early operating period, a human merges.
**Two language models agreeing with each other is not a review gate.**

## 10. Cross-agent review

Convoke is maintained by more than one agent family (Claude and
ChatGPT/Codex). They share no memory. GitHub is the only collaboration layer.

Preferred flow:

```
Issue → implementation (agent A) → PR → independent review (agent B)
      → remediation (agent A) → CI → human approval → merge
```

A reviewer inspects the implementation itself. Do not approve a summary.

Review at least: requirement coverage, regressions, runtime correctness, build
correctness, broken links, type safety, responsive behaviour, accessibility,
SEO, performance, dependency risk, security, privacy leakage, boundary
violations, unnecessary complexity, maintainability.

Severity labels: **P0** production/security/privacy/data · **P1** must fix
before merge · **P2** important, merge decision required · **P3** optional.

Do not file twenty cosmetic P3 comments to look thorough.

Details: `docs/AGENT-COLLABORATION.md`.

## 11. Recording decisions

If a decision would surprise the next agent, write it down — in the PR body for
a local choice, in `docs/ARCHITECTURE.md` for a structural one.

The test for whether something belongs in documentation is narrow: *would a
competent agent, given only this repository, plausibly do the wrong thing?* If
yes, document it. If no, let the code speak. Documentation sprawl is its own
failure mode.

## 12. Deployment

`convoke-space/public@main` → Vercel → `https://convoke.space`.

Pull requests get preview deployments. Previews set `VERCEL_ENV=preview`, which
makes `src/lib/site.ts` serve `noindex` and keep canonical URLs pointed at
production. Do not defeat that.

Details: `docs/DEPLOYMENT.md`.

## 13. When to stop and ask

Ask a human only when the work genuinely requires something an agent cannot
have: credentials, account ownership, DNS control, billing, or a decision about
what the human wants to say publicly.

Everything else — directory layout, component structure, styling organisation,
package choices, test structure, metadata details — is yours to decide. Decide
it, do it, and explain the reasoning in the PR.

When you do need a human: finish everything that does not depend on the answer
first, prepare the repository for the missing step, and state the exact action
required.
