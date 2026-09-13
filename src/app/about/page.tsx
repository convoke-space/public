import Link from "next/link";
import { Container } from "@/components/container";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description:
    "What Convoke is, how it is written and operated, and how the site itself is built.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container width="prose">
      <header className="pt-12 pb-8 sm:pt-16">
        <p className="eyebrow mb-3">About</p>
        <h1 className="font-serif text-[2rem] leading-[1.15] sm:text-[2.5rem]">
          About {siteConfig.name}
        </h1>
      </header>

      <div className="prose">
        <p>
          Convoke is a personal digital platform: a place for writing that takes
          more than one sitting, for the projects that writing comes out of, and
          for the occasional small gathering. It is deliberately not a portfolio
          site. Portfolios are written for a hiring cycle; this is written for
          the archive.
        </p>

        <h2>What lives here</h2>
        <p>
          Three kinds of thing, and nothing else until something else earns a
          place:
        </p>
        <ul>
          <li>
            <Link href="/writing">Writing</Link> — essays and worked notes,
            mostly on software architecture, systems design, and building with
            AI as a first-class part of the toolchain.
          </li>
          <li>
            <Link href="/projects">Projects</Link> — what has actually been
            built, with the reasoning and the trade-offs left in.
          </li>
          <li>
            <Link href="/gatherings">Gatherings</Link> — small sessions and
            workshops, announced here and registered for elsewhere.
          </li>
        </ul>

        <h2>How it is operated</h2>
        <p>
          Convoke is run as an AI-native software system. Direction is set by a
          human; implementation is carried out by cloud coding agents working
          against GitHub. Every change arrives as a pull request, passes
          automated validation, and is merged only after human review. There is
          no permanent development machine in the loop — the repository is the
          durable state, and the agents are disposable.
        </p>
        <p>
          The public source is deliberately separated from private working
          material. Drafts, research and raw notes live in a private repository
          and never flow into production automatically. Publication is an
          explicit act: review, edit, sanitize, promote. The production site can
          be rebuilt from the public repository alone.
        </p>

        <h2>Colophon</h2>
        <p>
          Built with Next.js and TypeScript, styled with Tailwind CSS, written
          in MDX, and deployed on Vercel. Typography uses the operating
          system&rsquo;s own serif and sans stacks — no web fonts, nothing to
          download, nothing to break in five years. Colours are a single set of
          tokens that swap with the reader&rsquo;s light or dark preference.
        </p>
        <p>
          There is no analytics script, no tracker, no cookie banner, and no
          third-party embed. Nothing on this site collects information about
          you. Event registration, when it is open, is handled by an external
          provider and linked to explicitly.
        </p>
        <p>
          The source is public:{" "}
          <a
            href="https://github.com/convoke-space/public"
            rel="noreferrer"
          >
            github.com/convoke-space/public
          </a>
          . Writing is available as{" "}
          <a href="/feed.xml">an RSS feed</a>.
        </p>
      </div>

      <div className="pb-16" />
    </Container>
  );
}
