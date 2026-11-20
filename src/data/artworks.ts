import type { ArtCategory, Artwork } from "@/types";

export const artCategoryLabels: Record<ArtCategory, string> = {
  sketch: "Sketches",
  painting: "Paintings",
  digital: "Digital",
  "in-progress": "Work in progress",
};

// To add artwork: copy the photo into public/art, then add a block below.
// title, description and medium are yours to write. Leave description out and it simply won't show.
export const artworks: Artwork[] = [
  {
    id: "painting-1",
    title: "The Kiss",
    category: "painting",
    src: "/art/painting-1.jpg",
    alt: "Painting of two figures embracing in a golden patterned robe against a red and orange background, with flowers along the bottom",
    // medium: "...",
    // description: "Write a few lines about it here.",
  },
  {
    id: "ink-angel",
    title: "Angel, ink stipple", // TODO: give it your real title
    category: "sketch",
    src: "/art/ink-angel.jpg",
    alt: "Black and white stipple drawing of an angel with large wings and a bowed head against a black background",
    // medium: "...",
    // description: "Write a few lines about it here.",
  },
];
