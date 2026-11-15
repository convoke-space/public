"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import {
  OWNER_PARAM,
  applyOwnerFlag,
  withoutOwnerParam,
} from "@/lib/owner-visit";

/** True when this browser is marked as the operator's (see owner-visit.ts). */
function isOwnerBrowser(): boolean {
  try {
    return applyOwnerFlag(window.location.search, window.localStorage);
  } catch {
    // Storage blocked (e.g. some private modes): count the visit as usual.
    return false;
  }
}

/** Vercel Web Analytics, minus page views from the operator's own browsers. */
export function SiteAnalytics() {
  useEffect(() => {
    isOwnerBrowser();
    const { pathname, search, hash } = window.location;
    if (new URLSearchParams(search).has(OWNER_PARAM)) {
      window.history.replaceState(
        window.history.state,
        "",
        pathname + withoutOwnerParam(search) + hash,
      );
    }
  }, []);

  return <Analytics beforeSend={(event) => (isOwnerBrowser() ? null : event)} />;
}
