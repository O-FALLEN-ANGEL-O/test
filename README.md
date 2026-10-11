# praxel.space — Portfolio v2

Personal portfolio of **Prajwal D L**, full stack developer. A monochrome, single-page site built around one scroll-driven 3D scene.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** for styling
- **three.js / React Three Fiber / drei** for the liquid-glass blob, accent ring and particle field
- **GSAP ScrollTrigger + Lenis** for smooth scrolling, pinned sections and scrubbed animation

## What happens on scroll

| Section    | Effect |
|------------|--------|
| Preloader  | Counter + wipe reveal |
| Hero       | Per-letter name reveal; blob reacts to the pointer; content drifts away on scroll |
| About      | Paragraph lights up word by word |
| Stats      | Career numbers + live GitHub stats count up on scroll |
| Experience | Section pins and scrolls horizontally; cards swing in from a 3D angle |
| Skills     | Draggable 3D tag sphere |
| Projects   | 3 featured cards stack and recede into depth; the rest sit in a compact index with a cursor-following preview |
| Contact    | Big type reveal, magnetic buttons, working form |

The blob's position, scale, distortion, spin and accent glow are keyframed per section (`keyframes` in `src/App.tsx`) and scrubbed between sections.

**Accessibility & performance**
- Respects `prefers-reduced-motion`: no smooth scroll, no pinning, static blob.
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

The form posts to [Web3Forms](https://web3forms.com). Create a free access key for `contact@praxel.space` and set it as an environment variable (locally in `.env`, and in your hosting dashboard):

```
VITE_WEB3FORMS_KEY=your-access-key
```

Without a key, submitting the form opens the visitor's email client with the message pre-filled.

## GitHub stats

Public repositories, stars, followers and last-year contributions for `profile.github` (in `src/data.ts`) are fetched in the visitor's browser from the GitHub API and [github-contributions-api](https://github.com/grubersjoe/github-contributions-api), then cached in `localStorage` for 6 hours to stay under GitHub's anonymous rate limit. If the requests fail, the GitHub row is hidden.

## Editing content

All text — bio, experience, skills, projects — is in `src/data.ts`. `projects` are the featured cards; `moreProjects` fill the compact list. Project screenshots are in `public/projects/`, the résumé is `public/resume.pdf`, and the social preview image is `public/og.jpg`.

## Deploy

It's a static site: build command `npm run build`, output directory `dist`. Works as-is on Vercel, Netlify or Cloudflare Pages.
