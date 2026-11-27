import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root = path.resolve(".."),
  old = path.join(root, "Previous");
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, v) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2));
};
function sqlParse(s) {
  const tables = {};
  const re = /INSERT INTO `([^`]+)` \(([^;]+?)\) VALUES\s*/g;
  let m;
  while ((m = re.exec(s))) {
    const cols = [...m[2].matchAll(/`([^`]+)`/g)].map((x) => x[1]);
    let i = re.lastIndex,
      quoted = false,
      token = "",
      row = [],
      rows = [];
    for (; i < s.length; i++) {
      let c = s[i];
      if (quoted) {
        if (c === "\\") {
          const n = s[++i];
          token += { n: "\n", r: "\r", t: "\t", 0: "\0" }[n] ?? n;
        } else if (c === "'") quoted = false;
        else token += c;
      } else if (c === "'") quoted = true;
      else if (c === "(") {
        row = [];
        token = "";
      } else if (c === "," || c === ")") {
        row.push(token.trim() === "NULL" ? null : token.trim());
        token = "";
        if (c === ")") {
          rows.push(Object.fromEntries(cols.map((k, j) => [k, row[j]])));
          row = [];
        }
      } else if (c === ";") break;
      else token += c;
    }
    re.lastIndex = i + 1;
    (tables[m[1]] ??= []).push(...rows);
  }
  return tables;
}
const db = sqlParse(read(path.join(old, "jaikvikc_exelcius.sql")));
const backup = sqlParse(read(path.join(old, "excelcius.sql")));
const strip = (s) =>
  s
    .replace(/<\?php[\s\S]*?\?>|<\?=[\s\S]*?\?>/g, "")
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const fallback = (s, key) =>
  s.match(new RegExp("\\$" + key + "\\s*\\?\\?\\s*'([^']*)'"))?.[1];
const pages = [];
for (const file of fs
  .readdirSync(old)
  .filter(
    (f) => f.endsWith(".php") && !/^(send|tt\.|404|blog\.|page\.)/.test(f),
  )) {
  const s = read(path.join(old, file));
  const slug = file.slice(0, -4);
  const d =
    db.pages_seo?.find(
      (x) =>
        x.slug === slug ||
        x.page_identifier === file ||
        x.page_identifier === slug,
    ) || {};
  const main = s.split(/<body[^>]*>/i)[1]?.split(/<\/body>/i)[0] || s;
  const schemas = [
    ...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].flatMap((x) => {
    try {
      return [JSON.parse(x[1])];
    } catch {
      return [];
    }
  });
  pages.push({
    slug: slug === "index" ? "" : slug,
    file,
    url: slug === "index" ? "/" : "/" + slug,
    title:
      d.meta_title ||
      fallback(s, "pageTitle") ||
      strip(s.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || slug),
    description:
      d.meta_description ||
      fallback(s, "pageDesc") ||
      s.match(/name="description"\s+content="([^"<]*)"/)?.[1] ||
      "",
    canonical:
      d.canonical_url ||
      fallback(s, "pageCanonical") ||
      s.match(/rel="canonical"\s+href="([^"<]*)"/)?.[1] ||
      "",
    keywords: d.meta_keywords || fallback(s, "pageKeywords") || "",
    heading:
      d.heading ||
      strip(
        main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ||
          d.page_name ||
          slug.replaceAll("-", " "),
      ),
    group: d.page_group || "main",
    dbId: d.id || null,
    content: d.content || "",
    staticHtml: main,
    staticText: strip(main),
    images: [...s.matchAll(/(?:src|poster)=["']([^"'<>]+)["']/g)].map(
      (x) => x[1],
    ),
    links: [...s.matchAll(/href=["']([^"'<>]+)["']/g)].map((x) => x[1]),
    schemas,
    seoHead: s.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "",
    presentation: [
      "index",
      "about-us",
      "contact",
      "blogs",
      "gallery",
      "career",
    ].includes(slug)
      ? "Dedicated editorial layout"
      : "Solution or product detail; preserve full technical content",
    retain:
      "Metadata, canonical destination, full technical copy, specifications, source images and internal links",
  });
}
for (const d of db.pages_seo || [])
  if (
    d.status === "published" &&
    !pages.some((p) => p.slug === d.slug || p.file === d.page_identifier)
  )
    pages.push({
      slug: d.slug,
      url: "/" + d.slug,
      title: d.meta_title || d.page_name,
      heading: d.heading || d.page_name,
      description: d.meta_description,
      canonical: d.canonical_url,
      keywords: d.meta_keywords,
      content: d.content,
      images: [d.banner_image, d.product_image].filter(Boolean),
      group: d.page_group,
      dbId: d.id,
      schemas: [],
      staticHtml: "",
      staticText: "",
      links: [],
      retain: "Entire published CMS content",
    });
const blogs = (db.blogs || []).filter((b) => b.status === "publish");
write("audit/content-inventory.json", pages);
write("audit/database-summary.json", {
  tables: Object.fromEntries(
    Object.entries(db).map(([k, v]) => [
      k,
      { rows: v.length, columns: Object.keys(v[0] || {}) },
    ]),
  ),
  backupTables: Object.fromEntries(
    Object.entries(backup).map(([k, v]) => [k, v.length]),
  ),
  note: "No separate product/project/testimonial tables. Product content lives in pages_seo; testimonials in index.php. Private enquiries, resumes and admin records are intentionally excluded from frontend data.",
});
write("audit/url-inventory.json", {
  pages: pages.map((p) => ({
    url: p.url,
    phpAlias: "/" + p.file,
    canonical: p.canonical,
    source: p.file || "pages_seo:" + p.dbId,
  })),
  blogs: blogs.map((b) => ({
    url: "/" + b.slug,
    queryAlias: "/blog.php?slug=" + b.slug,
    canonical: b.canonical_url,
  })),
  sitemap: [
    ...read(path.join(old, "sitemap.xml")).matchAll(/<loc>(.*?)<\/loc>/g),
  ].map((x) => x[1]),
});
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
    );
write(
  "audit/source-hashes.json",
  Object.fromEntries(
    [
      ...fs
        .readdirSync(old)
        .filter((f) => /\.(php|sql)$/.test(f))
        .map((f) => path.join(old, f)),
      ...walk(path.join(old, "frame")),
      ...walk(path.join(root, "PPT")),
    ].map((p) => [
      path.relative(root, p),
      crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"),
    ]),
  ),
);
write(
  "audit/asset-inventory.json",
  walk(path.join(old, "images")).map((p) => ({
    path: path.relative(old, p).replaceAll("\\", "/"),
    bytes: fs.statSync(p).size,
  })),
);
write(
  "src/data/legacy.json",
  pages.map(({ staticHtml, seoHead, ...p }) => ({ ...p, staticHtml })),
);
write("src/data/blogs.json", blogs);
write("src/data/contact.json", db.contact_settings?.[0] || {});
write("audit/published-source-records.json", {
  pages: db.pages_seo,
  blogs,
  contact: db.contact_settings?.[0],
});
console.log(
  JSON.stringify(
    {
      pages: pages.length,
      blogs: blogs.length,
      tables: Object.fromEntries(
        Object.entries(db).map(([k, v]) => [k, v.length]),
      ),
      contact: db.contact_settings?.[0],
    },
    null,
    2,
  ),
);
