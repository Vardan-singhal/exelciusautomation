"use client";

import Image from "./SiteImage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import "./HeroSlider.css";

const banners = [
  {
    src: "/images/new_banners/hero section -1.png",
    alt: "Industrial automation, highway, tunnel and solar engineering illustration",
  },
  {
    src: "/images/new_banners/hero section -2.png",
    alt: "Powering progress with smarter solar. Engineered solar systems, reliable energy and end-to-end support.",
  },
  {
    src: "/images/new_banners/hero section -3.png",
    alt: "Clean Energy for a Smarter Tomorrow. Industrial, commercial and infrastructure solar solutions.",
  },
  {
    src: "/images/new_banners/hero section -4.png",
    alt: "Sustainable Solar Solutions. Reliable, efficient and future-ready.",
  },
];
const SLIDE_INTERVAL = 3000;

export default function HeroMedia({ children }: { children: ReactNode }) {
  const carousel = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".header");
    const mobileBar = document.querySelector<HTMLElement>(".mobile-conversion");
    const updateHeight = () => {
      carousel.current?.style.setProperty(
        "--hero-header-height",
        `${header?.getBoundingClientRect().height ?? 95}px`,
      );
      carousel.current?.style.setProperty(
        "--hero-mobile-bar-height",
        `${mobileBar?.getBoundingClientRect().height ?? 0}px`,
      );
    };
    const observer = new ResizeObserver(updateHeight);
    if (header) observer.observe(header);
    if (mobileBar) observer.observe(mobileBar);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion || !pageVisible) return;
    const timer = window.setTimeout(() => {
      setActive((slide) => (slide + 1) % banners.length);
    }, SLIDE_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [active, paused, hovered, focused, reducedMotion, pageVisible]);

  const changeSlide = (direction: number) =>
    setActive((slide) => (slide + direction + banners.length) % banners.length);

  return (
    <section
      ref={carousel}
      className="hero hero-slider"
      aria-label="Exelcius engineering and solar solutions"
      aria-roledescription="carousel"
      aria-description="Use the left and right controls to change banners. Automatic rotation pauses on hover or keyboard focus. Press Space while this carousel is focused to pause or resume rotation."
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          changeSlide(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          changeSlide(1);
        }
        if (event.key === " " && event.target === event.currentTarget) {
          event.preventDefault();
          setPaused((value) => !value);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
    >
      <div className="hero-artwork">
        {banners.map((banner, index) => (
          <div
            key={banner.src}
            id={`hero-banner-${index + 1}`}
            className={`hero-banner${active === index ? " is-active" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${banners.length}`}
            aria-hidden={active !== index}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              sizes="100vw"
              preload={index === 0}
              loading={index === 0 ? undefined : "lazy"}
            />
          </div>
        ))}
        <div
          className={`hero-shade hero-first-shade${active === 0 ? " is-active" : ""}`}
          aria-hidden="true"
        />
        <div
          className={`hero-intro${active === 0 ? " is-active" : ""}`}
          aria-hidden={active !== 0}
          inert={active !== 0}
        >
          {children}
        </div>
      </div>
      <button
        type="button"
        className="hero-slider-arrow hero-slider-previous"
        aria-label="Previous banner"
        onClick={() => changeSlide(-1)}
      >
        <ChevronLeft size={26} />
      </button>
      <button
        type="button"
        className="hero-slider-arrow hero-slider-next"
        aria-label="Next banner"
        onClick={() => changeSlide(1)}
      >
        <ChevronRight size={26} />
      </button>
    </section>
  );
}
