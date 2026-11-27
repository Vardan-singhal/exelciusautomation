import fs from "node:fs";
import * as cheerio from "cheerio";
import { imageSrc } from "../src/lib/image-urls.mjs";
const base = process.env.VERIFY_URL || "http://127.0.0.1:3000",
  results = [];
for (const path of ["/index.php", "/blog.php", "/about-us/"]) {
  const r = await fetch(base + path, {
    redirect: "manual",
    headers: { connection: "close" },
  });
  results.push({ path, status: r.status, location: r.headers.get("location") });
  await r.arrayBuffer();
}
const imagePath = imageSrc("/images/gallery-img/7.jpeg");
const image = await fetch(base + imagePath, {
  headers: { accept: "image/webp", connection: "close" },
});
const bytes = await image.arrayBuffer();
results.push({
  imageOptimization: image.status,
  type: image.headers.get("content-type"),
  bytes: bytes.byteLength,
  sourceBytes: fs.statSync("public" + decodeURIComponent(imagePath)).size,
});
const home = cheerio.load(
  await (await fetch(base, { headers: { connection: "close" } })).text(),
);
results.push({
  homeCanonicalInHead: home("head link[rel=canonical]").attr("href"),
  homeSchemaTypes: home('script[type="application/ld+json"]')
    .map((_, e) => JSON.parse(home(e).text())["@type"])
    .get(),
});
const contact = cheerio.load(
  await (
    await fetch(base + "/contact", { headers: { connection: "close" } })
  ).text(),
);
results.push({
  formControls: contact("form input,form select,form textarea").length,
  labelledControls: contact("form input,form select,form textarea").filter(
    (_, e) => contact(e).closest("label").length > 0,
  ).length,
  emailRequired:
    contact("form input[type=email]").attr("required") !== undefined,
});
fs.writeFileSync(
  "audit/additional-checks.json",
  JSON.stringify(results, null, 2),
);
console.log(results);
