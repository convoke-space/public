import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef } from "react";

/**
 * MDX component overrides.
 *
 * Keep this map small. Content should read as prose; a component that only one
 * post needs probably belongs inline in that post instead.
 */
const components = {
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) return <Link href={href} {...props} />;
    return (
      <a href={href} rel="noopener noreferrer" target="_blank" {...props} />
    );
  },
};

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: { className: "heading-anchor", ariaHidden: true, tabIndex: -1 },
          content: { type: "text", value: "#" },
        },
      ],
    ],
    format: "mdx",
  },
} as const;

/** Renders a validated content body inside the reading surface. */
export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <MDXRemote source={source} components={components} options={mdxOptions as any} />
    </div>
  );
}
