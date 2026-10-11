import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { about, experience, journey } from '../data';
import Split from './Split';

export default function About() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      // Words darken one by one as the reader scrolls through the paragraph.
      gsap.fromTo(
        '.about-text .word',
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.about-text', start: 'top 85%', end: 'bottom 55%', scrub: true },
        },
      );
      gsap.from('.job-row', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#experience', start: 'top 85%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} data-scene="about" className="relative mx-auto max-w-[1280px] px-5 py-24 md:px-10">
      <div className="flex flex-wrap gap-12">
        <div className="min-w-0 flex-[1_1_320px]">
          <h2 className="text-4xl font-semibold tracking-tight">About</h2>
          <p className="about-text mt-5 text-xl leading-snug tracking-tight md:text-2xl">
            <Split text={about} by="word" />
          </p>
          <ol className="mt-8 flex gap-8 text-sm">
            {journey.map((j) => (
              <li key={j.year}>
                <p className="font-semibold">{j.year}</p>
                <p className="mt-1 text-muted">{j.title}</p>
              </li>
            ))}
          </ol>
        </div>
        <div id="experience" className="min-w-0 flex-[2_1_560px] scroll-mt-24">
          <h2 className="mb-2 text-4xl font-semibold tracking-tight">Experience</h2>
          <ul>
            {experience.map((job) => (
              <li
                key={job.company + job.role}
                className="job-row flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line py-5 last:border-b-0"
              >
                <div className="min-w-0 flex-[1_1_320px]">
                  <p className="text-lg font-medium">
                    {job.role} <span className="text-muted">· {job.company}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">{job.points[0]}</p>
                </div>
                <p className="font-mono text-[13px] text-muted">{job.period}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
