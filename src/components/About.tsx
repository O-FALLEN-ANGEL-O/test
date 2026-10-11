import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { about, experience, journey, type Job } from '../data';
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
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-4xl font-semibold tracking-tight">Experience</h2>
            <p className="font-mono text-[13px] text-muted">{totalExperience()} in industry</p>
          </div>
          <JobTimeline />
        </div>
      </div>
    </section>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthIndex(ym?: string) {
  const d = ym ? new Date(`${ym}-01T00:00:00`) : new Date();
  return d.getFullYear() * 12 + d.getMonth();
}

/** Inclusive month span rendered like "1 yr 5 mos". */
function formatSpan(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} mo${m > 1 ? 's' : ''}`);
  return parts.join(' ') || '1 mo';
}

const jobMonths = (j: Job) => monthIndex(j.end) - monthIndex(j.start) + 1;

function totalExperience() {
  const first = Math.min(...experience.map((j) => monthIndex(j.start)));
  return formatSpan(monthIndex() - first + 1);
}

function shortDate(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

function JobTimeline() {
  const [open, setOpen] = useState(0);
  return (
    <ol className="relative">
      {/* Timeline rail */}
      <span aria-hidden="true" className="absolute top-3 bottom-3 left-[7px] w-px bg-line" />
      {experience.map((job, i) => {
        const current = !job.end;
        const expanded = open === i;
        const panel = `job-panel-${i}`;
        return (
          <li key={job.company + job.role} className="job-row relative pl-9">
            <span
              aria-hidden="true"
              className={`absolute top-[22px] left-0 h-[15px] w-[15px] rounded-full border-2 border-ink ${current ? 'bg-ink' : 'bg-bg'}`}
            >
              {current && <span className="absolute inset-0 animate-ping rounded-full bg-ink opacity-30" />}
            </span>
            <div className={`rounded-2xl transition-colors ${expanded ? 'bg-surface' : 'hover:bg-surface/60'}`}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panel}
                onClick={() => setOpen(expanded ? -1 : i)}
                className="flex w-full flex-wrap items-start justify-between gap-x-6 gap-y-2 px-4 py-4 text-left"
              >
                <span className="min-w-0 flex-[1_1_280px]">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-medium">{job.role}</span>
                    {current && (
                      <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-bg">
                        Now
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-muted">{job.company}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-right font-mono text-[13px] leading-relaxed text-muted">
                    {shortDate(job.start)} — {job.end ? shortDate(job.end) : 'Present'}
                    <span className="block text-ink">{formatSpan(jobMonths(job))}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-lg transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`}
                  >
                    +
                  </span>
                </span>
              </button>
              {/* grid-rows 0fr → 1fr animates to the content's natural height */}
              <div
                id={panel}
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden" inert={!expanded}>
                  <div className="px-4 pb-5">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted">
                      {job.type} · {job.place}
                    </p>
                    <ul className="mt-3 space-y-2 text-[15px] leading-relaxed">
                      {job.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
