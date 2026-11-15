/**
 * Keeps the operator's own visits out of Vercel Web Analytics.
 *
 * Opening any page with `?me=1` marks that browser as the operator's, and every
 * later page view from it is dropped before it is sent. `?me=0` clears the mark.
 * The flag lives in localStorage under `va-disable`, the key Vercel's docs use
 * for this opt-out (vercel.com/docs/analytics/redacting-sensitive-data).
 */
export const OWNER_PARAM = "me";
export const OWNER_STORAGE_KEY = "va-disable";

type FlagStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Applies `?me=1` / `?me=0` from `search`; returns whether this browser is excluded. */
export function applyOwnerFlag(search: string, storage: FlagStorage): boolean {
  const value = new URLSearchParams(search).get(OWNER_PARAM);
  if (value === "1") storage.setItem(OWNER_STORAGE_KEY, "1");
  if (value === "0") storage.removeItem(OWNER_STORAGE_KEY);
  return storage.getItem(OWNER_STORAGE_KEY) !== null;
}

/** `search` without the `me` parameter, ready for history.replaceState. */
export function withoutOwnerParam(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(OWNER_PARAM);
  const rest = params.toString();
  return rest ? `?${rest}` : "";
}
