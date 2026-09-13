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
};

export default nextConfig;
