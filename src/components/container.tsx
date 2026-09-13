import type { ReactNode } from "react";

const WIDTHS = {
  prose: "max-w-[42rem]",
  page: "max-w-[64rem]",
  wide: "max-w-[76rem]",
} as const;

export function Container({
  children,
  width = "page",
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  as?: "div" | "section" | "header" | "footer" | "main" | "article";
  className?: string;
}) {
  return (
    <Tag className={`mx-auto w-full px-5 sm:px-8 ${WIDTHS[width]} ${className}`}>
      {children}
    </Tag>
  );
}
