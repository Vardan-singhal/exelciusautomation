"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "./SiteImage";
import { clients } from "@/data/home-credentials.json";
import "./HomeCredentials.css";

export default function ClientSlider() {
  const track = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function advance(direction: number) {
    const element = track.current;
    if (!element) return;
    const step = (element.firstElementChild as HTMLElement)?.offsetWidth + 20;
    const end = element.scrollWidth - element.clientWidth;
    const next = direction > 0 && element.scrollLeft >= end - 2
      ? 0
      : direction < 0 && element.scrollLeft <= 2
        ? end
        : element.scrollLeft + direction * step;
    element.scrollTo({ left: next, behavior: reducedMotion ? "instant" : "smooth" });
  }

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) advance(1);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [paused, hovered, focused, reducedMotion]);

  return (
    <section
      className="section container home-clients"
      aria-labelledby="home-clients-heading"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="section-heading-row">
        <div className="section-heading">
          <span className="eyebrow">TRUSTED ACROSS INDUSTRY & INFRASTRUCTURE</span>
          <h3 className="section-title" id="home-clients-heading">Our Prestigious Clients</h3>
        </div>
        <div className="client-slider-controls">
          <button type="button" onClick={() => advance(-1)} aria-label="Previous clients" aria-controls="home-client-logos"><ChevronLeft size={20} /></button>
          {!reducedMotion && <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Start client slideshow" : "Pause client slideshow"} aria-pressed={paused}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>}
          <button type="button" onClick={() => advance(1)} aria-label="Next clients" aria-controls="home-client-logos"><ChevronRight size={20} /></button>
        </div>
      </div>
      <ul className="home-client-track" id="home-client-logos" ref={track} tabIndex={0} aria-label="Client logos; scroll to view all clients">
        {clients.map((client) => (
          <li key={client.src}>
            <Image src={client.src} alt={client.alt} width={210} height={110} />
          </li>
        ))}
      </ul>
    </section>
  );
}
