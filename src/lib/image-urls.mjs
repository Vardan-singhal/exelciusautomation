import manifest from "../data/image-manifest.json" with { type: "json" };

const localHosts = new Set([
  "www.exelciusautomation.com",
  "exelciusautomation.com",
]);
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

/** Resolve authored image references to the byte-capped public WebP asset.
 * @param {string} source
 * @returns {string}
 */
export function imageSrc(source) {
  const direct = manifest[source];
  if (direct) return encodePath(direct);
  try {
    const url = new URL(source, "https://www.exelciusautomation.com/");
    if (!localHosts.has(url.hostname)) return source;
    const target = manifest[decodeURIComponent(url.pathname)];
    if (!target) return source;
    const prefix = /^https?:\/\//i.test(source) ? url.origin : "";
    return prefix + encodePath(target) + url.search + url.hash;
  } catch {
    return source;
  }
}

/** Preserve all HTML, text, dimensions and attributes except asset URLs.
 * @param {string} html
 * @returns {string}
 */
export function imageHtml(html) {
  return html.replace(
    /(\b(?:src|href|poster)\s*=\s*)(["'])(.*?)\2/gi,
    (match, prefix, quote, source) => {
      const target = imageSrc(source.replaceAll("&amp;", "&"));
      if (target === source) return match;
      return (
        prefix +
        quote +
        target
          .replaceAll("&", "&amp;")
          .replaceAll(quote, quote === '"' ? "&quot;" : "&#39;") +
        quote
      );
    },
  );
}

/** Rewrite image URLs in structured data without altering other values.
 * @param {any} value
 * @returns {any}
 */
export function imageData(value) {
  if (typeof value === "string") return imageSrc(value);
  if (Array.isArray(value)) return value.map(imageData);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, imageData(entry)]),
    );
  return value;
}
