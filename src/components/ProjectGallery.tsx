"use client";
import { useState } from "react";
import Image from "./SiteImage";
import Link from "next/link";
import { projects } from "@/data/site";
export default function ProjectGallery() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  return (
    <>
      <div className="filter-bar" aria-label="Filter projects">
        {categories.map((c) => (
          <button
            key={c}
            className={filter === c ? "active" : ""}
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="portfolio-grid">
        {projects
          .filter((p) => filter === "All" || filter === p.category)
          .map((p) => (
            <Link
              key={p.id}
              href={"/gallery?project=" + p.id}
              className={"project-card" + (!p.image ? " text-project" : "")}
            >
              {p.image && (
                <div className="project-image">
                  <Image
                    src={p.image}
                    alt={
                      p.name +
                      (p.id === "tunnel-systems"
                        ? " — technical SCADA interface"
                        : p.id === "hindalco"
                          ? " — customer testimonial portrait"
                          : " — source photographs")
                    }
                    fill
                    sizes="(max-width: 760px) 100vw, 50vw"
                  />
                  <span>{p.status}</span>
                </div>
              )}
              <div className="project-copy">
                <span className="eyebrow">{p.category}</span>
                <p className="display-h2">{p.name}</p>
                {!p.image && <small>{p.status}</small>}
                <p>{p.description}</p>
                <span className="text-link">View Project</span>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
}
