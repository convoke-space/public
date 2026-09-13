/**
 * Structured data. The payload is built in src/lib/seo.ts from typed inputs —
 * never interpolate user or content strings into this tag by hand.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is escaped below so a "</script>" inside content
      // cannot break out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
