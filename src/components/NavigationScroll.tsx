"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationScroll() {
  const pathname = usePathname();
  const query = useSearchParams().toString();

  useLayoutEffect(() => {
    // Explicit section links use Next.js/native hash scrolling instead.
    if (window.location.hash) return;

    const scrollToPageStart = () => {
      if (!window.location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };

    scrollToPageStart();
    // Run after Next.js has applied its own route scroll handling as well.
    const frame = window.requestAnimationFrame(scrollToPageStart);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, query]);

  return null;
}
