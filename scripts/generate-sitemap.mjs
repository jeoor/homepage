import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const siteLinks = JSON.parse(
  readFileSync(resolve(root, "src/assets/siteLinks.json"), "utf-8")
);

const today = new Date().toISOString().split("T")[0];

const urls = [
  { loc: "https://www.kayro.cn/", priority: "1.0" },
  ...siteLinks.map((item) => ({
    loc: item.link,
    priority: "0.8",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

writeFileSync(resolve(root, "dist/sitemap.xml"), xml, "utf-8");
console.log("sitemap.xml generated");
