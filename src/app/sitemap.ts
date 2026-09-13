import type { MetadataRoute } from "next";
import { getEvents, getPosts, getProjects, lastModified } from "@/lib/content";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const projects = getProjects();
  const events = getEvents();

  const newest = (dates: Date[]) =>
    dates.length > 0
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: canonicalUrl("/"),
      lastModified: newest([...posts, ...projects, ...events].map(lastModified)),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: canonicalUrl("/about"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  if (posts.length > 0) {
    entries.push({
      url: canonicalUrl("/writing"),
      lastModified: newest(posts.map(lastModified)),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const post of posts) {
      entries.push({
        url: canonicalUrl(`/writing/${post.slug}`),
        lastModified: lastModified(post),
        changeFrequency: "yearly",
        priority: 0.7,
      });
    }
  }

  if (projects.length > 0) {
    entries.push({
      url: canonicalUrl("/projects"),
      lastModified: newest(projects.map(lastModified)),
      changeFrequency: "monthly",
      priority: 0.8,
    });
    for (const project of projects) {
      entries.push({
        url: canonicalUrl(`/projects/${project.slug}`),
        lastModified: lastModified(project),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  if (events.length > 0) {
    entries.push({
      url: canonicalUrl("/gatherings"),
      lastModified: newest(events.map(lastModified)),
      changeFrequency: "weekly",
      priority: 0.7,
    });
    for (const event of events) {
      entries.push({
        url: canonicalUrl(`/gatherings/${event.slug}`),
        lastModified: lastModified(event),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
