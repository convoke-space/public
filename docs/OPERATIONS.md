# Operations

Day-to-day running of Convoke, from a phone or a browser, without a local
development machine.

## The normal loops

### Content publication

1. The human explicitly authorizes an exact reviewed piece in conversation.
2. The publishing-capable session reads current public/main and this repository's
   current publishing rules.
3. It applies only the intended content files to a clean current-main snapshot.
4. It runs `npm run verify` on those exact bytes.
5. It confirms main has not advanced, then commits only those content files
   directly to public/main, non-force.
6. GitHub CI and Vercel run from main. The session confirms the resulting commit
   and production URL when those signals are available.

No content PR or second merge approval is part of this normal path.

### System changes

Code, dependencies, configuration, schema, shared UI copy, repository docs, CI,
deployment rules and architecture still use:

```text
branch → PR → independent review → human merge → Vercel
```

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

See `docs/PUBLISHING.md`. Short version: after explicit human publication
authorization, validate the exact content-only change against current main and
commit it directly to main. If anything outside `content/**` must change, use
the system-change PR path.

### Per-publication checklist

- [ ] Korean edition reads as the operator, not as generic AI prose
- [ ] English edition is an adaptation, not a literal translation
- [ ] Both editions make the same claims and state the same facts
- [ ] Nothing is invented: no experience, opinion, client or credential that
      the operator has not supplied
- [ ] `translationKey` matches across the pair
- [ ] `translation` is set honestly if only one edition ships (`pending` or
      `standalone`); otherwise the tests will fail, which is the point
- [ ] Slugs read well as URLs in their own language
- [ ] `description` works as a search snippet in both languages

### Per-locale validation

Beyond `npm run verify`, check in **both** languages:

- [ ] `/ko` and `/en` render, and `/` offers both
- [ ] `<html lang>` matches the route
- [ ] the language switcher lands on the counterpart, not the section index
- [ ] a piece with no counterpart offers no link — and no `hreflang`
- [ ] navigation and footer links stay inside the reader's locale
- [ ] every unknown route returns a real 404 whose body is already in the
      response — `curl -s <url> | grep "Page not found"`, not a browser check
- [ ] `/ko/feed.xml` and `/en/feed.xml` each carry only their own language
- [ ] `/sitemap.xml` lists both locales with correct alternates
- [ ] Korean text wraps on word boundaries, not mid-word
- [ ] long titles in both scripts do not overflow at 390px

## Adding a gathering

1. Create the registration form externally (Tally, Luma, Google Forms). Convoke
   never stores attendee data.
2. Add `content/events/<slug>.mdx` with `location`, `format` and
   `registrationUrl`.
3. After explicit human publication authorization, run the normal validated
   content-only direct-main publication flow. The Gatherings link appears in
   navigation automatically once the collection is non-empty, and disappears
   again if it is emptied.

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

**A build fails on `main`.** System repairs use a branch and PR. A direct content
publication should already have passed `npm run verify` before main was updated;
if production content itself must be removed urgently, revert only the offending
content commit and then investigate the underlying failure.

**Something was published that should not have been.** Revert the content-only
commit directly, confirm the page 404s and the sitemap and feed no longer list
it. Note that the text remains in git history and may already be cached or
indexed — if the material is genuinely sensitive, treat it as disclosed and act
accordingly rather than assuming the revert undid it.

**A credential was committed.** Rotate it immediately. Deleting the file is not
sufficient: the object is still reachable in history and has very likely already
been cloned. Treat the credential as compromised, then clean history if that is
still worth doing.

## Health checks worth running occasionally

- `https://convoke.space/` offers both languages and redirects nowhere
- `https://convoke.space/ko` and `https://convoke.space/en` each render in
  their own language, with `<html lang>` to match
- `https://convoke.space/sitemap.xml` lists every published page in both
  locales, with alternates only for editions that exist
- `https://convoke.space/robots.txt` allows crawling and names the sitemap
- `https://convoke.space/ko/feed.xml` and `https://convoke.space/en/feed.xml`
  each parse, carry only their own language, and show that language's newest
  post first
- A post's `og:image` renders correctly in a social-card debugger
- Lighthouse or PageSpeed on a post page, at mobile width

## Open items for the human

These are decisions, not tasks an agent should complete on its own:

- **Public author identity.** A name or pseudonym to publish under. Until it
  exists, structured data names an Organization and no author is asserted —
  `AGENTS.md` §5.4. Do not let an agent invent one.
- **Biography.** The About page describes the publication, not a person.
- **Final tagline.** The current one is placeholder-grade in both languages and
  lives in `src/lib/i18n.ts`.
- **Visual identity.** The generated "C" mark is a placeholder; a profile image
  or wordmark is a human choice.
