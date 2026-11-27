import type { Metadata } from "next";
import rawPages from "@/data/legacy.json";
import rawBlogs from "@/data/blogs.json";
import seo from "@/data/seo.json";
import seoConfig from "@/data/seo-config.json";
import sourcePresentation from "@/data/source-presentation.json";
import sourceHeadings from "@/data/source-headings.json";
import { siteUrl, solutions } from "@/data/site";
import { imageHtml, imageSrc, imageData } from "./image-urls.mjs";
type SourcePresentation = {
  images: { src: string; alt: string; width?: number; height?: number; unavailable?: boolean }[];
  subtitle?: string;
};
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
function retainedPresentation(slug: string) {
  const source = (sourcePresentation as Record<string, SourcePresentation>)[slug];
  if (!source) return "";
  const images = source.images.filter((image) => !image.unavailable).map((image) =>
    `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">`,
  ).join("\n");
  return images + (source.subtitle ? `<p>${escapeHtml(source.subtitle)}</p>` : "");
}
export const pages = rawPages.map((page) => ({
  ...page,
  heading: (sourceHeadings as Record<string, { primary: string }>)[page.slug].primary,
  html: imageHtml(retainedPresentation(page.slug) + page.html),
}));
export const blogs = rawBlogs.map((blog) => ({
  ...blog,
  html: imageHtml(blog.html),
}));
export function findPage(slug: string) {
  return pages.find((p) => p.slug === slug.replace(/\.php$/, ""));
}
export function findBlog(slug: string) {
  return blogs.find((b) => b.slug === slug);
}
export function getCanonical(slug: string, blogQuery = false) {
  const p = findPage(slug),
    b = findBlog(slug);
  const url = siteUrl + (slug ? "/" + slug : "/");
  const live = seo.find(
    (s) => s.url === (blogQuery ? siteUrl + "/blog.php?slug=" + slug : url),
  );
  return (
    live?.canonical ||
    (blogQuery ? b?.canonical_url : p?.canonical || b?.canonical_url) ||
    url
  );
}
export function getMetadata(slug: string, blogQuery = false): Metadata {
  if (slug === "sitemap.html")
    return {
      title: "Sitemap",
      description: "www.exelciusautomation.com Sitemap",
    };
  const p = blogQuery ? undefined : findPage(slug),
    b = findBlog(slug);
  const url = siteUrl + (slug ? "/" + slug : "/");
  const live = seo.find(
    (s) => s.url === (blogQuery ? siteUrl + "/blog.php?slug=" + slug : url),
  );
  const title =
    live?.title ||
    p?.title ||
    b?.meta_title ||
    b?.title ||
    "Exelcius Automation";
  const canonical = getCanonical(slug, blogQuery);
  const config = blogQuery
    ? undefined
    : seoConfig.find((s) => s.slug === (slug || "index"));
  const og = Object.fromEntries(
    ((live?.openGraph || []) as { property: string; content: string }[]).map(
      (v) => [v.property, v.content],
    ),
  );
  return {
    title,
    description:
      live?.description || p?.description || b?.meta_description || undefined,
    keywords: p?.keywords || b?.meta_keywords || undefined,
    robots: live?.robots || config?.robots || undefined,
    ...(og["og:title"] || config?.og_title
      ? {
          openGraph: {
            title: og["og:title"] || config?.og_title || title,
            description:
              og["og:description"] || config?.og_description || undefined,
            url: og["og:url"] || canonical,
            type: og["og:type"] === "article" ? "article" : "website",
            images: og["og:image"]
              ? [imageSrc(og["og:image"])]
              : config?.og_image
                ? [imageSrc(config.og_image)]
                : undefined,
          },
        }
      : {}),
  };
}
export function getSchemas(slug: string) {
  const url = siteUrl + (slug ? "/" + slug : "/");
  const s = seo.find((s) => s.url === url);
  const schemas = (s?.schemas || []).flatMap((raw) => {
    try {
      return [JSON.parse(raw)];
    } catch {
      return [];
    }
  });
  if (!slug)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Exelcius Automation",
      url: siteUrl + "/",
    });
  else {
    const p = findPage(slug),
      b = findBlog(slug);
    if (p || b)
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl + "/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: p?.heading || b?.title,
            item: url,
          },
        ],
      });
    const solution = solutions.find((s) => s.href === "/" + slug);
    if (solution)
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        name: solution.title,
        description: solution.description,
        url,
        provider: {
          "@type": "Organization",
          name: "Exelcius Automation Private Limited",
        },
      });
    else if (
      p &&
      [
        "industrial-automation",
        "electrical-solutions",
        "infrastructure-solutions",
        "highway-solutions",
        "lfp-batteries",
        "solar-solutions",
      ].includes(p.group)
    )
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.heading,
        description: p.description,
        url,
      });
  }
  return imageData(schemas) as typeof schemas;
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
