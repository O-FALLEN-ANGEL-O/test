import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { experience, moreProjects, profile, projects, skillGroups } from '../data';
import { fetchCombinedStats, type GitHubStats } from '../lib/github';

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
      {value !== null && suffix && <span>{suffix}</span>}
    </span>
  );
}

type Tile = { label: string; value: number | null; suffix?: string };

export default function Stats() {
  const [gh, setGh] = useState<GitHubStats | null>(null);
  const [ghFailed, setGhFailed] = useState(false);

  useEffect(() => {
    fetchCombinedStats(profile.github).then(setGh, () => setGhFailed(true));
  }, []);

  const techCount = new Set(skillGroups.flatMap((g) => g.items)).size;
  const career: Tile[] = [
    { label: 'Projects built', value: projects.length + moreProjects.length, suffix: '+' },
    { label: 'Years coding', value: new Date().getFullYear() - profile.codingSince, suffix: '+' },
    { label: 'Professional roles', value: experience.length },
    { label: 'Technologies', value: techCount, suffix: '+' },
  ];
  const github: Tile[] = [
    { label: 'Public repos', value: gh?.repos ?? null },
    { label: 'Contributions this year', value: gh?.contributions ?? null },
    { label: 'Stars earned', value: gh?.stars ?? null },
    { label: 'Followers', value: gh?.followers ?? null },
  ];

  return (
    <section id="stats" className="relative mx-auto max-w-[1280px] px-5 md:px-10" aria-label="Stats">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-line bg-line lg:grid-cols-4">
        {career.map((t) => (
          <div key={t.label} className="bg-bg p-5 md:p-7">
            <p className="text-4xl font-semibold leading-none tracking-[-0.04em] md:text-[56px]">
              <Counter value={t.value} suffix={t.suffix} />
            </p>
            <p className="mt-3 text-sm text-muted">{t.label}</p>
          </div>
        ))}
      </div>
      {!ghFailed && (
        <div className="mt-4 flex flex-wrap items-center gap-8 rounded-[20px] bg-surface p-5 md:p-7">
          <div className="flex-[1_1_260px]">
            <p className="eyebrow">GitHub · {profile.github.length} accounts combined · live</p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {profile.github.map((u) => (
                <a
                  key={u}
                  href={`https://github.com/${u}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#dcdcd8] bg-bg px-3.5 py-2 font-mono text-[13px] transition-colors hover:border-ink"
                >
                  @{u} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="grid flex-[3_1_560px] grid-cols-2 gap-6 sm:grid-cols-4">
            {github.map((t) => (
              <div key={t.label}>
                <p className="text-4xl font-semibold leading-none tracking-[-0.04em] md:text-[44px]">
                  <Counter value={t.value} />
                </p>
                <p className="mt-2 text-sm text-muted">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
