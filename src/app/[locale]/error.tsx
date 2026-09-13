"use client";

import { useEffect } from "react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { DEFAULT_LOCALE } from "../../../site.config";
import { getDictionary } from "@/lib/i18n";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = getDictionary(DEFAULT_LOCALE);

  useEffect(() => {
    // Surfaced in the platform logs; nothing sensitive is rendered to the page.
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex-1">
      <Container width="page">
        <PageHeader
          eyebrow={dict.error.eyebrow}
          title={dict.error.title}
          lede={dict.error.lede}
        />
        <div className="pb-16">
          <button
            type="button"
            onClick={reset}
            className="rounded border border-rule px-4 py-2 text-[0.9rem] transition-colors hover:border-accent hover:text-accent"
          >
            {dict.error.retry}
          </button>
          {error.digest ? (
            <p className="mt-4 text-[0.78rem] text-faint">
              {dict.error.reference}: {error.digest}
            </p>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
