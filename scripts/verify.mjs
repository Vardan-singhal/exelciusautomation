import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import http from "node:http";
import * as cheerio from "cheerio";
import { imageData } from "../src/lib/image-urls.mjs";
const base = process.env.VERIFY_URL || "http://127.0.0.1:3000";
const pages = JSON.parse(fs.readFileSync("src/data/legacy.json"));
const blogs = JSON.parse(fs.readFileSync("src/data/blogs.json"));
const live = JSON.parse(fs.readFileSync("src/data/seo.json"));
const sitemap = JSON.parse(fs.readFileSync("audit/url-inventory.json")).sitemap;
const routes = [
  ...new Set([
    ...pages.map((p) => p.url),
    ...blogs.map((b) => "/" + b.slug),
    ...sitemap.map((u) => new URL(u).pathname),
  ]),
];
const issues = [],
  results = [],
  links = new Set(),
  assets = new Set();
function checkLocalAsset(url, from) {
  let u;
  try {
    u = new URL(url, base);
  } catch {
    return;
  }
  if (u.origin !== base) return;
  if (u.pathname.startsWith("/_next/")) return;
  const file = path.join("public", decodeURIComponent(u.pathname));
  if (!fs.existsSync(file)) issues.push({ type: "missing asset", from, url });
  else if (!/\.webp$/i.test(u.pathname) || fs.statSync(file).size >= 500000)
    issues.push({
      type: "image format or size violation",
      from,
      url,
      bytes: fs.statSync(file).size,
    });
}
async function check(route, alias = false) {
  try {
    const r = await fetch(base + route, {
      signal: AbortSignal.timeout(30000),
      headers: { connection: "close" },
    });
    if (/\.pdf$/i.test(new URL(route, base).pathname)) {
      await r.arrayBuffer();
      results.push({ route, status: r.status, asset: true });
      if (r.status !== 200)
        issues.push({ type: "asset route status", route, status: r.status });
      return;
    }
    const html = await r.text();
    const $ = cheerio.load(html);
    const pathname = new URL(route, base).pathname;
    let slug = pathname.replace(/^\//, "").replace(/\.php$/, "");
    const queryBlog =
      slug === "blog" && new URL(route, base).searchParams.has("slug");
    if (slug === "blog" || slug === "page")
      slug = new URL(route, base).searchParams.get("slug") || slug;
    const record = live.find(
      (x) =>
        x.url ===
        (queryBlog
          ? "https://www.exelciusautomation.com/blog.php?slug=" + slug
          : "https://www.exelciusautomation.com" + (slug ? "/" + slug : "/")),
    );
    const row = {
      route,
      status: r.status,
      title: $("title").text(),
      description: $("meta[name=description]").attr("content"),
      canonical: $("link[rel=canonical]").attr("href"),
      h1: $("h1").length,
      bytes: Buffer.byteLength(html),
    };
    results.push(row);
    if (r.status !== 200)
      issues.push({ type: "route status", route, status: r.status });
    if (record) {
      for (const field of ["title", "description", "canonical"])
        if ((row[field] || "") !== (record[field] || ""))
          issues.push({
            type: "metadata mismatch",
            route,
            field,
            expected: record[field],
            actual: row[field],
          });
    }
    if (row.h1 !== 1) issues.push({ type: "h1 count", route, count: row.h1 });
    if (/noindex/.test($("meta[name=robots]").attr("content") || ""))
      issues.push({ type: "unexpected noindex", route });
    $('script[type="application/ld+json"]').each((_, e) => {
      try {
        JSON.parse($(e).text());
      } catch {
        issues.push({ type: "invalid schema", route });
      }
    });
    const renderedSchemas = $('script[type="application/ld+json"]')
      .map((_, e) => {
        try {
          return JSON.stringify(JSON.parse($(e).text()));
        } catch {
          return "";
        }
      })
      .get();
    for (const raw of record?.schemas || []) {
      try {
        if (
          !renderedSchemas.includes(JSON.stringify(imageData(JSON.parse(raw))))
        )
          issues.push({ type: "source schema missing", route });
      } catch {}
    }
    $("img").each((_, e) => {
      const src = $(e).attr("src");
      if (!$(e).attr("alt") && $(e).attr("alt") !== "")
        issues.push({ type: "missing image alt", route, src });
      if (src) {
        if (src.startsWith("/_next/image")) {
          const raw = new URL(src, base).searchParams.get("url");
          if (raw) assets.add(raw);
        } else assets.add(src);
      }
    });
    $("a[href]").each((_, e) => {
      const href = $(e).attr("href");
      if (!href || /^(mailto:|tel:|#)/.test(href)) return;
      try {
        const u = new URL(href, base + route);
        if (
          [
            new URL(base).host,
            "www.exelciusautomation.com",
            "exelciusautomation.com",
          ].includes(u.host)
        ) {
          links.add(u.pathname + u.search);
        }
      } catch {
        issues.push({ type: "invalid link", route, href });
      }
    });
    if (
      !queryBlog &&
      !alias &&
      slug &&
      pages.find((p) => p.slug === slug)?.html
    ) {
      const content = pages.find((p) => p.slug === slug).html;
      const original = cheerio.load(content).text().replace(/\s+/g, " ").trim();
      const body = $("main").text().replace(/\s+/g, " ");
      if (
        !["contact", "career", "gallery", "blogs"].includes(slug) &&
        original.length > 100 &&
        !body.includes(original)
      )
        issues.push({ type: "retained text mismatch", route });
    }
    if (queryBlog) {
      const b = blogs.find((b) => b.slug === slug);
      const original = cheerio.load(b.html).text().replace(/\s+/g, " ").trim();
      if (!$("main").text().replace(/\s+/g, " ").includes(original))
        issues.push({ type: "blog query text mismatch", route });
    }
  } catch (e) {
    issues.push({ type: "fetch failed", route, error: e.message });
  }
}
async function parallel(queue, fn, count = 4) {
  await Promise.all(
    Array.from({ length: count }, async () => {
      while (queue.length) await fn(queue.shift());
    }),
  );
}
await parallel([...routes], (r) => check(r));
const aliases = [
  ...pages.filter((p) => p.slug).map((p) => "/" + p.slug + ".php"),
  ...blogs.map((b) => "/blog.php?slug=" + b.slug),
  ...blogs.map((b) => "/blog?slug=" + b.slug),
  "/page.php?slug=Programmable-Logic-Controllers",
  "/gallery?view=projects",
  "/gallery?project=jltl-demo",
  "/sitemap.html",
];
await parallel(aliases, (r) => check(r, true));
for (const a of assets) checkLocalAsset(a, "rendered pages");
const unknownLinks = [...links].filter((l) => {
  const u = new URL(l, base);
  return (
    !routes.includes(u.pathname) &&
    !fs.existsSync(path.join("public", decodeURIComponent(u.pathname))) &&
    !["/gallery", "/contact"].includes(u.pathname)
  );
});
await parallel(unknownLinks, async (url) => {
  try {
    const r = await fetch(base + url, { signal: AbortSignal.timeout(20000) });
    if (r.status >= 400)
      issues.push({ type: "broken internal link", url, status: r.status });
  } catch (e) {
    issues.push({ type: "internal link failed", url, error: e.message });
  }
});
for (const f of ["robots.txt", "sitemap.xml"])
  if (
    fs.readFileSync("public/" + f, "utf8") !==
    fs.readFileSync("../Previous/" + f, "utf8")
  )
    issues.push({ type: "SEO file changed", file: f });
const hashes = JSON.parse(fs.readFileSync("audit/source-hashes.json"));
let originalChanged = [];
for (const [file, expected] of Object.entries(hashes)) {
  if (
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join("..", file)))
      .digest("hex") !== expected
  )
    originalChanged.push(file);
}
if (originalChanged.length)
  issues.push({ type: "source modified", files: originalChanged });
try {
  const status = await new Promise((resolve, reject) => {
    const req = http.get(
      base + "/this-page-does-not-exist",
      { agent: false },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode));
      },
    );
    req.setTimeout(15000, () => req.destroy(new Error("404 check timed out")));
    req.on("error", reject);
  });
  if (status !== 404) issues.push({ type: "missing 404 handling", status });
} catch (e) {
  issues.push({ type: "404 request failed", error: e.message });
}
const summary = {
  checkedAt: new Date().toISOString(),
  pages: routes.length,
  requests: results.length,
  internalLinks: links.size,
  assets: assets.size,
  sourceFilesVerified: Object.keys(hashes).length,
  issues: issues.length,
  browserQA:
    "Unavailable: in-app browser returned no available browsers. Responsive CSS and semantic HTML checked; visual rendering and keyboard interactions require a browser pass.",
};
fs.writeFileSync(
  "audit/verification.json",
  JSON.stringify({ summary, issues, results }, null, 2),
);
console.log(JSON.stringify({ summary, issues }, null, 2));
if (issues.length) process.exitCode = 1;
