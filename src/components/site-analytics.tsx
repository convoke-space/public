"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import {
  applyOwnerLink,
  findOwnerLink,
  isExcluded,
  withoutParam,
} from "@/lib/owner-visit";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    // Storage blocked (e.g. some private modes): count visits as usual.
    return null;
  }
}

/** Vercel Web Analytics, minus page views from the operator's own browsers. */
export function SiteAnalytics() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (!search) return;
    void findOwnerLink(search).then((link) => {
      if (!link) return;
      const store = storage();
      if (store) applyOwnerLink(link, store);
      window.history.replaceState(
        window.history.state,
        "",
        pathname + withoutParam(search, link.param) + hash,
      );
    });
  }, []);

  return (
    <Analytics
      beforeSend={(event) => {
        const store = storage();
        return store && isExcluded(event.url, store) ? null : event;
      }}
    />
  );
}
