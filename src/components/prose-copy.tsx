import Link from "next/link";
import type { Locale } from "../../site.config";
import type { Inline, Prose } from "@/lib/i18n";
import { localePath } from "@/lib/site";

/**
 * Renders a run of dictionary copy, resolving its links.
 *
 * Reader-facing copy lives in `src/lib/i18n.ts` (AGENTS.md §7), so a component
 * never holds a sentence. This is the piece that turns that data into markup:
 * an `href` starting with "http" is external, anything else is a
 * locale-relative site path.
 */
export function ProseCopy({
  locale,
  prose,
}: {
  locale: Locale;
  prose: Prose;
}) {
  return (
    <>
      {prose.map((node, index) => (
        <InlineNode key={index} locale={locale} node={node} />
      ))}
    </>
  );
}

function InlineNode({ locale, node }: { locale: Locale; node: Inline }) {
  if (typeof node === "string") return <>{node}</>;

  if (node.href.startsWith("http")) {
    return (
      <a href={node.href} rel="noreferrer">
        {node.text}
      </a>
    );
  }

  return <Link href={localePath(locale, node.href)}>{node.text}</Link>;
}
