import fs from "node:fs";
import assert from "node:assert/strict";
import { load } from "cheerio";

const base = process.env.VERIFY_URL || "http://127.0.0.1:3000";
const source = JSON.parse(fs.readFileSync("src/data/source-headings.json"));
const pages = JSON.parse(fs.readFileSync("src/data/legacy.json"));
const blogs = JSON.parse(fs.readFileSync("src/data/blogs.json"));
const normalize = value => value.replace(/\s+/g, " ").trim();
const outline = $ => $("h1,h2,h3,h4,h5,h6").toArray().map(el => ({ tag: el.tagName, text: normalize($(el).text()) }));
const footer = outline(load(fs.readFileSync("../Previous/frame/footer.php", "utf8").replace(/<\?(?:php|=)?[\s\S]*?\?>/g, "")));
const cases = [
  ...pages.map(page => ({ route: page.url, key: page.slug })),
  ...pages.filter(page => page.slug).map(page => ({ route: "/" + page.slug + ".php", key: page.slug })),
  ...blogs.map(blog => ({ route: "/blog.php?slug=" + blog.slug, key: "blog:" + blog.slug })),
  ...blogs.filter(blog => !pages.some(page => page.slug === blog.slug)).map(blog => ({ route: "/" + blog.slug, key: "blog:" + blog.slug })),
  ...pages.map(page => ({ route: "/page.php?slug=" + (page.slug || "index"), key: page.slug })),
];
const issues = [];
for (let i = 0; i < cases.length; i += 5) {
  await Promise.all(cases.slice(i, i + 5).map(async ({ route, key }) => {
    try {
      const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
      assert.equal(response.status, 200);
      const $ = load(await response.text());
      const actual = outline($);
      assert.equal($("h1").length, 1, "One primary H1 required");
      const expected = [...source[key].outline, ...footer];
      const mismatch = actual.findIndex((heading, index) => JSON.stringify(heading) !== JSON.stringify(expected[index]));
      if (mismatch !== -1 || actual.length !== expected.length) {
        const index = mismatch === -1 ? actual.length : mismatch;
        throw new Error(JSON.stringify({ index, actual: actual[index], expected: expected[index], actualCount: actual.length, expectedCount: expected.length }));
      }
    } catch (error) {
      issues.push({ route, error: error.message });
    }
  }));
}
console.log(JSON.stringify({ routesChecked: cases.length, sourcePages: pages.length, publishedBlogs: blogs.length, issueCount: issues.length, issues: issues.slice(0, 10) }, null, 2));
if (issues.length) process.exitCode = 1;
