import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
const old = path.resolve("../Previous");
const pages = JSON.parse(fs.readFileSync("src/data/legacy.json"));
const blogs = JSON.parse(fs.readFileSync("src/data/blogs.json"));
const base = "https://www.exelciusautomation.com";
function clean(html) {
  html = html.replace(/<\?(?:php|=)?[\s\S]*?\?>/g, "");
  const $ = cheerio.load(html, null, false);
  $(
    "script,style,iframe,form,button,input,select,textarea,link,meta,header,footer,nav,.modal,.breadcrumb,.product-sidebar,.sidebar,.openModalBtn",
  ).remove();
  $("*").each((_, el) => {
    for (const a of Object.keys(el.attribs || {}))
      if (
        ![
          "href",
          "src",
          "alt",
          "colspan",
          "rowspan",
          "width",
          "height",
        ].includes(a)
      )
        $(el).removeAttr(a);
  });
  $("h1").each((_, e) => {
    e.tagName = "h2";
  });
  $("img").each((_, e) => {
    let s = $(e).attr("src") || "";
    if (!s || s.includes("<")) {
      $(e).remove();
      return;
    }
    s = s.replace(/^\.\//, "").replace(/^\//, "");
    if (s.startsWith("images/")) $(e).attr("src", "/" + s);
    $(e).attr("loading", "lazy");
    if (!$(e).attr("alt")) $(e).attr("alt", "Exelcius Automation equipment");
  });
  $("a").each((_, e) => {
    let h = $(e).attr("href") || "";
    if (!h || h === "#" || h.includes("<") || /^javascript:/i.test(h)) {
      $(e).replaceWith($(e).contents());
      return;
    }
    if (h.startsWith(base)) h = h.slice(base.length) || "/";
    if (!/^(https?:|mailto:|tel:|#|\/)/.test(h)) h = "/" + h;
    $(e).attr("href", h);
  });
  return $.html();
}
for (const p of pages) {
  let html = p.content;
  if (!html) {
    let source =
      p.staticHtml || fs.readFileSync(path.join(old, p.file), "utf8");
    let $ = cheerio.load(source.replace(/<\?(?:php|=)?[\s\S]*?\?>/g, ""));
    $("script,style").remove();
    html = $("section")
      .map((_, e) => $.html(e))
      .get()
      .join("\n");
  }
  p.html = clean(html);
  delete p.staticHtml;
}
for (const b of blogs) {
  b.html = clean(b.description);
  let raw = b.featured_image || "";
  b.image = raw.includes("/")
    ? "/" + raw.replace(/^\//, "")
    : "/admin/assets/uploads/blogs/" + raw;
  if (!fs.existsSync(path.join(old, b.image.slice(1))))
    b.image = "/images/banner/blog-banner.jpeg";
}
fs.writeFileSync("src/data/legacy.json", JSON.stringify(pages, null, 2));
fs.writeFileSync("src/data/blogs.json", JSON.stringify(blogs, null, 2));
fs.mkdirSync("public", { recursive: true });
fs.cpSync(path.join(old, "images"), "public/images", { recursive: true });
fs.mkdirSync("public/admin/assets/uploads/blogs", { recursive: true });
fs.cpSync(
  path.join(old, "admin/assets/uploads/blogs"),
  "public/admin/assets/uploads/blogs",
  { recursive: true },
);
for (const f of [
  "robots.txt",
  "sitemap.xml",
  "sitemap_old.xml",
  "feed.rss",
  "google6320934e2159964d.html",
  "llms.txt",
])
  if (fs.existsSync(path.join(old, f)))
    fs.copyFileSync(path.join(old, f), "public/" + f);
fs.mkdirSync("public/profile", { recursive: true });
const media = [
  "image9.png",
  "image10.png",
  "image26.png",
  "image36.png",
  "image37.png",
  "image39.png",
  "image40.png",
  "image55.png",
  "image58.jpeg",
  "image60.jpeg",
  "image61.jpeg",
  "image62.jpeg",
  "image63.jpeg",
  "image64.jpeg",
  "image65.jpeg",
  "image68.jpeg",
  "image71.png",
  "image82.png",
  "image84.png",
  "image85.png",
  "image86.png",
  "image87.png",
  "image88.png",
  "image89.png",
  "image93.png",
  "image94.png",
  "image95.png",
  "image97.png",
];
for (const f of media)
  fs.copyFileSync("audit/ppt-media/" + f, "public/profile/" + f);
// Source-attributed testimonials, preserving words and names.
const $ = cheerio.load(fs.readFileSync(path.join(old, "index.php"), "utf8"));
const testimonials = $(".ex-testimonial-card")
  .map((_, e) => ({
    text: $(e).find(".ex-testimonial-text").text().replace(/\s+/g, " ").trim(),
    name: $(e).find(".ex-client-name").text().trim(),
    roles: $(e)
      .find(".ex-client-profession")
      .map((_, r) => $(r).text().trim())
      .get(),
    image: "/" + $(e).find("img").attr("src"),
  }))
  .get();
fs.writeFileSync(
  "src/data/testimonials.json",
  JSON.stringify(testimonials, null, 2),
);
console.log(
  `Prepared ${pages.length} pages, ${blogs.length} articles, ${testimonials.length} testimonials; source assets copied without alterations.`,
);
