import Link from "next/link";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";

export default function NotFound() {
  return (
    <Container width="page">
      <PageHeader
        eyebrow="404"
        title="This page isn’t here"
        lede="The address may have changed, or the piece may never have been published."
      />
      <p className="pb-16 text-[0.95rem] text-muted">
        Try{" "}
        <Link href="/writing" className="link-underline">
          Writing
        </Link>
        ,{" "}
        <Link href="/projects" className="link-underline">
          Projects
        </Link>
        , or return to the{" "}
        <Link href="/" className="link-underline">
          home page
        </Link>
        .
      </p>
    </Container>
  );
}
