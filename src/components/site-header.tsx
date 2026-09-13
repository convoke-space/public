"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";

export type HeaderNavItem = { href: string; label: string };

export function SiteHeader({
  nav,
  siteName,
}: {
  nav: HeaderNavItem[];
  siteName: string;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-rule">
      <Container
        width="wide"
        className="flex flex-wrap items-baseline gap-x-6 gap-y-2 py-4 sm:py-5"
      >
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight"
          aria-label={`${siteName} — home`}
        >
          {siteName}
          <span className="text-accent" aria-hidden="true">
            .
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto">
          <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.9rem]">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "text-ink underline decoration-accent decoration-1 underline-offset-[0.35em]"
                        : "text-muted transition-colors hover:text-ink"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
