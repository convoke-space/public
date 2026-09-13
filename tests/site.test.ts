import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "../site.config";

const ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "NEXT_PUBLIC_NOINDEX",
] as const;

/** The module reads process.env at import time in places, so reload per case. */
async function loadSite() {
  vi.resetModules();
  return import("@/lib/site");
}

describe("site origin resolution", () => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      original[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });

  it("defaults to the canonical origin", async () => {
    const { getSiteOrigin } = await loadSite();
    expect(getSiteOrigin()).toBe(siteConfig.canonicalOrigin);
  });

  it("honours an explicit override without a trailing slash", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000/";
    const { getSiteOrigin } = await loadSite();
    expect(getSiteOrigin()).toBe("http://localhost:3000");
  });

  it("uses the deployment URL on previews", async () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "convoke-abc123.vercel.app";
    const { getSiteOrigin } = await loadSite();
    expect(getSiteOrigin()).toBe("https://convoke-abc123.vercel.app");
  });

  it("keeps canonical URLs pointed at production from a preview", async () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "convoke-abc123.vercel.app";
    const { canonicalUrl } = await loadSite();
    expect(canonicalUrl("/writing")).toBe(
      `${siteConfig.canonicalOrigin}/writing`,
    );
  });

  it("only allows indexing in production", async () => {
    process.env.VERCEL_ENV = "preview";
    const preview = await loadSite();
    expect(preview.isIndexable()).toBe(false);

    process.env.VERCEL_ENV = "production";
    const production = await loadSite();
    expect(production.isIndexable()).toBe(true);
  });

  it("builds absolute URLs with a single leading slash", async () => {
    const { absoluteUrl } = await loadSite();
    expect(absoluteUrl("writing")).toBe(`${siteConfig.canonicalOrigin}/writing`);
    expect(absoluteUrl("/")).toBe(`${siteConfig.canonicalOrigin}/`);
  });
});

describe("site config", () => {
  it("has no trailing slash on the canonical origin", () => {
    expect(siteConfig.canonicalOrigin).toMatch(/^https:\/\/[^/]+$/);
  });
});
