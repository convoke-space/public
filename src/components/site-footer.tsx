import Link from "next/link";
import { Container } from "./container";
import { siteConfig } from "../../site.config";

export function SiteFooter({ hasEvents }: { hasEvents: boolean }) {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="mt-24 border-t border-rule py-10">
      <Container
        width="wide"
        className="flex flex-col gap-6 text-[0.85rem] text-muted sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="max-w-sm">
          <p className="font-serif text-base text-ink">{siteConfig.name}</p>
          <p className="mt-1.5">{siteConfig.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1.5 sm:grid-cols-1 sm:text-right">
            <li>
              <Link href="/writing" className="link-underline">
                Writing
              </Link>
            </li>
            <li>
              <Link href="/projects" className="link-underline">
                Projects
              </Link>
            </li>
            {hasEvents ? (
              <li>
                <Link href="/gatherings" className="link-underline">
                  Gatherings
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/about" className="link-underline">
                About
              </Link>
            </li>
            <li>
              <a href="/feed.xml" className="link-underline">
                RSS
              </a>
            </li>
          </ul>
        </nav>
      </Container>

      <Container width="wide" className="mt-8 text-[0.78rem] text-faint">
        <p>
          © {year} {siteConfig.name}. Built in the open —{" "}
          <a
            href="https://github.com/convoke-space/public"
            className="link-underline"
            rel="noreferrer"
          >
            source on GitHub
          </a>
          .
        </p>
      </Container>
    </footer>
  );
}
