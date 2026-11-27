# Exelcius Automation frontend

Next.js App Router, TypeScript, React and custom CSS. All development is isolated here; `../Previous` and `../PPT` are read-only references. There is no PHP execution, database connection, submission API or production integration.

## Run locally

Requires Node.js 20.9 or later.

```powershell
cd 'F:\Arka Technovation Projects\exelciusautomation\New'
npm ci
npm run dev
```

Open the URL printed by Next.js. For the production build:

```powershell
npm run build
npm run start
```

## Content and routes

- `src/data/legacy.json`: 57 source page records, complete technical content and source references.
- `src/data/blogs.json`: all 30 published articles. Twelve share a slug with a physical PHP page; the root URL preserves the physical page and `blog.php?slug=...` preserves the separate database article.
- `src/data/seo.json`: recorded live titles, descriptions, exact canonical strings and existing JSON-LD.
- `src/data/seo-config.json`: original CMS Open Graph configuration and robots directives.
- `src/data/pageBanners.ts`: supplied banners mapped to the five solution pages, About, Blogs, Contact, Gallery and the Projects view on their existing URLs.
- `src/data/site.ts`: curated solution presentation, sourced portfolio records, industries, client logos and video configuration.
- `src/data/contact.json`: verified phone, WhatsApp, email, address and social links.
- `src/data/testimonials.json`: original wording and attribution extracted from `index.php`.

Existing case-sensitive root paths and `.php` aliases are handled by `src/app/[slug]/page.tsx`. Blog and page query URLs are supported. The pre-existing `index.php` redirect remains a 301. Blog URLs without a slug retain their listing redirect. Project views use the existing `/gallery` route with query parameters; no competing project slug tree was created. The five solution presentations reuse existing public routes.

Canonical links render as React resource links, which places them in the document head while preserving exact strings. Next.js Metadata otherwise normalizes the homepage trailing slash and relative canonical strings. Two legacy relative canonicals and other questionable source metadata are intentionally preserved for the SEO team's review.

Original `robots.txt`, sitemap XML, verification HTML and RSS are copied unchanged. The old sitemap's missing `/images/certificate/3.pdf` is served through an internal rewrite to the existing `certificate3.pdf` linked from the original About page. No certificate content was changed.

## Enquiries and hero banners

The form uses native validation and prepares a `mailto:` draft; the user reviews and sends it in their email app. No success or delivery claim is made. Phone and WhatsApp links are functional alternatives. Career enquiries use email with a résumé attached by the applicant.

The homepage uses the four supplied images in `public/images/new_banners/`, ordered by filenames 1, 2, 3 and 4. `src/components/HeroMedia.tsx` controls the slider, with a three-second interval and left/right navigation buttons. The banner height fits the available viewport below the measured header; the complete image scales down without cropping, and subsequent content follows immediately. The former dots/play control bar has been removed. The existing heading, description and CTA links appear only on the first banner; the other three show their original artwork without added copy or shading. Autoplay pauses during hover, keyboard focus or a hidden browser tab, and is disabled for reduced-motion preferences. Keyboard users can navigate with Left/Right or pause with Space on the carousel. This slider replaces the earlier video placeholder.

## Audit and checks

### WebP image budget

All public image assets are WebP and strictly below 500,000 bytes. Every production build checks the format and byte limit and rejects non-compliant uploads. Pixel dimensions, transparency, component sizes and crop positions are retained. `SiteImage` resolves authored image paths through `src/data/image-manifest.json`; the same resolver updates legacy HTML, metadata images, structured data and the favicon. Pre-encoded assets are served directly through Next/Image so a second encoding or upscale cannot exceed the byte cap. Inline interface icons remain code; the select control's embedded image is also WebP.

Original images are backed up outside the public site under `audit/image-originals/`. Existing PNG/JPEG/AVIF/ICO URLs are served through internal rewrites to their converted images, preserving old links. Four supplier images used in the SCADA content are cached locally from their original URLs. PDFs are unchanged.

After adding or replacing images, run `npm run images:optimize` and `npm run images:verify`. The optimizer retains dimensions, adjusts WebP quality to meet the limit and fails rather than silently resize an image. `npm run images:verify-delivery` checks every current image URL and legacy alias against a running production server; `VERIFY_URL` selects its address. The conversion report is `audit/image-optimization-report.json`. `npm run audit` also reapplies image optimization after restoring legacy source assets.

`audit/` includes the full 46-slide transcript, slide-to-image mapping, visual contact sheets, content and asset inventories, URL inventory, database structure summary, published source records, live crawl and source file checksums. Private admin, applicant and enquiry records are not included in frontend data or public assets.

```powershell
npm run check
npm audit
npm run verify
```

`verify` expects the production server at `http://127.0.0.1:3000`; set `VERIFY_URL` to use another local address. It checks routes, PHP and query aliases, source metadata and schema, retained text, linked assets, internal links, SEO files, original checksums and 404 behavior. PDF resources are checked as documents rather than HTML pages.

`npm run audit` rebuilds derived content from the supplied source and recorded crawl. It overwrites derived JSON; keep authored presentation changes in `site.ts` and components. `npm run crawl` refreshes the read-only production crawl; then run `node scripts/sync-seo.mjs` to update the SEO snapshot deliberately.

The in-app browser was unavailable during implementation. Visual responsive QA, interaction testing in a browser, and measured Lighthouse/Core Web Vitals checks remain required before production replacement. No deployment or domain changes were performed.
