import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Content is authored as .md/.mdx under content/ and compiled at build time by
  // next-mdx-remote. No MDX page routes are used, so no MDX webpack loader is needed.
  pageExtensions: ["ts", "tsx"],
  // Content files are read with `fs`; keep them traced into the serverless
  // output so on-demand rendering works on any host.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  experimental: {
    // Serves src/app/global-not-found.tsx for every unmatched route. Next uses
    // that file as the layout, so the 404 is one complete server-rendered
    // document — see docs/ARCHITECTURE.md.
    globalNotFound: true,
  },
};

export default nextConfig;
