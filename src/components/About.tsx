import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { about, journey } from '../data';
import Split from './Split';

export default function About() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      // Words light up one by one as the reader scrolls through the section.
      gsap.fromTo(
        '.about-text .word',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.about-text', start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      );
      gsap.from('.journey-item', {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.journey', start: 'top 85%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} data-scene="about" className="relative px-5 py-32 md:px-10 md:py-48">
      <div className="grid gap-12 md:grid-cols-12">
        <p className="eyebrow md:col-span-3">(01) — About</p>
        <div className="md:col-span-9">
          <p className="about-text text-3xl font-light leading-[1.15] tracking-tight md:text-6xl">
            <Split text={about} by="word" />
          </p>
          <ol className="journey mt-20 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {journey.map((j) => (
              <li key={j.year} className="journey-item bg-bg/80 p-6 backdrop-blur-md md:p-8">
                <p className="serif text-5xl text-accent">{j.year}</p>
                <p className="mt-6 font-medium">{j.title}</p>
                <p className="mt-1 text-sm text-muted">{j.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
