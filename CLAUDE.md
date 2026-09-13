# CLAUDE.md — Claude-specific working notes

**Read `AGENTS.md` first.** It is the shared constitution for every agent in
this repository and it is authoritative. This file only adds what is specific
to working here as Claude; it deliberately does not repeat the rules.

## Before you start

1. Read `AGENTS.md`.
2. Read `docs/PROJECT-BRIEF.md` if you have no context on the project.
3. Check open issues and pull requests before writing code — Codex may already
   own the branch.

## Working style in this repository

- **Work autonomously.** Directory structure, component design, styling
  organisation, package choices, test layout, metadata details — decide these
  yourself and explain the reasoning in the pull request. Do not stop to ask
  about ordinary engineering decisions.
- **Finish the task.** Ending a session with "what should I do next?" is a
  failure. If part of the work is blocked on credentials or a human decision,
  complete everything else, prepare the repository for the missing step, and
  state precisely what remains.
- **One branch, one owner.** Use `claude/<task>`. Never push to a branch
  prefixed `codex/`.
- **Validate before you claim.** Run `npm run verify`. Report what you actually
  ran and what it actually said. If a check fails, say so with the output.

## Things that are easy to get wrong here

- **`next lint` does not exist** in Next 16. The lint script is `eslint .`.
- **ESLint is pinned to 9.x on purpose.** `eslint-plugin-react`, pulled in by
  `eslint-config-next`, does not yet support ESLint 10 and crashes on it. Do
  not "upgrade" it without checking that plugin.
- **`eslint-config-next` v16 exports flat configs directly.** No `FlatCompat`.
- **Frontmatter rejects unknown fields.** Adding a field to a content file
  without extending `src/lib/schema.ts` fails the build.
- **Do not hard-code the production origin.** Import from `@/lib/site`.
- **Dates are formatted in UTC** deliberately, to keep server and client output
  identical. Do not switch to local time.
- **OG images and favicons are generated** by `next/og` at build time. There are
  no binary image assets to update.

## Recording work so another agent can continue

Claude's memory does not persist and Codex cannot see this conversation.
Anything that matters goes into the repository:

- Structural decisions → `docs/ARCHITECTURE.md`
- Process changes → `docs/OPERATIONS.md` or `docs/PUBLISHING.md`
- Local reasoning → the pull request body
- Unfinished work → a GitHub issue, with enough context to resume cold

Leave the working tree clean and the commit history readable. The next session
starts with no memory of this one — write for that reader.

## Reviewing Codex's work

When reviewing rather than implementing, read the diff itself, not the summary.
Check it against `AGENTS.md` §3 (boundary), §4 (security), §8 (Definition of
Done), and the review dimensions in §10. Use the P0–P3 severities. Say plainly
when something is correct — a review that only lists problems is not more
rigorous, it is just less useful.
