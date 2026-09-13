import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="pt-12 pb-8 sm:pt-16 sm:pb-10">
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.6rem]">
        {title}
      </h1>
      {lede ? (
        <div className="mt-4 max-w-[52ch] text-[1.05rem] text-muted">{lede}</div>
      ) : null}
      {children}
    </header>
  );
}
