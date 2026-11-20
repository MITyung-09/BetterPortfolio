"use client";

import { useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { artCategoryLabels, artworks } from "@/data/artworks";
import type { ArtCategory } from "@/types";
import Lightbox from "./Lightbox";

export default function ArtGallery() {
  const [filter, setFilter] = useState<ArtCategory | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const shown = artworks.filter((a) => filter === "all" || a.category === filter);
  const categories = [...new Set(artworks.map((a) => a.category))];

  if (artworks.length === 0) {
    return <EmptyState labels={["Sketches", "Paintings", "Digital"]} text="Sketches, drawings and paintings will show up here. Add them in src/data/artworks.ts." />;
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="filters" role="group" aria-label="Filter artwork">
          {(["all", ...categories] as const).map((c) => (
            <button key={c} type="button" className="btn small" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c === "all" ? "All" : artCategoryLabels[c]}
            </button>
          ))}
        </div>
      )}
      <div className="masonry">
        {shown.map((a, i) => (
          <figure key={a.id} className="artTile">
            <button type="button" className="artItem" onClick={() => setOpenIndex(i)} aria-label={`Open ${a.title} full size`} data-cursor="view" data-cursor-label="View">
              <img src={a.src} alt={a.alt ?? a.title} loading="lazy" decoding="async" />
            </button>
            <figcaption className="artLabel">
              <strong>{a.title}</strong>
              <span>{artCategoryLabels[a.category]}{a.year && ` · ${a.year}`}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <button type="button" className="btn cta" onClick={() => setOpenIndex(0)}>Explore collection</button>
      {openIndex !== null && (
        <Lightbox items={shown} index={openIndex} onClose={() => setOpenIndex(null)} onChange={setOpenIndex} />
      )}
    </>
  );
}
