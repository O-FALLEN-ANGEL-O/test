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
| Experience | Section pins and scrolls horizontally; cards swing in from a 3D angle |
| Skills     | Draggable 3D tag sphere |
| Projects   | Sticky cards stack and recede into depth; screenshots parallax |
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

## Editing content

All text — bio, experience, skills, projects — is in `src/data.ts`. Project screenshots are in `public/projects/`, the résumé is `public/resume.pdf`, and the social preview image is `public/og.jpg`.

## Deploy

It's a static site: build command `npm run build`, output directory `dist`. Works as-is on Vercel, Netlify or Cloudflare Pages.
