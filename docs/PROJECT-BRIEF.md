# Project brief — Convoke.space

The durable statement of what this project is and why it is shaped this way.
Written so that a fresh agent session, or the author in three years, can pick it
up without any prior conversation.

## Purpose

Convoke.space is a **personal digital platform**, not a developer portfolio.

It exists to hold, over a long period:

- thinking and writing
- research synthesis
- experiments
- professional work and projects
- AI-native workflows
- gatherings
- selected public learning

The intended feel is closer to *an editorial publication plus a personal
laboratory plus a professional archive* than to a landing page. Content is
written to still be worth reading in several years, and the design is chosen to
still look credible then.

## Operating model

```
human intent (usually from a phone)
  → cloud AI agent
  → isolated task branch
  → implementation
  → pull request
  → automated validation + independent review
  → human judgment
  → merge to main
  → automatic deployment to convoke.space
```

The human sets direction, requests changes, reviews outcomes, and approves
publication. The human does **not** need a permanent local clone or a
development machine. GitHub is the source of truth; cloud agents are disposable
execution environments; Vercel is the runtime.

## The two-repository architecture

| Repository | Visibility | Holds |
| --- | --- | --- |
| `convoke-space/public` | public | the application, published content, design system, agent rules, docs, CI |
| `convoke-space/private` | private | drafts, research, raw notes, unpublished work, planning |

**Architectural invariant:** production must be reproducible from
`convoke-space/public` alone. No submodules, no build-time clone of the private
repository, no runtime dependency on it, no hidden synchronisation.

Material becomes public only through an explicit promotion: review, edit,
sanitize, promote, pull request, validation, merge. Promotion produces a clean
publishable artifact — it is never a copy.

Why this and not one repository with a `drafts/` folder: the boundary makes the
private workspace genuinely safe to be messy, and forces a moment of
publication judgment that a `draft: true` flag never does.

## Design principles

Prioritise typography, readability, information hierarchy, restraint,
whitespace, mobile quality, speed, accessibility, durability, clear navigation,
content longevity.

Avoid excessive animation, gratuitous gradients, generic AI-startup aesthetics,
card overload, unnecessary dashboards, decorative complexity.

Concretely, as built: system font stacks (no web fonts), one token palette that
swaps with the reader's colour-scheme preference, a single list primitive
reused across every section, no client-side analytics, no third-party embeds.

## Information architecture

Home · Writing · Projects · About · Gatherings.

A section with no meaningful content stays latent rather than shipping an empty
destination — navigation only advertises collections that hold something. Home
communicates what Convoke is and where the recent work is, before any
biography.

## Technology direction

Next.js (App Router), React, TypeScript, Tailwind CSS, MDX content on disk,
GitHub, Vercel.

Conservative dependencies. Prefer built-in platform capability. Follow YAGNI:
no database, authentication, CMS, comments, newsletter backend, membership, or
attendee database until a real requirement exists. Do not architect in a way
that blocks adding them later; do not pre-build them.

## Events and gatherings

Convoke is the public presentation layer for gatherings. Registration is
handled by an external provider (Tally, Luma, a form) and linked from the event
page. **No attendee personal information is stored in either repository.** A
database-backed registration system would only be justified by an actual
requirement.

## Security posture

`convoke-space/public` is permanently public — assume anything committed is
indexed immediately and cannot be recalled. No credentials, no personal contact
information, no third-party confidential material, no attendee or customer
data. A secret that reaches git history is compromised, not merely deletable.

## Multi-agent operation

Two independent agent families (Claude and ChatGPT/Codex) maintain the
repositories. They share no memory and cannot see each other's reasoning.
Everything that matters therefore lives in GitHub: issues, branches, commits,
pull requests, review comments, documented decisions, CI results.

Implementer and reviewer should be different agents where practical. A human
merges to `main` — two models agreeing is not a control.

## What "done" means

Dependencies install, lint passes, typecheck passes, tests pass, the production
build succeeds, navigation works, layouts are coherent on mobile and desktop,
metadata and sitemap are valid, no secrets or private material are present,
documentation matches the implementation, and the working tree is clean.

## Deliberate omissions

Recorded so nobody re-litigates them by accident:

- **No web fonts** — durability and speed over a bespoke typeface.
- **No syntax highlighting** — would add a large dependency; code blocks are
  styled plainly. Revisit only if the writing demands it.
- **No analytics** — nothing about readers is collected.
- **No schema-validation library** — the frontmatter validator is ~200 lines of
  dependency-free, tested code.
- **No `cover` image field** — social cards are generated from titles instead.
- **No personal biography on the About page** — the platform describes itself;
  the byline is the owner's to write.
