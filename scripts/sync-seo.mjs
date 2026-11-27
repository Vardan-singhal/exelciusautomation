import fs from "node:fs";
const records = JSON.parse(
  fs.readFileSync("audit/published-source-records.json"),
);
fs.writeFileSync(
  "src/data/seo-config.json",
  JSON.stringify(
    records.pages.map(
      ({ slug, og_title, og_description, og_image, robots }) => ({
        slug,
        og_title,
        og_description,
        og_image,
        robots,
      }),
    ),
    null,
    2,
  ),
);
const crawl = JSON.parse(fs.readFileSync("audit/live-crawl.json"));
fs.writeFileSync(
  "src/data/seo.json",
  JSON.stringify(
    crawl.map(
      ({ url, title, description, canonical, robots, openGraph, schemas }) => ({
        url,
        title,
        description,
        canonical,
        robots,
        openGraph,
        schemas,
      }),
    ),
    null,
    2,
  ),
);
console.log(
  "SEO configuration synchronized from local source records and recorded live crawl.",
);
