import { useLayoutEffect, useRef } from 'react';
import { gsap, isTouch, prefersReducedMotion } from '../lib/motion';
import { projects, type Project } from '../data';

function Card({ p, i }: { p: Project; i: number }) {
  const inner = useRef<HTMLDivElement>(null);

  const tilt = (e: React.PointerEvent) => {
    if (isTouch || prefersReducedMotion || !inner.current) return;
    const r = inner.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(inner.current, { rotateY: x * 8, rotateX: -y * 8, duration: 0.6, ease: 'power3.out' });
  };
  const reset = () => inner.current && gsap.to(inner.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });

  return (
    <div className="project-card md:sticky md:top-[10vh]" style={{ perspective: '1600px' }}>
      <div
        ref={inner}
        onPointerMove={tilt}
        onPointerLeave={reset}
        className="project-inner grid overflow-hidden rounded-3xl border border-line bg-[#111110] md:h-[78vh] md:grid-cols-12"
      >
        <div className="flex flex-col justify-between p-7 md:col-span-5 md:p-10">
          <div>
            <div className="flex items-center justify-between">
              <span className="serif text-6xl text-ink/25 md:text-8xl">0{i + 1}</span>
              <span className="eyebrow rounded-full border border-line px-3 py-1">{p.tag}</span>
            </div>
            <h3 className="mt-6 text-4xl font-medium tracking-tight md:text-6xl">{p.title}</h3>
            <p className="mt-5 max-w-md text-muted">{p.text}</p>
          </div>
          <div>
            <ul className="mt-8 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full bg-ink/5 px-3 py-1 font-mono text-xs text-ink/70">
                  {s}
                </li>
              ))}
            </ul>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 inline-flex items-center gap-3 text-lg"
            >
              <span className="link-underline">View live demo</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-bg transition-transform duration-500 group-hover:rotate-45">
                ↗
              </span>
            </a>
          </div>
        </div>
        <a
          href={p.url}
          target="_blank"
          rel="noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          className="group/img relative order-first block aspect-[16/10] overflow-hidden md:order-none md:col-span-7 md:aspect-auto"
        >
          <img
            src={p.image}
            alt=""
            loading="lazy"
            width={1200}
            height={750}
            className="project-img absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover object-top transition-[scale] duration-700 group-hover/img:scale-105"
          />
        </a>
      </div>
    </div>
  );
}

export default function Projects() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.project-card');
      // As the next card slides over, push the current one back into depth.
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector('.project-inner'), {
          scale: 0.9,
          filter: 'brightness(0.45)',
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 12%', scrub: true },
        });
      });
      cards.forEach((card) => {
        gsap.fromTo(
          card.querySelector('.project-img'),
          { yPercent: -6 },
          { yPercent: 6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="projects" ref={root} data-scene="projects" className="relative px-5 pb-32 md:px-10">
      <div className="mb-14 flex items-end justify-between">
        <h2 className="text-5xl font-medium tracking-[-0.04em] md:text-8xl">
          Selected <span className="serif italic">work</span>
          <span className="text-accent">.</span>
        </h2>
        <p className="eyebrow hidden md:block">(04) — {projects.length} projects</p>
      </div>
      <div className="flex flex-col gap-[8vh]">
        {projects.map((p, i) => (
          <Card key={p.title} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
