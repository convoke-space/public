# Publishing

How content reaches convoke.space, in two languages, and the exact schema it
must satisfy.

## The editorial workflow

Convoke is Korean-first. The normal path for a piece is:

```
Korean idea / notes / draft        (convoke-space/private)
  → Korean editorial development
  → publishable Korean edition
  → English editorial adaptation
  → fact / privacy / tone / human-voice verification
  → convoke-space/public
  → pull request
  → cross-agent review
  → human approval
  → publish
```

Three properties of that pipeline are load-bearing:

1. **The English edition is an adaptation, not a translation.** It should read
   as though written in English from the start. It may restructure, re-pace and
   re-illustrate — but the central claim, the facts, the experience described
   and the judgement made must match the Korean edition. Changing an argument in
   adaptation is a content bug.
2. **The human is the author.** An agent edits, researches, adapts and argues
   back. It never invents the operator's experience, opinions, clients or
   credentials. See `AGENTS.md` §5.
3. **Publication is explicit.** Nothing moves from the private repository to
   the public one automatically.

## Where content lives

| Directory | Route | Collection |
| --- | --- | --- |
| `content/posts/<locale>/` | `/<locale>/writing/<slug>` | `posts` |
| `content/projects/<locale>/` | `/<locale>/projects/<slug>` | `projects` |
| `content/events/<locale>/` | `/<locale>/gatherings/<slug>` | `events` |

`<locale>` is `ko` or `en`. **The directory is the authority on locale** — there
is no `locale` frontmatter field, and adding one fails validation.

The **filename is the slug**. Lowercase kebab-case, `.mdx`, no date prefix.
Hangul is allowed, so a Korean piece can have a Korean URL:

```
content/posts/ko/깃허브를-ai의-공용기억으로-쓰기.mdx   → /ko/writing/깃허브를-ai의-공용기억으로-쓰기
content/posts/en/github-as-agent-memory.mdx        → /en/writing/github-as-agent-memory
```

The two editions may — and usually should — have different slugs.

## Pairing the two editions

`translationKey` links them. It is locale-independent, so it stays ASCII
kebab-case even when both slugs are not:

```yaml
# content/posts/ko/깃허브를-ai의-공용기억으로-쓰기.mdx
translationKey: github-agent-memory

# content/posts/en/github-as-agent-memory.mdx
translationKey: github-agent-memory
```

Rules the loader and tests enforce:

- `(collection, locale, slug)` is unique
- `(collection, locale, translationKey)` is unique
- a pair shares one collection
- a draft is never anyone's counterpart

Everything bilingual is built on this key: the language switcher, `hreflang`,
Open Graph `alternateLocale`, and the sitemap's language alternates.

## Publishing one language first

Allowed, and made explicit rather than inferred. The `translation` field says
which situation you are in:

| Value | Meaning | Required state of the other edition |
| --- | --- | --- |
| `paired` (default) | both editions are published | must exist, and must also be `paired` |
| `pending` | the other edition is being adapted | must **not** be published yet |
| `standalone` | single-language on purpose | must **not** exist |

The check runs in both directions, so these all fail `npm test`:

- `paired` with no counterpart — the ordinary oversight
- `pending` when the counterpart is already live — a stale state nobody updated
- `ko: paired` alongside `en: standalone` — the pair disagrees with itself
- both published editions marked `standalone` — they are a pair, by definition

So when you publish the second edition, update the first one's `translation`
back to `paired` (or just delete the field — `paired` is the default). Nothing
else changes: a missing edition never gets a URL, an `hreflang`, or a
language-switch link.

## Frontmatter schema

Validated by `src/lib/schema.ts`. **Unknown fields fail the build.** To add a
field: extend the schema, document it here, extend `tests/schema.test.ts`.

### Shared by every collection

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `title` | yes | string | ≤ 120 characters |
| `description` | yes | string | ≤ 200 characters — the meta description and the feed summary |
| `date` | yes | `YYYY-MM-DD` or ISO datetime | quote it, so YAML does not coerce it |
| `updated` | no | date | must not be earlier than `date` |
| `tags` | no | string[] | lowercased and de-duplicated automatically |
| `draft` | no | boolean | excluded from listings, routes, sitemap and feed |
| `translationKey` | yes | ASCII kebab-case | identical across the pair |
| `translation` | no | `paired` \| `pending` \| `standalone` | defaults to `paired` |

`draft: true` is a staging tool, **not** a privacy mechanism. The file is still
in a public repository. Anything that must not be seen belongs in
`convoke-space/private`.

### `posts`

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `canonical` | no | absolute URL | set when the piece was first published elsewhere |

### `projects`

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `status` | yes | `exploring` \| `active` \| `maintained` \| `archived` | also drives listing order |
| `url` | no | absolute URL | only when the project is publicly reachable **today** |
| `repo` | no | absolute URL | source |

Do not set `url` for something that is not live yet. Saying so is a factual
claim, and a wrong one is the kind of small dishonesty that erodes an archive.

### `events`

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `end` | no | date/datetime | must not be earlier than `date` |
| `location` | yes | string | e.g. `서울` or `Online` |
| `format` | yes | `in-person` \| `online` \| `hybrid` | drives the structured data |
| `registrationUrl` | no | absolute URL | external only |

An event is "upcoming" until its `end`, or the close of its `date` when there is
no end. Attendee data is never stored in either repository.

### Example pair

```mdx
---
# content/posts/ko/깃허브를-공용기억으로-쓰기.mdx
title: 깃허브를 공용 기억으로 쓰기
description: 검색 결과와 피드에 그대로 나가는 한 문장.
date: "2026-09-13"
translationKey: github-agent-memory
tags: ["아키텍처"]
---

본문. Markdown과 MDX를 씁니다.
```

```mdx
---
# content/posts/en/github-as-agent-memory.mdx
title: GitHub as agent memory
description: One sentence that appears in search results and in the feed.
date: "2026-09-13"
translationKey: github-agent-memory
tags: ["architecture"]
---

Body. Markdown plus MDX.
```

## Promoting from `convoke-space/private`

**Promotion is not a copy.** It produces a clean publishable artifact. Before a
file moves, actively inspect it for:

- personal information — the operator's own, and anyone else's
- credentials, tokens, internal hostnames, internal URLs
- employer, client or customer confidential material
- unpublished commercial information
- raw working notes that were never meant for a reader
- private metadata (internal ticket numbers, planning scaffolding)
- unsupported claims
- attribution problems — quotes, sources, other people's ideas

Then rewrite for a reader rather than for the author's own thinking, add
frontmatter, and open the pull request. Use the "Publication" issue template;
do not paste private content into the issue.

The private repository is never a live CMS. Nothing publishes automatically.

## Checklist before opening a content pull request

- [ ] Filenames are lowercase kebab-case and read well as URLs in both languages
- [ ] `translationKey` matches across the pair
- [ ] `translation` is set honestly if only one edition ships
- [ ] The two editions make the same claims and state the same facts
- [ ] Neither edition invents experience, opinions or credentials
- [ ] Neither edition reads as generic AI prose (`AGENTS.md` §5.5)
- [ ] `description` is ≤ 200 characters and works as a search snippet
- [ ] Every internal link uses the reader's locale
- [ ] `npm run verify` passes
- [ ] Both editions checked at 390px and desktop
