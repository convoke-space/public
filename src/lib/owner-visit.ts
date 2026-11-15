/**
 * Keeps the operator's own visits out of Vercel Web Analytics.
 *
 * The operator holds two private links, each with one long random query value.
 * Opening the "on" link marks that browser as the operator's, and every later
 * page view from it is dropped before it is sent; the "off" link clears the
 * mark. Only SHA-256 hashes of the two values live here, because this source is
 * public; the parameter name is not checked at all. The flag lives in
 * localStorage under `va-disable`, the key Vercel's opt-out docs use
 * (vercel.com/docs/analytics/redacting-sensitive-data).
 */
export const OWNER_STORAGE_KEY = "va-disable";

const ON_HASH = "ea4050d49daa8c757cc625d8d053083fbfb4d73e54abbd63696cdba10d130377";
const OFF_HASH = "5e743434f5149cb56379f0982c81c9b45e7aa347c22896ca69872daadf965a21";

/** The link values are 32 random bytes in base64url: 43 characters. */
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

type FlagStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type OwnerLink = { action: "on" | "off"; param: string };

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Finds the on/off link in `search`, if it carries one. */
export async function findOwnerLink(search: string): Promise<OwnerLink | null> {
  for (const [param, value] of new URLSearchParams(search)) {
    if (!TOKEN_SHAPE.test(value)) continue;
    const hash = await sha256Hex(value);
    if (hash === ON_HASH) return { action: "on", param };
    if (hash === OFF_HASH) return { action: "off", param };
  }
  return null;
}

export function applyOwnerLink(link: OwnerLink, storage: FlagStorage): void {
  if (link.action === "on") storage.setItem(OWNER_STORAGE_KEY, "1");
  else storage.removeItem(OWNER_STORAGE_KEY);
}

/**
 * Whether a page view should be dropped. Hashing is async and `beforeSend` is
 * not, so a URL that may still be carrying a link value is dropped too; that
 * keeps the link's own visit out without waiting for the hash.
 */
export function isExcluded(url: string, storage: FlagStorage): boolean {
  if (storage.getItem(OWNER_STORAGE_KEY) !== null) return true;
  const search = url.includes("?") ? url.slice(url.indexOf("?")).split("#")[0] : "";
  return [...new URLSearchParams(search).values()].some((v) => TOKEN_SHAPE.test(v));
}

/** `search` without `param`, ready for history.replaceState. */
export function withoutParam(search: string, param: string): string {
  const params = new URLSearchParams(search);
  params.delete(param);
  const rest = params.toString();
  return rest ? `?${rest}` : "";
}
