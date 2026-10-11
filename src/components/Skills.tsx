import { useEffect, useMemo, useRef } from 'react';
import { isTouch, prefersReducedMotion } from '../lib/motion';
import { skillGroups } from '../data';

/** Points evenly spread over a unit sphere. */
function fibonacciSphere(n: number) {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    pts.push([Math.cos(phi * i) * r, y, Math.sin(phi * i) * r]);
  }
  return pts;
}

function TagSphere({ tags }: { tags: string[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const points = useMemo(() => fibonacciSphere(tags.length), [tags.length]);

  useEffect(() => {
    const el = stage.current!;
    let ax = 0.3;
    let ay = 0;
    let vx = 0.0015;
    let vy = 0.004;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let visible = false;
    let raf = 0;

    const render = () => {
      const R = el.clientWidth * 0.42;
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      points.forEach(([x, y, z], i) => {
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back → 1 front
        const n = nodes.current[i];
        if (!n) return;
        n.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${0.6 + depth * 0.6})`;
        n.style.opacity = String(0.15 + depth * 0.85);
        n.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = () => {
      if (!dragging) {
        ay += vy;
        ax += vx;
        vy += (0.004 - vy) * 0.02;
        vx += (0.0015 - vx) * 0.02;
      }
      render();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !prefersReducedMotion;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    render();

    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      vy = (e.clientX - lx) * 0.005;
      vx = -(e.clientY - ly) * 0.005;
      ay += vy;
      ax += vx;
      lx = e.clientX;
      ly = e.clientY;
      if (!visible) render();
    };
    const up = () => (dragging = false);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [points]);

  return (
    <div
      ref={stage}
      data-cursor
      className="relative mx-auto aspect-square w-full max-w-[560px] touch-pan-y select-none"
      aria-hidden="true"
      style={{ cursor: isTouch ? undefined : 'grab' }}
    >
      {tags.map((t, i) => (
        <span
          key={t}
          ref={(n) => {
            nodes.current[i] = n;
          }}
          className={`sphere-tag rounded-full border px-3 py-1 text-xs md:text-sm ${
            i % 7 === 0 ? 'border-accent/60 text-accent' : 'border-line bg-bg/60 text-ink'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function Skills() {
  const tags = useMemo(() => skillGroups.flatMap((g) => g.items), []);
  return (
    <section id="skills" data-scene="skills" className="relative px-5 py-32 md:px-10 md:py-48">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <div>
          <p className="eyebrow">(03) — Toolkit</p>
          <h2 className="mt-6 text-5xl font-medium tracking-[-0.04em] md:text-8xl">
            The <span className="serif italic">stack</span>
            <span className="text-accent">.</span>
          </h2>
          <p className="mt-6 max-w-md text-muted">
            The tools I reach for every day — drag the sphere to spin it.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {skillGroups.map((g) => (
              <div key={g.title}>
                <h3 className="eyebrow !text-ink">{g.title}</h3>
                <ul className="mt-4 space-y-1.5 text-sm text-muted">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <TagSphere tags={tags} />
      </div>
    </section>
  );
}
