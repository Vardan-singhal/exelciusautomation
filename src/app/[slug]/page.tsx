import { notFound } from "next/navigation";
import {
  AboutPage,
  BlogPage,
  BlogsPage,
  CareerPage,
  ContactPage,
  GalleryPage,
  ProductPage,
  SolutionPage,
} from "@/components/DetailPages";
import { solutions } from "@/data/site";
import {
  findPage,
  findBlog,
  getCanonical,
  getMetadata,
  getSchemas,
  jsonLd,
  pages,
  blogs,
} from "@/lib/content";
import Link from "next/link";
import Home from "@/components/Home";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ slug?: string; project?: string; view?: string }>;
};
export async function generateMetadata({ params, searchParams }: Props) {
  let { slug } = await params;
  const query = await searchParams;
  slug = slug.replace(/\.php$/, "");
  const blogQuery = slug === "blog" && !!query.slug;
  const homeQuery = slug === "page" && (!query.slug || query.slug === "index");
  if (["blog", "page"].includes(slug) && query.slug) slug = query.slug;
  if (homeQuery) slug = "";
  return getMetadata(slug, blogQuery);
}
export default async function Page({ params, searchParams }: Props) {
  let { slug } = await params;
  const query = await searchParams;
  slug = slug.replace(/\.php$/, "");
  const blogQuery = slug === "blog" && !!query.slug;
  const homeQuery = slug === "page" && (!query.slug || query.slug === "index");
  if (["blog", "page"].includes(slug) && query.slug) slug = query.slug;
  if (homeQuery) slug = "";
  let content;
  if (!slug) content = <Home />;
  else if (blogQuery && findBlog(slug)) content = <BlogPage slug={slug} />;
  else if (slug === "about-us") content = <AboutPage />;
  else if (slug === "contact") content = <ContactPage />;
  else if (slug === "career") content = <CareerPage />;
  else if (slug === "blogs") content = <BlogsPage />;
  else if (slug === "gallery")
    content = <GalleryPage project={query.project} view={query.view} />;
  else if (slug === "sitemap.html")
    content = (
      <section className="section container">
        <h1>Website sitemap</h1>
        <div className="product-links">
          {pages.map((p) => (
            <Link key={p.url} href={p.url}>
              {p.title}
            </Link>
          ))}
          {blogs.map((b) => (
            <Link key={b.slug} href={"/blog.php?slug=" + b.slug}>
              {b.title}
            </Link>
          ))}
        </div>
      </section>
    );
  else {
    const solution = solutions.find((s) => s.href === "/" + slug);
    if (solution) content = <SolutionPage solution={solution} />;
    else if (findPage(slug)) content = <ProductPage slug={slug} />;
    else if (findBlog(slug)) content = <BlogPage slug={slug} />;
    else notFound();
  }
  const schemas = blogQuery ? [] : getSchemas(slug);
  const blog = blogQuery || !findPage(slug) ? findBlog(slug) : undefined;
  if (blog && !schemas.some((s) => s["@type"] === "Article"))
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: blog.title,
      datePublished: blog.blog_date,
      author: { "@type": "Person", name: blog.admin_name },
      publisher: {
        "@type": "Organization",
        name: "Exelcius Automation Private Limited",
      },
    });
  return (
    <>
      <link rel="canonical" href={getCanonical(slug, blogQuery)} />
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(s) }}
        />
      ))}
      {content}
    </>
  );
}
