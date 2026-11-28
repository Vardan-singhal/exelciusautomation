import Link from "next/link";
import { categories, pageGroups } from "@/data/category-navigation.json";
import { SectionHeading } from "./Common";

type RelatedPage = { slug: string; url: string; heading: string };

export function equipmentLinks(slug: string, related: RelatedPage[]) {
  const group = (pageGroups as Record<string, string>)[slug];
  const category = categories.find(category => category.id === group);
  const links = new Map<string, { slug: string; href: string; label: string }>();
  for (const item of category?.sidebarItems || []) {
    if (item.slug !== slug) links.set(item.slug, { slug: item.slug, href: "/" + item.slug, label: item.label });
  }
  for (const page of related) {
    if (page.slug !== slug && !links.has(page.slug)) links.set(page.slug, { slug: page.slug, href: page.url, label: page.heading });
  }
  return [...links.values()];
}

export default function ProductEquipment({ slug, related }: { slug: string; related: RelatedPage[] }) {
  const links = equipmentLinks(slug, related);
  if (!links.length) return null;
  return (
    <section className="section soft">
      <div className="container">
        <SectionHeading label="PRODUCTS & EQUIPMENT" title="The detail behind the solution." />
        <div className="product-links">
          {links.map(item => (
            <Link key={item.slug} href={item.href}>
              <p className="display-h3">{item.label}</p>
              <span>Explore technical details</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
