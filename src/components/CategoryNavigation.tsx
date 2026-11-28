"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { categories } from "@/data/category-navigation.json";
import { solutions } from "@/data/site";

export default function CategoryNavigation({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const pathname = usePathname().replace(/\.php$/, "");
  useEffect(() => { setOpen(null); }, [pathname, visible]);
  return (
    <div className="solution-menu-items">
      {solutions.map(solution => {
        const groups = categories.filter(category => solution.groups.includes(category.id));
        const id = solution.href.slice(1);
        return (
          <div key={id} className="solution-menu-group"
            onMouseEnter={() => setOpen(id)}
            onMouseLeave={() => setOpen(current => current === id ? null : current)}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(current => current === id ? null : current); }}
            onKeyDown={event => {
              if (event.key === "Escape" && open === id) {
                event.stopPropagation();
                triggers.current[id]?.focus();
                setOpen(null);
              }
            }}
          >
            <div className="solution-menu-label">
              <Link href={solution.href} aria-current={pathname === solution.href ? "page" : undefined}>
                <strong>{solution.title}</strong><span>{solution.short}</span>
              </Link>
              <button type="button" ref={element => { triggers.current[id] = element; }} aria-label={`Toggle ${solution.title} pages`} aria-expanded={open === id} aria-controls={`solution-pages-${id}`} onClick={() => setOpen(open === id ? null : id)}><ChevronDown size={18} /></button>
            </div>
            <div className="solution-submenu" id={`solution-pages-${id}`} hidden={open !== id}>
              {groups.map(category => (
                <div key={category.id}>
                  {groups.length > 1 && <p className="solution-submenu-title">{category.title}</p>}
                  <ul>
                    {category.items.map(item => <li key={item.slug}><Link href={"/" + item.slug} aria-current={pathname === "/" + item.slug ? "page" : undefined}>{item.label}</Link></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
