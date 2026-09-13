"use client";

import { useEffect } from "react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the platform logs; nothing sensitive is rendered to the page.
    console.error(error);
  }, [error]);

  return (
    <Container width="page">
      <PageHeader
        eyebrow="Error"
        title="Something went wrong"
        lede="This page failed to render. The problem has been logged."
      />
      <div className="pb-16">
        <button
          type="button"
          onClick={reset}
          className="rounded border border-rule px-4 py-2 text-[0.9rem] transition-colors hover:border-accent hover:text-accent"
        >
          Try again
        </button>
        {error.digest ? (
          <p className="mt-4 text-[0.78rem] text-faint">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </Container>
  );
}
