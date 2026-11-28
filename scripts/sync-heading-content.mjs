// Rebuild presentation HTML from the read-only PHP/CMS sources. No reports or assets are written.
import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio";

const pagesFile = "src/data/legacy.json";
const blogsFile = "src/data/blogs.json";
const pages = JSON.parse(fs.readFileSync(pagesFile));
const blogs = JSON.parse(fs.readFileSync(blogsFile));
const headings = "h1,h2,h3,h4,h5,h6";
const text = (value) => value.replace(/\s+/g, " ").trim();
const contract = {};

function clean(html) {
  const $ = load(html.replace(/<\?(?:php|=)?[\s\S]*?\?>/g, ""), null, false);
  // These elements also wrap editorial content and product tab labels in the CMS.
  $("header,footer,button").each((_, el) => $(el).replaceWith($(el).contents()));
  $("script,style,iframe,form,button,input,select,textarea,link,meta,header,footer,nav,.modal,.breadcrumb,.product-sidebar,.sidebar,.openModalBtn").remove();
  $("*").each((_, el) => {
    for (const name of Object.keys(el.attribs || {})) {
      if (!["href", "src", "alt", "colspan", "rowspan", "width", "height"].includes(name)) $(el).removeAttr(name);
    }
  });
  $("img").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (!src || src.includes("<")) return void $(el).remove();
    if (/^\.?\/?images\//.test(src)) $(el).attr("src", "/" + src.replace(/^\.?\//, ""));
    $(el).attr("loading", "lazy");
    if ($(el).attr("alt") === undefined) $(el).attr("alt", "");
  });
  $("a").each((_, el) => {
    let href = $(el).attr("href") || "";
    if (!href || href === "#" || href.includes("<") || /^javascript:/i.test(href)) return void $(el).replaceWith($(el).contents());
    href = href.replace(/^https:\/\/www\.exelciusautomation\.com(?=\/)/, "");
    if (!/^(https?:|mailto:|tel:|#|\/)/.test(href)) href = "/" + href;
    $(el).attr("href", href);
  });
  $(headings).each((_, el) => { if (!text($(el).text())) $(el).remove(); });
  return $;
}

for (const page of pages) {
  let source = page.content;
  if (!source) {
    const $ = load(fs.readFileSync(path.join("../Previous", page.file), "utf8").replace(/<\?(?:php|=)?[\s\S]*?\?>/g, ""));
    $("script,style").remove();
    source = $("section").map((_, el) => $.html(el)).get().join("\n");
  }
  const $ = clean(source);
  const first = $("h1").first();
  const primary = text(first.text()) || text(page.heading);
  // CMS pages render their complete article, including its H1, below the product image.
  // Static templates still supply their primary title through PageHero.
  if (!page.content) {
    first.remove();
    $("h1").each((_, el) => { el.tagName = "h2"; });
  }
  const outline = [
    ...(!page.content || !$("h1").length ? [{ tag: "h1", text: primary }] : []),
    ...$(headings).toArray().map(el => ({ tag: el.tagName, text: text($(el).text()) })),
  ];
  contract[page.slug] = { primary, outline };
  page.html = $.html();
}
for (const blog of blogs) {
  const $ = clean(blog.description);
  // The PHP blog template also repeats a CMS H1 inside the article on 12 posts.
  // Retain that wording as body text, with the original blog title as the sole H1.
  $("h1").each((_, el) => { el.tagName = "p"; });
  contract["blog:" + blog.slug] = {
    primary: blog.title,
    outline: [{ tag: "h1", text: blog.title }, ...$(headings).toArray().map(el => ({ tag: el.tagName, text: text($(el).text()) }))],
  };
  blog.html = $.html();
}
const newestBlogs = [...blogs].sort((a, b) => b.blog_date.localeCompare(a.blog_date) || Number(b.id) - Number(a.id));
const homeBlogSection = contract[""].outline.findIndex((heading) => heading.text === "Our Blogs");
contract[""].outline.splice(homeBlogSection + 1, 0, ...newestBlogs.slice(0, 8).map(blog => ({ tag: "h4", text: text(blog.title) })));
contract.blogs.outline = [contract.blogs.outline[0], ...newestBlogs.map(blog => ({ tag: "h3", text: text(blog.title) }))];
fs.writeFileSync(pagesFile, JSON.stringify(pages, null, 2) + "\n");
fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2) + "\n");
fs.writeFileSync("src/data/source-headings.json", JSON.stringify(contract, null, 2) + "\n");

const $ = load(fs.readFileSync("../Previous/index.php", "utf8").replace(/<\?(?:php|=)?[\s\S]*?\?>/g, ""));
const picture = (el) => ({ src: "/" + $(el).find("img").first().attr("src"), alt: $(el).find("img").first().attr("alt") || "" });
const home = {
  primary: contract[""].primary,
  introduction: text($(".about-wrap p").text()),
  introductionPoints: $(".about-wrap .check-list li").toArray().map(el => text($(el).text())),
  blogExcerpts: Object.fromEntries(newestBlogs.slice(0, 8).map(blog => {
    const excerpt = text(load(blog.description).text());
    return [blog.slug, excerpt.length > 120 ? [...excerpt].slice(0, 120).join("") + "..." : excerpt];
  })),
  industries: $(".product-gallery .grid-box").toArray().map(el => ({ title: text($(el).find("h3").text()), detailTitle: text($(el).find("h4").text()), description: text($(el).find("p").text()), ...picture(el) })),
  services: $(".productsection .productbox").toArray().map(el => ({ title: text($(el).find("h4").text()), description: text($(el).find("p").text()), ...picture(el) })),
  partners: $(".partnerx-card").toArray().map(picture),
  advantages: $(".Why_choose_section .choose_box").toArray().map(el => ({ title: text($(el).find("h4").text()), description: text($(el).find("p").text()) })),
  projectHtml: clean($(".project_bg-section").html() || "").html().replace(/<h3\b[^>]*>[\s\S]*?<\/h3>/i, ""),
};
fs.writeFileSync("src/data/home-content.json", JSON.stringify(home, null, 2) + "\n");
console.log(`Restored source heading content for ${pages.length} pages and ${blogs.length} blogs; extracted homepage sections.`);
