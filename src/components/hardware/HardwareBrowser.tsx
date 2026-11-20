"use client";

import { useState } from "react";
import Media from "@/components/media/Media";
import EmptyState from "@/components/ui/EmptyState";
import { hardwareCategoryLabels, hardwareProjects } from "@/data/hardware";
import type { HardwareCategory, HardwareProject } from "@/types";

// One project: big media with a thumbnail strip, then the details. Specs and the build log open on demand.
function HardwareCard({ project: h }: { project: HardwareProject }) {
  const [active, setActive] = useState(0);
  const main = h.media[active] ?? h.media[0];

  return (
    <article className="hwCard">
      <div className="hwStage">
        {main ? <Media item={main} /> : <div className="cover c1" aria-hidden="true">{h.name[0]}</div>}
      </div>
      {h.media.length > 1 && (
        <ul className="hwThumbs" aria-label={`Media for ${h.name}`}>
          {h.media.map((m, i) => (
            <li key={m.src}>
              <button type="button" aria-pressed={i === active} aria-label={`Show ${m.type} ${i + 1}`} onClick={() => setActive(i)}>
                {m.type === "image" ? <img src={m.src} alt="" loading="lazy" /> : <span>{m.type}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="hwBody">
        <p className="hwMeta"><span className="hwCat">{hardwareCategoryLabels[h.category]}</span>{h.status && <span className="status">{h.status}</span>}</p>
        <h3>{h.name}</h3>
        <p className="desc">{h.summary}</p>
        {h.description && <p>{h.description}</p>}
        {h.specs && (
          <details>
            <summary>Full specs <span aria-hidden="true">→</span></summary>
            <dl className="specs">{h.specs.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
          </details>
        )}
        {h.log && (
          <details>
            <summary>Full project log <span aria-hidden="true">→</span></summary>
            <ol className="points">{h.log.map((l) => <li key={l}>{l}</li>)}</ol>
          </details>
        )}
        {h.links && (
          <p className="links">{h.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}</p>
        )}
        {h.components && <p className="hwParts">{h.components.join(", ")}</p>}
      </div>
    </article>
  );
}

export default function HardwareBrowser() {
  const [filter, setFilter] = useState<HardwareCategory | "all">("all");

  if (hardwareProjects.length === 0) {
    return (
      <EmptyState
        labels={Object.values(hardwareCategoryLabels)}
        text="PC builds, components, gadgets and electronics experiments will live here. Add them in src/data/hardware.ts."
      />
    );
  }

  const categories = [...new Set(hardwareProjects.map((h) => h.category))];
  const shown = hardwareProjects.filter((h) => filter === "all" || h.category === filter);
  return (
    <>
      {categories.length > 1 && (
        <div className="filters" role="group" aria-label="Filter hardware">
          {(["all", ...categories] as const).map((c) => (
            <button key={c} type="button" className="btn small" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c === "all" ? "Everything" : hardwareCategoryLabels[c]}
            </button>
          ))}
        </div>
      )}
      <div className="hwGrid">{shown.map((h) => <HardwareCard key={h.id} project={h} />)}</div>
    </>
  );
}
