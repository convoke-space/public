# Architecture

How `convoke-space/public` is put together, and why. Structural decisions that
would surprise a fresh agent belong here.

## Shape of the repository

```
site.config.ts          origin, locales, navigation  (single source of truth)
next.config.ts
content/
  posts/{ko,en}/        → /<locale>/writing/<slug>
  projects/{ko,en}/     → /<locale>/projects/<slug>
  events/{ko,en}/       → /<locale>/gatherings/<slug>
src/
  app/
    (gateway)/          the locale-neutral `/` and the root 404
    [locale]/           every localized route, plus the per-locale RSS feed
    sitemap.ts robots.ts icon.tsx apple-icon.tsx globals.css
  components/           presentational building blocks
  lib/
    content.ts          locale-aware filesystem content layer
    schema.ts           frontmatter validation
    i18n.ts             typed UI dictionary
    alternates.ts       hreflang + language-switch targets, computed once
    navigation.ts       which sections exist in which locale
    seo.ts              metadata + JSON-LD builders
    site.ts             origin resolution and locale paths
    format.ts           locale-aware date formatting
    og.tsx              shared social-card layout
tests/                  vitest, with bilingual fixtures under tests/fixtures/
docs/
.github/workflows/ci.yml
```

## Locale routing

Routes are explicit: `/ko/...` and `/en/...`. There is no i18n framework — a
`[locale]` segment, a typed dictionary, and `localePath()` are the whole
mechanism.

### Two root layouts, on purpose

`app/(gateway)/layout.tsx` and `app/[locale]/layout.tsx` are **both** root
layouts. A single shared root layout cannot set `<html lang>` per route,
because a layout only sees its own segment's params — and a middleware redirect
would make `/` non-deterministic. Two root layouts is the supported way to get a
correct `lang` on every route with no middleware at all.

The cost is a full page load when navigating between `/` and a locale. That
happens once, on entry.

### `/` is a gateway, not a language

`/` belongs to neither language. It offers an explicit choice and nothing else:

- deterministic for readers, bots and `x-default` alike
- no browser-language sniffing, so there is no wrong guess to undo
- the document is `lang="ko"` (the authoring language) with the English half
  carrying its own `lang="en"`

A remembered preference could be layered on later without changing this
contract.

### Unknown locales and unknown paths

`app/[locale]/layout.tsx` keeps `dynamicParams = true` so an unsupported prefix
such as `/fr` still reaches a page that can 404 properly. The layout itself must
**not** call `notFound()`: a layout that throws is the one that would have
contained the boundary, and Next then has nothing to render it in
(`NoFallbackError`). It renders a document shell for the default locale instead,
and the page below it 404s.

Inside a valid locale, `app/[locale]/[...rest]/page.tsx` catches anything
unmatched, and `dynamicParams = false` on each `[slug]` route turns an unknown
slug into a 404 as well. Every one of those paths ends in the same boundary:
`app/[locale]/not-found.tsx`.

### What a not-found boundary can and cannot do

Three constraints were established empirically against Next 16, and the 404 is
built around them. Do not "simplify" past them without re-testing:

1. **A not-found boundary renders outside the root layout.** There is no
   `<html lang>`, no header, no footer, and the layout's stylesheet is not
   linked — including when there is only one root layout, so this is not a cost
   of the gateway split.
2. **A Client Component inside the boundary fails to render at all**
   (`NoFallbackError`), so `usePathname()` is not available to detect the
   locale.
3. **No request header carries the path**, so a Server Component cannot derive
   it either.

`src/lib/request-locale.ts` closes the gap: a `React.cache` store, which is
request-scoped in the RSC runtime, lets the locale layout record the locale it
matched and lets the 404 read it back. A `null` value means the prefix was not a
supported locale, and the 404 falls back to offering both languages rather than
guessing.

The 404 therefore carries its own `lang` attribute and its own inline
stylesheet. Those token values are the only duplicate of `src/app/globals.css`
in the codebase, and the file says so.

One residual limitation, worth knowing and not worth fighting: Next streams the
not-found tree as flight data inside its own error document, so a 404 body is
**client-rendered**. The status code is correct for crawlers, which is what a
404 is judged on; the localized content is for humans.

### Header placement

The header is rendered by each page through `PageShell`, not by the layout.
The language switcher's target depends on the page — a section maps to the same
section, an article maps to its counterpart — and a layout cannot look that up
for a segment below it. Rendering the header in the page is the price of a
switcher that always lands on the right page.

## Content layer

`src/lib/content.ts` is the only module that touches the filesystem;
`src/lib/schema.ts` is the only module that reads raw frontmatter. Pages consume
typed entries and never see a `Record<string, unknown>`.

Content is `content/<collection>/<locale>/<slug>.mdx`. **The directory is the
authority on locale.** A `locale` frontmatter field is rejected by validation —
two sources of truth for one fact is how drift starts.

Rules the loader enforces, all of which fail the build:

- filenames are lowercase kebab-case; Hangul is allowed, so Korean pieces get
  Korean URLs
- slugs are unique within a collection **and locale**
- `translationKey` is unique within a collection and locale
- frontmatter validates, with every problem in a file reported at once
- unknown frontmatter fields are rejected
- the body is not empty
- an unsupported locale throws `UnsupportedLocaleError` rather than returning
  an empty list, so a typo cannot masquerade as "no content"

Every loader function takes an optional `root`, which is how the tests point at
fixtures instead of the real archive. Results are memoised per `(root,
collection, locale)`.

### Translation pairing

`translationKey` is locale-independent and shared by the two editions of one
piece; slugs may differ. `getCounterpart()` resolves across it and goes through
the *published* index in every case — including the entry's own locale — so a
draft has no counterpart anywhere and can never acquire an `hreflang` or a
switcher link.

`findTranslationProblems()` checks the declared `translation` state against what
is actually published, in both directions. The rule is one sentence rather than
a state machine:

- a `translationKey` published in more than one locale must be `paired`
  everywhere;
- a `translationKey` published in exactly one locale must be `pending` or
  `standalone` there.

That covers every contradiction worth catching — `paired` with no counterpart,
`pending` or `standalone` once the counterpart is live, a pair whose two sides
disagree, and two published editions that both claim to stand alone.
`tests/content.test.ts` asserts the list is empty, which is what separates an
oversight from a deliberate partial publication.

### Why a hand-written validator

A schema library would be one more dependency to keep current for the lifetime
of the site, and the requirement is small. `src/lib/schema.ts` is
dependency-free and covered by `tests/schema.test.ts`. Revisit only if the
schema starts growing conditional logic.

## Localized UI

`src/lib/i18n.ts` holds a typed `Dictionary` with one object per locale.
TypeScript guarantees both locales define every key; `tests/i18n-dictionary.test.ts`
covers what it cannot — a key left in the wrong language, or left empty.

No user-facing string is hard-coded in a component. Content copy never lives in
the dictionary; that is chrome only.

## Design system

Tokens live in `src/app/globals.css`, defined once on `:root` and redefined
under `prefers-color-scheme: dark`. Tailwind's `@theme inline` maps them to
utility names (`bg-surface`, `text-muted`, `border-rule`), so components refer
to semantic roles and the whole palette can be retuned in one file. Components
must not introduce raw hex values.

Typography uses only faces the reader's operating system already has. Korean
families are **appended to** the Latin stacks rather than switched on `:lang()`:
font fallback is per-glyph, so Latin takes the serif or sans face and Hangul
falls through to the first Korean family present. One stack, both scripts, no
web fonts.

`:lang(ko)` adds what Korean actually needs: `word-break: keep-all` (the default
shreds Korean mid-word), slightly looser leading for the taller Hangul glyph
box, and tighter heading tracking.

The `.prose` class is hand-written rather than supplied by a typography plugin.
The vertical rhythm of the reading surface is the product here, and it is small
enough to own outright.

## SEO and metadata

- `src/lib/seo.ts` builds all page metadata. Pages never construct their own
  Open Graph tags.
- `src/lib/alternates.ts` computes hreflang alternates and language-switch
  targets from the same function, so the two can never disagree — and neither
  can name an edition that does not exist.
- `src/lib/site.ts` resolves the origin: an explicit `NEXT_PUBLIC_SITE_URL`
  override, else the Vercel preview URL, else the canonical origin.
  **Canonical URLs always point at production**, so a preview never competes
  with the real site in search.
- `encodePath()` percent-encodes every segment, because Hangul slugs must be
  encoded in a sitemap, a feed and a `rel=canonical`. `next/link` encodes the
  same way, so a raw path and an encoded URL resolve to one route.
- Preview deployments (`VERCEL_ENV !== "production"`) serve `noindex` and a
  `Disallow: /` robots file.
- `x-default` points at `/` for the home set only. An article has no
  locale-neutral URL, so it gets no `x-default`.
- Open Graph carries `ko_KR` / `en_US` and names the alternate locale only when
  that edition exists.
- Structured data: `WebSite` on home, `Article` on posts, `Event` on gatherings,
  `BreadcrumbList` on every detail page — each with `inLanguage` and a localized
  headline, description and URL.
- **No `author` is asserted anywhere.** Convoke publishes as an Organization
  until the operator settles a public author identity. See `AGENTS.md` §5.4.
- One sitemap covers both languages, each URL carrying `alternates.languages`
  for the editions that exist.
- One RSS feed per locale, at `/<locale>/feed.xml`, containing only that
  language's Writing.
- Social cards, the favicon and the Apple touch icon are generated by `next/og`
  at build time. There are no binary image assets in the repository.

## Rendering model

Everything is statically generated at build time. Content is read from disk with
`fs`, so there is no request-time data source, no database, and nothing to fail
at runtime. `generateStaticParams` plus `dynamicParams = false` means an unknown
slug is a 404 rather than an on-demand render. The only dynamic route is the
in-locale catch-all, which exists solely to 404.

`outputFileTracingIncludes` keeps `content/**` in the serverless output so the
site still renders correctly if a route ever becomes dynamic.

## Accessibility

Semantic landmarks, a localized skip link, one `h1` per page with a contiguous
heading order, `aria-current` on the active nav item and on the current
language, visible focus rings via `:focus-visible`, `prefers-reduced-motion`
honoured, and a palette checked for WCAG AA contrast in both themes.

The language switcher announces the current language rather than linking it, and
renders an unavailable edition as plain text with an accessible explanation —
never as a link that would 404.

## Testing

`vitest`, seven suites, no browser needed:

| Suite | What it protects |
| --- | --- |
| `schema.test.ts` | frontmatter rules, translationKey, date ordering, slug patterns |
| `content.test.ts` | locale loading, pairing, drafts, ordering, the real archive |
| `i18n-routing.test.ts` | locale guard, path encoding, hreflang, canonical, switch targets |
| `i18n-dictionary.test.ts` | both dictionaries complete, and actually in their own language |
| `sitemap-feed.test.ts` | bilingual sitemap, alternate targets, per-locale RSS |
| `site.test.ts` | origin resolution across local, preview and production |
| `boundary.test.ts` | dependency-boundary checks on package.json and the lockfile, a credential-pattern guard, no submodules |

Bilingual fixtures live in `tests/fixtures/`, covering a paired entry with
differing slugs, a Hangul slug, `pending` and `standalone` editions, an
accidentally unpaired entry, a draft, a duplicate `translationKey` and an
invalid filename.

`boundary.test.ts` is an architecture test, and it is two things rather than
one:

- A **structural dependency-boundary check**. It parses `package.json` and
  `package-lock.json` — both the modern `packages` shape and the legacy
  `dependencies` shape — and rejects any package resolved from a git URL, a
  local path, a symlink, a `convoke-space` URL, or any host other than
  `registry.npmjs.org`. That is the realistic way production would come to
  depend on the private repository or on one machine. Negative fixtures prove
  each case is actually caught.
- A **pattern-based credential guard** over every file `git` reports as tracked
  or newly added, matching a fixed list of well-known credential shapes. It is
  deliberately not described as a secret scanner: it will not catch a secret in
  an unrecognised format, and it does not replace GitHub secret scanning. The
  lockfile is excluded from this half because its integrity hashes trip the
  patterns; it is covered structurally instead.

Exclusions are explicit and each carries a stated reason, which a test asserts.
When either half fails, the architecture broke — the fix is in the code, not the
test.

## Deliberate constraints

- No i18n framework, no browser-language redirect, no locale cookie.
- No client-side analytics, trackers, or third-party embeds.
- No runtime data source, so no availability risk beyond the CDN.
- No syntax highlighting: a large dependency for a small benefit today.
- No `dangerouslySetInnerHTML` except in `JsonLd`, where the payload is built
  from typed inputs and `<` is escaped.

## Extension points (not built)

The architecture leaves room for these without pre-building them: a third
locale (add it to `LOCALES`, the dictionary and a content directory — the type
system will list every remaining edit), a remembered locale preference on `/`, a
database behind the content layer's interface, authentication as route-group
middleware, and a registration backend behind the event page's external link.
