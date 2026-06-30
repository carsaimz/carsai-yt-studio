import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

const paths = [
  { path: "/", priority: "1.0" },
  { path: "/analytics", priority: "0.8" },
  { path: "/content", priority: "0.8" },
  { path: "/community", priority: "0.7" },
  { path: "/seo", priority: "0.7" },
  { path: "/studio", priority: "0.7" },
  { path: "/ai", priority: "0.8" },
  { path: "/settings", priority: "0.5" },
  { path: "/profile", priority: "0.5" },
  { path: "/auth", priority: "0.6" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = paths
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
