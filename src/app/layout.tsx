import type { Metadata, Viewport } from "next";
import CursorFx from "@/components/effects/CursorFx";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/navigation/Nav";
import { socials } from "@/data/socials";
import { site, siteUrl } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } } : {}),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.fullName }],
  creator: site.fullName,
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: site.name, title: site.fullName, description: site.description, locale: "en_US" },
  twitter: { card: "summary_large_image", title: site.fullName, description: site.description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0606" };

// Structured data so search engines know this site belongs to the person called Mityung Rai.
const profiles = socials.filter((s) => ["github", "instagram", "linkedin"].includes(s.id) && s.url).map((s) => s.url);
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.fullName,
    alternateName: site.name,
    description: site.description,
    ...(siteUrl ? { url: siteUrl } : {}),
    sameAs: profiles,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    alternateName: site.fullName,
    ...(siteUrl ? { url: siteUrl } : {}),
  },
];

// Runs before the page paints so the saved theme does not flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){/* storage blocked, keep default */}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <CursorFx />
        <Nav />
        <main id="main" className="wrap">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
