# praxel.space — Portfolio v2

Personal portfolio of **Prajwal D L**, full stack developer. A bright, compact black-and-white single page built around one scroll-driven 3D chrome blob.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** for styling
- **three.js / React Three Fiber / drei** for the chrome blob, ink ring and particle field
- **GSAP ScrollTrigger + Lenis** for smooth scrolling, pinned sections and scrubbed animation

## What happens on scroll

| Section            | Effect |
|--------------------|--------|
| Preloader          | Counter + wipe reveal |
| Hero               | Word-by-word headline reveal; blob reacts to the pointer; content drifts away on scroll |
| Stats              | Career numbers + combined live GitHub repos and contributions count up on scroll |
| About & Experience | Paragraph darkens word by word; job timeline with durations, each role expands to its details |
| Projects           | Endless strip drifting left → right; drag or swipe to browse, click a card for a details dialog with a live-site link (no drift with reduced motion) |
| Stack              | Grouped skill chips |
| Contact            | Black block; on send the form becomes a letter, folds into an envelope, seals with a stamp and flies off, then a ✓ confirmation |

The blob's shape and spin are keyframed per section (`keyframes` in `src/App.tsx`) and scrubbed between sections; after the hero it parks in the viewport's top-right corner so it never sits behind text (always, on phones).

**Accessibility & performance**
- Respects `prefers-reduced-motion`: no smooth scroll, no auto-drifting strip (still draggable), static blob.
- Touch devices get fewer particles, lower geometry detail and capped pixel ratio.
- three.js lives in a lazily loaded chunk, so text renders before the 3D does; without WebGL a CSS gradient is shown instead.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview
```

## Contact form

On submit the message goes out on two channels in parallel; either one getting through counts as sent.

1. **Email** via [Web3Forms](https://web3forms.com) — create a free access key for `contact@praxel.space` and set `VITE_WEB3FORMS_KEY`.
2. **WhatsApp** via the Vercel Function in `api/contact.js`, which forwards the message to your phone through [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/). The function validates input, drops honeypot bots and rate-limits each IP to 5 messages per 10 minutes. To set it up:
   - Add CallMeBot's number to your phone contacts and send it the activation message from WhatsApp, as described on their page. You get an API key back.
   - In Vercel → Project → Settings → Environment Variables, add `CALLMEBOT_PHONE` (country code + number, digits only, e.g. `918105561638`) and `CALLMEBOT_APIKEY`, then redeploy.

The keys for the WhatsApp step stay on the server, so visitors can never see them. If neither channel is configured or reachable, the envelope unwinds and the visitor's mail app opens with the message pre-filled (or, when an email key is set, an error asks them to email directly). `npm run dev` doesn't run the function; use `vercel dev` to try WhatsApp locally.

## GitHub stats

Public repositories and last-year contributions for every account in `profile.github` (in `src/data.ts`) are added together. They are fetched in the visitor's browser from the GitHub API and [github-contributions-api](https://github.com/grubersjoe/github-contributions-api), then cached in `localStorage` for 6 hours to stay under GitHub's anonymous rate limit. Accounts that fail to load are skipped; if all fail, the GitHub block is hidden.

## Editing content

All text — bio, experience, skills, projects — is in `src/data.ts`. `projects` lead the project strip, followed by `moreProjects`. Project screenshots are in `public/projects/`, the résumé is `public/resume.pdf`, and the social preview image is `public/og.jpg`.

## Deploy

It's a static site: build command `npm run build`, output directory `dist`. Works as-is on Vercel, Netlify or Cloudflare Pages.
