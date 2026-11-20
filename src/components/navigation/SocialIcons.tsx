import type { ReactNode } from "react";
import { socials } from "@/data/socials";

// Simple inline icons (no extra dependency). Only these three show in the header.
const icons: Record<string, ReactNode> = {
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
      <rect x="6.5" y="10" width="2.4" height="7.5" fill="var(--bg)" />
      <circle cx="7.7" cy="7.3" r="1.4" fill="var(--bg)" />
      <path d="M11 10h2.3v1c.4-.7 1.2-1.2 2.4-1.2 2.3 0 2.8 1.5 2.8 3.4v4.3h-2.4v-3.8c0-.9 0-2-1.3-2s-1.4 1-1.4 1.9v3.9H11z" fill="var(--bg)" />
    </>
  ),
};
const labels: Record<string, string> = { email: "Email me", instagram: "Instagram", linkedin: "LinkedIn" };

export default function SocialIcons() {
  return (
    <div className="socialIcons">
      {["email", "instagram", "linkedin"].map((id) => {
        const link = socials.find((s) => s.id === id);
        if (!link?.url) return null;
        return (
          <a key={id} href={link.url} aria-label={labels[id]} title={labels[id]} target={id === "email" ? undefined : "_blank"} rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">{icons[id]}</svg>
          </a>
        );
      })}
    </div>
  );
}
