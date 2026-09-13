# Agent collaboration

How Claude and ChatGPT/Codex work on the same repositories without sharing
memory.

## The core problem

Two agent families, no shared context, no shared conversation history, no way
to ask each other what was decided. Whatever one needs to know, the other must
have written down somewhere both can read.

There is exactly one such place: GitHub.

## What lives where

| Kind of state | Where it goes |
| --- | --- |
| Durable rules and conventions | `AGENTS.md` (per repository) |
| Vendor-specific quirks | `CLAUDE.md`, and a Codex equivalent if one is ever needed |
| Structural decisions | `docs/ARCHITECTURE.md` |
| Process | `docs/OPERATIONS.md`, `docs/PUBLISHING.md`, `docs/DEPLOYMENT.md` |
| Why this project exists | `docs/PROJECT-BRIEF.md` |
| Reasoning behind one change | the pull request body |
| Work not yet started or half-finished | a GitHub issue |
| Disagreement and correction | review comments on the pull request |
| Whether it works | CI results |

Nothing important lives in a conversation, an agent's memory feature, or a
cloud session's scratch state. All three vanish.

## Avoiding documentation sprawl

The test for writing something down is narrow: **would a competent agent, given
only this repository, plausibly do the wrong thing?** If yes, document it. If
no, let the code speak.

A rule stated in two files starts drifting immediately, and a fresh agent has
no way to tell which copy is current. `AGENTS.md` is the single source for
rules; vendor files add only what is specific to that vendor and defer to it.

## Branch ownership

One task, one owner, one branch. Two agents must never edit the same branch.

```
claude/<task>
codex/<task>
content/<slug>
fix/<task>
```

An agent that finds an existing branch or open pull request for a task does not
take it over. It comments, or picks up something else.

## Implementer and reviewer

Prefer different agents for the two roles:

```
Issue → implementation (agent A) → PR → independent review (agent B)
      → remediation (agent A) → CI → human approval → merge
```

Either family may implement; either may review. What matters is that the
reviewer inspects the actual diff rather than accepting the implementer's
summary. An agent reviewing its own work checks the failure modes it was
already thinking about, which is exactly the set that does not need checking.

## Review standard

Cover, at minimum: requirement coverage, regressions, runtime correctness,
build correctness, broken links, type safety, responsive behaviour,
accessibility, SEO, performance, dependency risk, security, privacy leakage,
public/private boundary violations, unnecessary complexity, maintainability.

Severity:

| Level | Meaning |
| --- | --- |
| **P0** | Critical production, security, privacy or data issue |
| **P1** | Must fix before merge |
| **P2** | Important; the merge decision needs a human |
| **P3** | Optional improvement |

Do not manufacture a long tail of P3 comments to appear thorough. Say plainly
when something is right — a review that only lists problems is less useful, not
more rigorous.

## The human gate

`main` is production. During the early operating period a human merges every
meaningful change.

**Two language models agreeing with each other is not a security control.** The
cross-review catches oversights and regressions. It does not decide whether a
change should exist, or whether something should be said publicly. That is the
human's call.

## Test for whether this is working

Open a fresh session with no context, point it at the repository, and ask for a
small end-to-end change. It should read `AGENTS.md`, pick a correctly named
branch, respect the boundary, run `npm run verify`, and open a pull request
that explains itself.

If it asks you to re-explain the project, the fix is not a better prompt. The
fix is a commit.
