import fs from "node:fs";
import * as cheerio from "cheerio";
const inv = JSON.parse(fs.readFileSync("audit/url-inventory.json"));
const queue = [
  ...new Set([
    "https://www.exelciusautomation.com/",
    ...inv.sitemap,
    ...inv.blogs.flatMap((b) => [
      "https://www.exelciusautomation.com" + b.url,
      "https://www.exelciusautomation.com" + b.queryAlias,
    ]),
  ]),
];
const results = [];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const html = await r.text();
      const $ = cheerio.load(html);
      results.push({
        url,
        finalUrl: r.url,
        status: r.status,
        title: $("title").text(),
        description: $("meta[name=description]").attr("content"),
        canonical: $("link[rel=canonical]").attr("href"),
        robots: $("meta[name=robots]").attr("content"),
        openGraph: $('meta[property^="og:"]')
          .map((_, e) => ({
            property: $(e).attr("property"),
            content: $(e).attr("content"),
          }))
          .get(),
        schemas: $('script[type="application/ld+json"]')
          .map((_, e) => $(e).text())
          .get(),
        links: $("a[href]")
          .map((_, e) => $(e).attr("href"))
          .get(),
      });
    } catch (e) {
      results.push({ url, error: e.message });
    }
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
fs.writeFileSync("audit/live-crawl.json", JSON.stringify(results, null, 2));
console.log({
  crawled: results.length,
  ok: results.filter((r) => r.status === 200).length,
  failed: results.filter((r) => r.error || r.status !== 200).length,
});
