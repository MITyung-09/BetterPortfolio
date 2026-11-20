// The public address of the site. Leave NEXT_PUBLIC_SITE_URL empty until the domain is confirmed.
// With it empty, canonical links, the sitemap address and structured-data URLs are simply left out.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

export const site = {
  name: "Mityung",
  fullName: "Mityung Rai",
  description: "The personal website of Mityung Rai: software projects, hardware, art and a small arcade of games.",
};
