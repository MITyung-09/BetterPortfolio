"use client";

import { useState } from "react";
import Media from "@/components/media/Media";
import { categoryLabels, projects } from "@/data/projects";
import type { Category } from "@/types";

// First letters of the name, used on the cover when a project has no screenshot yet.
const monogram = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

export default function ProjectBrowser() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const shown = projects.filter((p) => filter === "all" || p.categories.includes(filter));
  const filters: (Category | "all")[] = ["all", "desktop", "game"];

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {filters.map((f) => (
          <button key={f} type="button" className="btn small" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "Everything" : categoryLabels[f]}
          </button>
        ))}
      </div>

      {shown.map((p, i) => (
        <article key={p.id} className={`feature ${i % 2 ? "flip" : ""}`}>
          <div className="featureMedia">
            {p.media?.[0] ? <Media item={p.media[0]} /> : (
              <div className={`cover c${i % 4}`} aria-hidden="true">
                {monogram(p.name)}
                <small>{p.categories.map((c) => categoryLabels[c]).join(" · ")}</small>
              </div>
            )}
          </div>
          <div className="featureBody">
            <p><span className="idx">0{i + 1}</span><span className="status">{p.status}</span></p>
            <h3>{p.name}</h3>
            <p className="desc">{p.summary}</p>
            {p.details && <ul className="points">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>}
            <ul className="chips">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="links">
              {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
              {p.liveDemo && <a href={p.liveDemo} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
            </p>
          </div>
        </article>
      ))}
    </>
  );
}
