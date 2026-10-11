import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { experience, moreProjects, profile, projects, skillGroups } from '../data';
import { fetchGitHubStats, type GitHubStats } from '../lib/github';

/** Counts up from 0 the first time it scrolls into view (or when its value arrives). */
function Counter({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !seen || value === null) return;
    if (prefersReducedMotion) {
      el.textContent = value.toLocaleString('en-IN');
      return;
    }
    const n = { v: 0 };
    const t = gsap.to(n, {
      v: value,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = Math.round(n.v).toLocaleString('en-IN');
      },
    });
    return () => {
      t.kill();
    };
  }, [seen, value]);

  return (
    <span className="tabular-nums">
      <span ref={ref}>{value === null ? '—' : '0'}</span>
      {value !== null && suffix && <span className="text-accent">{suffix}</span>}
    </span>
  );
}

type Tile = { label: string; value: number | null; suffix?: string };

export default function Stats() {
  const [gh, setGh] = useState<GitHubStats | null>(null);
  const [ghFailed, setGhFailed] = useState(false);

  useEffect(() => {
    fetchGitHubStats(profile.github).then(setGh, () => setGhFailed(true));
  }, []);

  const techCount = new Set(skillGroups.flatMap((g) => g.items)).size;
  const career: Tile[] = [
    { label: 'Projects built', value: projects.length + moreProjects.length, suffix: '+' },
    { label: 'Years coding', value: new Date().getFullYear() - profile.codingSince, suffix: '+' },
    { label: 'Professional roles', value: experience.length },
    { label: 'Technologies', value: techCount, suffix: '+' },
  ];
  const github: Tile[] = [
    { label: 'Public repositories', value: gh?.repos ?? null },
    { label: 'Contributions this year', value: gh?.contributions ?? null },
    { label: 'Stars earned', value: gh?.stars ?? null },
    { label: 'Followers', value: gh?.followers ?? null },
  ];

  const tile = (t: Tile) => (
    <div key={t.label} className="bg-bg/80 p-5 backdrop-blur-md md:p-8">
      <p className="text-4xl font-medium tracking-[-0.04em] md:text-7xl">
        <Counter value={t.value} suffix={t.suffix} />
      </p>
      <p className="eyebrow mt-4">{t.label}</p>
    </div>
  );

  return (
    <section id="stats" className="relative px-5 pb-32 md:px-10 md:pb-48" aria-label="Stats">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line grid-cols-2 lg:grid-cols-4">
        {career.map(tile)}
      </div>
      {!ghFailed && (
        <>
          <div className="mt-14 mb-6 flex items-center justify-between">
            <p className="eyebrow flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" /> Live from GitHub
            </p>
            <a
              href={`https://github.com/${profile.github}`}
              target="_blank"
              rel="noreferrer"
              className="link-underline font-mono text-sm"
            >
              @{profile.github} ↗
            </a>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line grid-cols-2 lg:grid-cols-4">
            {github.map(tile)}
          </div>
        </>
      )}
    </section>
  );
}
