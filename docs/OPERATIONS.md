# Operations

Day-to-day running of Convoke, from a phone or a browser, without a local
development machine.

## The normal loop

1. The human describes what they want, in conversation, to whichever agent is
   at hand.
2. The agent opens a cloud session against `convoke-space/public`, reads
   `AGENTS.md`, and works on a task branch.
3. The agent runs `npm run verify` and opens a pull request explaining the
   reasoning.
4. CI runs the same four checks. A second agent may review independently.
5. The human reads the pull request and merges.
6. Vercel deploys `main` to `https://convoke.space`.

No step requires a specific machine. If a change ever depends on one, that is a
bug in the process.

## Commands

```bash
npm ci            # install exactly what the lockfile says
npm run dev       # local dev server, if a machine happens to be available
npm run lint      # eslint
npm run typecheck # next typegen && tsc --noEmit
npm test          # vitest
npm run build     # production build
npm run verify    # all four, in order — this is the gate
```

CI runs precisely these. A green local `verify` means a green CI run, barring
platform differences.

## Adding content

See `docs/PUBLISHING.md`. Short version: a file in `content/<collection>/`, a
branch named `content/<slug>`, a pull request.

## Adding a gathering

1. Create the registration form externally (Tally, Luma, Google Forms). Convoke
   never stores attendee data.
2. Add `content/events/<slug>.mdx` with `location`, `format` and
   `registrationUrl`.
3. Merge. The Gatherings link appears in navigation automatically once the
   collection is non-empty, and disappears again if it is emptied.

## Dependency maintenance

Small and deliberate. Roughly quarterly, or when a security advisory lands:

1. `npm outdated`, then update in one focused pull request per concern.
2. `npm run verify`.
3. Check a page visually at mobile and desktop width — the build passing does
   not prove the layout survived a Tailwind or Next major.

Known pin: **ESLint stays on 9.x.** `eslint-plugin-react`, pulled in through
`eslint-config-next`, crashes on ESLint 10. Re-check that plugin's peer range
before bumping.

## Incidents

**The site is down.** Vercel status first, then the most recent deployment's
build log. Roll back to the previous successful deployment from the dashboard,
then fix forward.

**A build fails on `main`.** It will fail the same way locally and in CI. Fix on
a branch and merge; do not push directly to `main`.

**Something was published that should not have been.** Revert the content
commit, merge, and confirm the page 404s and the sitemap and feed no longer list
it. Note that the text remains in git history and may already be cached or
indexed — if the material is genuinely sensitive, treat it as disclosed and act
accordingly rather than assuming the revert undid it.

**A credential was committed.** Rotate it immediately. Deleting the file is not
sufficient: the object is still reachable in history and has very likely already
been cloned. Treat the credential as compromised, then clean history if that is
still worth doing.

## Health checks worth running occasionally

- `https://convoke.space/sitemap.xml` lists every published page and nothing else
- `https://convoke.space/robots.txt` allows crawling and names the sitemap
- `https://convoke.space/feed.xml` parses and shows the newest post first
- A post's `og:image` renders correctly in a social-card debugger
- Lighthouse or PageSpeed on a post page, at mobile width

## Open item for the human

The About page describes the platform, not a person. A personal byline —
who is behind Convoke, and what they work on — is the owner's to write. Until
then `siteConfig.author` is intentionally generic, and the site reads as a
publication rather than a personal profile.
