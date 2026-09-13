import { Container } from "@/components/container";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Things built and maintained — systems, tools and experiments, with the reasoning behind them.",
  path: "/projects",
});

export default function ProjectsIndexPage() {
  const projects = getProjects();

  return (
    <Container width="page">
      <PageHeader
        title="Projects"
        lede="Work in progress and work that has settled. Grouped by how alive each one currently is."
      />

      <div className="pb-16">
        <EntryList
          headingLevel="h2"
          items={projects.map((project) => ({
            href: `/projects/${project.slug}`,
            title: project.frontmatter.title,
            description: project.frontmatter.description,
            date: project.frontmatter.date,
            badge: project.frontmatter.status,
          }))}
          emptyMessage="No published projects yet."
        />
      </div>
    </Container>
  );
}
