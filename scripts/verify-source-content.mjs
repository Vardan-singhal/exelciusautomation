import fs from "node:fs";
import assert from "node:assert/strict";
import { load } from "cheerio";

const pages = JSON.parse(fs.readFileSync("src/data/legacy.json"));
const normalize = value => value.replace(/\s+/g, " ").trim();
const outline = $ => $("h1,h2,h3,h4,h5,h6").toArray().map(el => ({
  tag: el.tagName,
  text: normalize($(el).text()),
}));
let checked = 0;
for (const page of pages.filter(page => page.content)) {
  const source = load(page.content);
  // Exclude site controls, while retaining editorial headers, footers and tab labels.
  source("script,style,iframe,form,input,select,textarea,link,meta,nav,.modal,.breadcrumb,.product-sidebar,.sidebar,.openModalBtn").remove();
  const actual = load(page.html);
  assert.deepEqual(outline(actual), outline(source), `${page.slug}: original heading levels and order`);
  assert.equal(normalize(actual.root().text()), normalize(source.root().text()), `${page.slug}: complete source text`);
  for (const tag of ["p", "li", "table", "tr", "th", "td"]) {
    assert.deepEqual(
      actual(tag).toArray().map(el => normalize(actual(el).text())),
      source(tag).toArray().map(el => normalize(source(el).text())),
      `${page.slug}: original ${tag} content and order`,
    );
  }
  checked++;
}
console.log(`Verified complete source text, headings, paragraphs, lists and tables for ${checked} CMS pages.`);
