"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  id: string; title: string; tone: string;
  big?: boolean;                          // large collection panel (Software, Hardware, Art)
  blurb?: string;
  cta?: { label: string; href: string };  // optional button under the content
  children: ReactNode;
};

// A section wrapper: fades in gently when scrolled to.
export default function Fx({ id, title, tone, big, blurb, cta, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add("in");
        reveal.disconnect();
      }
    }, { threshold: 0.1 });
    reveal.observe(el);

    return () => {
      reveal.disconnect();
    };
  }, []);

  return (
    <section ref={ref} id={id} className="fx" data-tone={tone} data-big={big ? "true" : undefined}>
      <h2 className={big ? "bigTitle" : "sectionTitle"}>{title}</h2>
      {blurb && <p className="blurb">{blurb}</p>}
      {children}
      {cta && <a className="btn cta" href={cta.href} target="_blank" rel="noopener noreferrer">{cta.label} ↗</a>}
    </section>
  );
}
