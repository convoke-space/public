import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
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
const components: MDXRemoteProps["components"] = {
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) return <Link href={href} {...props} />;
    return (
      <a href={href} rel="noopener noreferrer" target="_blank" {...props} />
    );
  },
  // A wide table scrolls inside its own container rather than forcing the page
  // to scroll horizontally — and keeps its table semantics while doing so.
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
};

const options: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: "heading-anchor",
            ariaHidden: true,
            tabIndex: -1,
          },
          content: { type: "text", value: "#" },
        },
      ],
    ],
    format: "mdx",
  },
};

/** Renders a validated content body inside the reading surface. */
export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose">
      <MDXRemote source={source} components={components} options={options} />
    </div>
  );
}
