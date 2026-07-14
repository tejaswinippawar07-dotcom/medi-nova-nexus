import { createFileRoute } from "@tanstack/react-router";
import { DEPARTMENTS, DOCTORS } from "@/lib/hospital/data";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/about", priority: "0.8", changefreq: "monthly" },
          { path: "/departments", priority: "0.9", changefreq: "monthly" },
          { path: "/doctors", priority: "0.9", changefreq: "weekly" },
          { path: "/services", priority: "0.8", changefreq: "monthly" },
          { path: "/appointment", priority: "0.9", changefreq: "monthly" },
          { path: "/contact", priority: "0.6", changefreq: "yearly" },
          ...DEPARTMENTS.map((d) => ({ path: `/departments/${d.slug}`, priority: "0.7", changefreq: "monthly" })),
          ...DOCTORS.map((d) => ({ path: `/doctors/${d.id}`, priority: "0.6", changefreq: "monthly" })),
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) => `  <url><loc>${BASE_URL}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});