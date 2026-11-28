"use client";
import { useEffect, useRef, useState } from "react";
import Image from "./SiteImage";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import CategoryNavigation from "./CategoryNavigation";
export default function Header() {
  const [mobile, setMobile] = useState(false),
    [mega, setMega] = useState(false);
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);
  const solutionsTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setMobile(false);
    setMega(false);
  }, [path]);
  useEffect(() => {
    function dismiss(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setMega(false);
    }
    document.addEventListener("click", dismiss);
    return () => document.removeEventListener("click", dismiss);
  }, []);
  return (
    <header
      className="header"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          if (mega) solutionsTrigger.current?.focus();
          else if (mobile) mobileTrigger.current?.focus();
          setMobile(false);
          setMega(false);
        }
      }}
    >
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Exelcius Automation home">
          <Image
            src="/images/logo/logo.webp"
            alt="Exelcius Automation"
            width={106}
            height={76}
            priority
          />
        </Link>
        <nav
          id="primary-navigation"
          className={mobile ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) {
              setMobile(false);
              setMega(false);
            }
          }}
        >
          <Link href="/" aria-current={path === "/" ? "page" : undefined}>
            Home
          </Link>
          <Link href="/about-us">About Us</Link>
          <div className="solutions-nav">
            <button
              ref={solutionsTrigger}
              aria-expanded={mega}
              aria-controls="solutions-menu"
              onClick={() => setMega(!mega)}
            >
              Solutions <ChevronDown size={14} />
            </button>
            <div id="solutions-menu" className="mega" hidden={!mega}>
              <div>
                <span className="eyebrow">CONNECTED CAPABILITIES</span>
                <p className="display-h3 mega-title">Engineering for the whole system.</p>
                <p>
                  From field devices to control rooms. From power to
                  performance.
                </p>
              </div>
              <CategoryNavigation visible={mega} />
            </div>
          </div>
          <Link href="/gallery?view=projects">Projects</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/blogs">Blogs</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link href="/contact#enquiry" className="button header-cta">
          Discuss Your Project
        </Link>
        <button
          ref={mobileTrigger}
          className="menu-toggle"
          aria-controls="primary-navigation"
          aria-label={mobile ? "Close navigation" : "Open navigation"}
          aria-expanded={mobile}
          onClick={() => setMobile(!mobile)}
        >
          {mobile ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
