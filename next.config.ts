import type { NextConfig } from "next";
const config: NextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/index.php", destination: "/", statusCode: 301 },
      { source: "/:path+/", destination: "/:path+", statusCode: 301 },
      {
        source: "/blog.php",
        destination: "/blogs",
        statusCode: 302,
        missing: [{ type: "query", key: "slug" }],
      },
      {
        source: "/blog",
        destination: "/blogs",
        statusCode: 302,
        missing: [{ type: "query", key: "slug" }],
      },
    ];
  },
  images: { formats: ["image/webp"], unoptimized: true },
  async rewrites() {
    return [
      {
        source: "/images/certificate/3.pdf",
        destination: "/images/certificate/certificate3.pdf",
      },
      {
        // Capture literal filenames, including spaces and parentheses.
        source:
          "/:imagePath((?:images|profile|admin)/.*\\.(?:png|jpe?g|avif|gif|svg|ico|bmp|tiff?))",
        destination: "/:imagePath.webp",
      },
    ];
  },
};
export default config;
