import { notFound } from "next/navigation";

/**
 * Anything under a valid locale that matches no route renders the localized
 * 404 rather than falling through to the locale-neutral one at the root.
 */
export default function LocaleCatchAll(): never {
  notFound();
}
