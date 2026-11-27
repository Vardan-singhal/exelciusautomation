import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import sharp from "sharp";
import manifest from "../src/data/image-manifest.json" with { type: "json" };
import { imageHtml } from "../src/lib/image-urls.mjs";
import * as cheerio from "cheerio";

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
const files = walk("public").filter((file) =>
  /\.(png|jpe?g|webp|avif|gif|svg|ico|bmp|tiff?)$/i.test(file),
);
const report = JSON.parse(
  fs.readFileSync("audit/image-optimization-report.json", "utf8"),
);
const records = new Map(
  report.records.map((record) => [record.target, record]),
);
let total = 0,
  largest = 0,
  transparent = 0;
for (const file of files) {
  const bytes = fs.statSync(file).size;
  assert.match(file, /\.webp$/i, file);
  assert.ok(bytes < 500000, `${file}: ${bytes} bytes`);
  const metadata = await sharp(file, { animated: true }).metadata();
  assert.equal(metadata.format, "webp", file);
  const target = "/" + path.relative("public", file).replaceAll("\\", "/");
  const record = records.get(target);
  assert.ok(record, "Missing dimension baseline: " + target);
  assert.equal(metadata.width, record.width, file);
  assert.equal(metadata.height, record.height, file);
  if (metadata.hasAlpha) transparent++;
  total += bytes;
  largest = Math.max(largest, bytes);
}
for (const [source, target] of Object.entries(manifest))
  assert.ok(fs.existsSync("public" + target), `${source} -> ${target}`);
let contentImages = 0;
for (const source of ["src/data/legacy.json", "src/data/blogs.json"]) {
  for (const entry of JSON.parse(fs.readFileSync(source, "utf8"))) {
    const before = cheerio.load(entry.html || "");
    const $ = cheerio.load(imageHtml(entry.html || ""));
    const layoutAttributes = ($doc) =>
      $doc("img")
        .map((_, element) =>
          Object.fromEntries(
            Object.entries(element.attribs).filter(([name]) => name !== "src"),
          ),
        )
        .get();
    assert.deepEqual(
      layoutAttributes($),
      layoutAttributes(before),
      "Image layout attributes changed: " + entry.slug,
    );
    assert.equal($.text(), before.text(), "Content changed: " + entry.slug);
    $("img[src]").each((_, image) => {
      const url = new URL(
        $(image).attr("src"),
        "https://www.exelciusautomation.com/",
      );
      assert.equal(url.hostname, "www.exelciusautomation.com", entry.slug);
      assert.match(url.pathname, /\.webp$/i, entry.slug + ": " + url.pathname);
      assert.ok(
        fs.existsSync("public" + decodeURIComponent(url.pathname)),
        url.pathname,
      );
      contentImages++;
    });
  }
}
const css = fs.readFileSync("src/app/globals.css", "utf8");
assert.ok(
  !css.includes("data:image/svg+xml"),
  "Inline image format should also be WebP",
);
for (const match of css.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g))
  assert.ok(Buffer.from(match[1], "base64").length < 500000);
console.log(
  JSON.stringify(
    {
      images: files.length,
      allWebP: true,
      allUnder500KB: true,
      dimensionsPreserved: true,
      transparentImages: transparent,
      contentImagesChecked: contentImages,
      maxBytes: largest,
      totalBytes: total,
    },
    null,
    2,
  ),
);
