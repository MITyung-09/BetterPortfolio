export type Category = "desktop" | "game";

// One piece of media. For "youtube", src is just the video id.
export type MediaItem = { type: "image" | "video" | "youtube"; src: string; alt?: string };

export type Project = {
  id: string;
  name: string;
  summary: string;
  categories: Category[];
  tech: string[];
  status: string;
  github?: string;
  liveDemo?: string;
  details?: string[];
  media?: MediaItem[];
};

export type HardwareCategory = "pc" | "components" | "gadget" | "electronics";

export type HardwareProject = {
  id: string;
  name: string;
  category: HardwareCategory;
  summary: string;
  description?: string; // a longer paragraph about the build
  status?: string;
  components?: string[]; // parts used, shown as chips
  specs?: { label: string; value: string }[];
  log?: string[];        // build log, shown in an expandable section
  links?: { label: string; url: string }[];
  media: MediaItem[];    // first one is the main picture
};

export type ArtCategory = "sketch" | "painting" | "digital" | "in-progress";

export type Artwork = {
  id: string;
  title: string;
  category: ArtCategory;
  src: string; // e.g. "/art/my-drawing.jpg"
  alt?: string;         // describes the image for screen readers
  caption?: string;
  medium?: string;      // e.g. "Acrylic on paper"
  description?: string; // your own words about it
  year?: string;
};

export type SocialLink = {
  id: string;
  platform: string;
  username: string;
  url?: string;      // opens a link
  copyText?: string; // or shows a "copy" button (Discord, Valorant)
};
