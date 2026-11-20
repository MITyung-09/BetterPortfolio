# MITyung.exe: personal site

One scrolling page built with Next.js, React and TypeScript.

## Run it (beginner steps)
1. Install Node.js (LTS) from https://nodejs.org
2. Open a terminal in this folder
3. `npm install` (first time only)
4. `npm run dev`, then open http://localhost:3000
5. Check it builds: `npm run build`

## Adding content (no component code needed)
- **Text on the home page:** `src/data/profile.ts`
- **Projects:** `src/data/projects.ts` (screenshots/videos go in `public/projects`)
- **Artwork:** copy the photo into `public/art`, then add one line in `src/data/artworks.ts`
- **Hardware builds:** photos into `public/hardware`, entry in `src/data/hardware.ts`
- **Socials:** `src/data/socials.ts`. Entries with no link stay hidden.
- Media types: `image` (also GIFs), `video` (an mp4 in `public`), `youtube` (just the video id)

## Do I need a database?
Not for this. Images in `public/` plus the data files are free, fast and can't break.
A database (Supabase) only becomes worth it if you want to upload from a web form without
editing files, or keep a game leaderboard. Both would need a login/admin page and spam protection,
so they are a later step.

## Using your own hero image
Copy an image (white or transparent background, one solid colour works best) into `public`, e.g. `public/sigil.png`,
then set `sigilImage: "/sigil.png"` in `src/data/profile.ts`. The dots take its shape. Leave it empty for the built-in sigil.

## Before you publish (checklist)
1. **Tab icon:** put your logo image somewhere (for example `public/logo-source.png`) and run `npm run icons -- public/logo-source.png`.
   This writes `favicon.ico`, `icon.png` and `apple-icon.png`. Until then a plain placeholder icon shows.
2. **Domain:** once you have it, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL=https://your-domain`.
   That switches on the canonical link, sitemap and the address in the structured data. Set the same variable on your host (Vercel: Project Settings, Environment Variables).
3. **Search engines:** after deploying, add the site in Google Search Console and submit `https://your-domain/sitemap.xml`. Ranking for "Mityung Rai" takes time and is not guaranteed.
4. Rename the two artworks in `src/data/artworks.ts` and add descriptions. Add the Survivors GitHub link in `src/data/projects.ts`.
5. `npm test` runs the game-rule tests, `npm run build` checks the production build.
