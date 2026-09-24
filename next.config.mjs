/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site: `next build` emits prerendered HTML to `out/` and no
  // server-side code. Requires that there are no API routes or dynamic
  // server rendering — the "last updated" date is resolved at build time
  // instead (see src/lib/last-updated.ts).
  output: "export",

  // Static export has no image optimization server, so next/image must serve
  // the original assets.
  images: {
    unoptimized: true,
  },

  // Disable sourcemaps in the production build.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
