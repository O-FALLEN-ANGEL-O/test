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

Submissions go to the Vercel Function in `api/contact.js` first. It:

1. rejects posts from other sites, bodies over 8 KB, invalid fields and honeypot bots;
2. rate-limits each IP to 5 messages per 10 minutes;
3. verifies an invisible **reCAPTCHA v3** token with Google (score ≥ `RECAPTCHA_MIN_SCORE`, default 0.5, action `contact`);
4. forwards the message to your **WhatsApp** through [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/).

Only once the function accepts it does the browser send the **email** copy through [Web3Forms](https://web3forms.com), using the access key the function returns (Web3Forms refuses server-side submissions on its free plan, so the email itself has to leave from the browser). Either channel getting through counts as sent. If the function rejects it, nothing is sent and the visitor sees a spam-check message.

Setup (Vercel → Project → Settings → Environment Variables, tick **Production**, then redeploy — Vercel only applies env changes to new deployments):

| Variable | Where it comes from | Visibility |
|---|---|---|
| `VITE_RECAPTCHA_SITE_KEY` | [reCAPTCHA admin](https://www.google.com/recaptcha/admin) → new site, type **Score based (v3)**, domains `praxel.space` + `vercel.app` | public (in the page) |
| `RECAPTCHA_SECRET` | same page, secret key | server only |
| `CALLMEBOT_PHONE` | your WhatsApp number, country code + digits, e.g. `918105561638` | server only |
| `CALLMEBOT_APIKEY` | sent by CallMeBot after you message their number from WhatsApp | server only |
| `WEB3FORMS_KEY` | [Web3Forms](https://web3forms.com) access key for `contact@praxel.space` (the older `VITE_WEB3FORMS_KEY` name also works) | handed to the browser after a submission is accepted |

Each piece is optional: without reCAPTCHA keys the captcha step is skipped, without CallMeBot keys WhatsApp is skipped, and with nothing configured the visitor's mail app opens with the message pre-filled. `npm run dev` doesn't run the function; use `vercel dev` to try it locally.

## Security

`vercel.json` sends a strict Content-Security-Policy (scripts only from this site and Google's reCAPTCHA; network calls only to GitHub, the contributions API, Web3Forms and reCAPTCHA; no framing), plus HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`. If you add a new third-party script, font or API, add its origin to the CSP or the browser will block it.

The Web3Forms key is public by design (it's how Web3Forms works), so someone could post to Web3Forms directly and skip this site's checks; Web3Forms applies its own spam filtering to those. Everything that reaches your WhatsApp has passed the server checks above.

## GitHub stats

Public repositories and last-year contributions for every account in `profile.github` (in `src/data.ts`) are added together. They are fetched in the visitor's browser from the GitHub API and [github-contributions-api](https://github.com/grubersjoe/github-contributions-api), then cached in `localStorage` for 6 hours to stay under GitHub's anonymous rate limit. Accounts that fail to load are skipped; if all fail, the GitHub block is hidden.

## Editing content

All text — bio, experience, skills, projects — is in `src/data.ts`. `projects` lead the project strip, followed by `moreProjects`. Project screenshots are in `public/projects/`, the résumé is `public/resume.pdf`, and the social preview image is `public/og.jpg`.

## Deploy

It's a static site: build command `npm run build`, output directory `dist`. Works as-is on Vercel, Netlify or Cloudflare Pages.
