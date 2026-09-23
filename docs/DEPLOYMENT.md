# Deployment

## Production path

```
convoke-space/public @ main → Vercel → https://convoke.space
```

Only `convoke-space/public` is connected to Vercel. The private repository is
never part of a deployment.

## Vercel project settings

| Setting | Value |
| --- | --- |
| Git repository | `convoke-space/public` |
| Production branch | `main` |
| Framework preset | Next.js (auto-detected) |
| Install command | `npm ci` (default) |
| Build command | `npm run build` (default) |
| Output | `.next` (default) |
| Node version | 22.x |

### Web Analytics

The repository integrates Vercel Web Analytics through the official
`@vercel/analytics` package. Because Convoke has two root layouts, the
`<Analytics />` component is mounted in both `src/app/(gateway)/layout.tsx`
and `src/app/[locale]/layout.tsx` so the locale-neutral gateway and both
localized editions are covered.

No analytics environment variable or custom `vercel.json` setting is required.
The Vercel project itself must have Web Analytics enabled in the dashboard; once
the code reaches a deployment and the site is visited, page-view data should
begin appearing in the Analytics view.

No custom configuration is required, and there is deliberately no `vercel.json`
— every setting above is either the platform default or set once in the
dashboard. Adding a config file would be a second place for deployment truth to
live.

## Environment variables

The site builds and runs with **no environment variables set**. The following
are optional overrides, all read in `src/lib/site.ts`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Force the origin used for absolute URLs. Useful for local previews and self-hosting. |
| `NEXT_PUBLIC_NOINDEX` | Set to `true` to serve `noindex` regardless of environment. |

`VERCEL_ENV` and `VERCEL_URL` are provided by the platform; do not set them.

Because there are no required variables, there is no `.env.example` in the
repository. Add one only when a variable becomes genuinely required — and never
with real values.

## Preview deployments

Every pull request gets a preview URL. Previews are safe by construction:

- `VERCEL_ENV=preview` makes `robots.txt` serve `Disallow: /`
- page metadata carries `noindex, nofollow`
- `rel=canonical` still points at `https://convoke.space`, so a preview never
  competes with production in search

Do not defeat any of that to "test SEO on a preview".

## Locales and routing

Localization needs **no platform configuration**. There is no Vercel i18n
setting, no middleware, no rewrite and no redirect: `/ko/...` and `/en/...` are
ordinary statically generated routes, and `/` is a real page — a bilingual
gateway that belongs to neither language.

Do not enable Vercel's built-in locale detection or add a middleware redirect
from `/`. The gateway is deterministic on purpose: it is what `x-default`
points at, and a browser-language guess would make the entry point depend on
the reader's headers. See `docs/ARCHITECTURE.md`.

Each locale has its own feed at `/<locale>/feed.xml`; one sitemap at
`/sitemap.xml` covers both.

## Domain

Canonical hostname: `convoke.space`. If `www.convoke.space` is added later,
configure it in Vercel as a redirect to the apex, not as an alias — the site
should have exactly one indexable hostname.

`site.config.ts` holds the canonical origin. It is the only place that literal
appears.

## First-time setup (human)

Requires account access, so it cannot be done by an agent:

1. In Vercel, import `convoke-space/public`.
2. Confirm the production branch is `main`; accept the detected Next.js preset.
3. Deploy.
4. Add the domain `convoke.space` and point DNS at Vercel as instructed.
5. Optionally add `www.convoke.space` and set it to redirect to the apex.

Nothing else is needed. If the deployment fails, it will fail for the same
reason CI fails, and CI runs the identical commands.

## Rollback

Redeploy the previous successful deployment from the Vercel dashboard, then fix
forward with a pull request. Do not force-push `main`.
