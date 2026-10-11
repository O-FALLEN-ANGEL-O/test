import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { experience } from '../data';

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth;
      const scroll = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      // Each card swings in from a 3D angle as it travels into view.
      gsap.utils.toArray<HTMLElement>('.job-card').forEach((card) => {
        gsap.fromTo(
          card,
          { rotateY: -28, z: -120, opacity: 0.35 },
          {
            rotateY: 0,
            z: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: scroll, start: 'left right', end: 'center 60%', scrub: true },
          },
        );
      });
      gsap.fromTo('.job-progress', { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true },
      });
    });
    if (!prefersReducedMotion) {
      mm.add('(max-width: 767px)', () => {
        gsap.utils.toArray<HTMLElement>('.job-card').forEach((card) => {
          gsap.from(card, { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
        });
      });
    }
    return () => mm.revert();
  }, []);

  return (
    <section id="experience" ref={root} data-scene="experience" className="relative overflow-hidden md:motion-safe:h-[100svh]">
      <div className="flex h-full flex-col justify-center py-24 md:motion-safe:py-0">
        <div className="mb-10 flex items-end justify-between px-5 md:mb-14 md:px-10">
          <h2 className="text-5xl font-medium tracking-[-0.04em] md:text-8xl">
            Experience<span className="serif italic text-accent">.</span>
          </h2>
          <p className="eyebrow hidden md:motion-safe:block">(02) — Scroll →</p>
        </div>
        <div
          ref={track}
          className="flex flex-col gap-5 px-5 md:px-10 md:motion-safe:w-max md:motion-safe:flex-row md:motion-safe:gap-8 md:motion-reduce:grid md:motion-reduce:grid-cols-2"
          style={{ perspective: '1400px' }}
        >
          {experience.map((job, i) => (
            <article
              key={job.company + job.role}
              className="job-card flex flex-col justify-between rounded-3xl border border-line bg-bg/70 p-7 backdrop-blur-xl md:p-10 md:motion-safe:h-[58vh] md:motion-safe:w-[min(42vw,560px)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{job.period}</span>
                  <span className="serif text-3xl text-ink/30">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-3xl font-medium tracking-tight md:text-4xl">{job.role}</h3>
                <p className="serif mt-1 text-2xl italic text-accent">{job.company}</p>
              </div>
              <ul className="mt-8 space-y-3 text-sm leading-relaxed text-muted md:text-[15px]">
                {job.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/50" />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-8">{job.place}</p>
            </article>
          ))}
          <div className="hidden w-[10vw] shrink-0 md:motion-safe:block" />
        </div>
        <div className="mx-10 mt-12 hidden h-px bg-line md:motion-safe:block">
          <div className="job-progress h-px origin-left bg-accent" />
        </div>
      </div>
    </section>
  );
}
