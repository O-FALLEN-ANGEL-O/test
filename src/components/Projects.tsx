import { useEffect, useRef, useState } from 'react';
import { moreProjects, projects, type Project } from '../data';
import { gsap, isTouch, lockScroll, prefersReducedMotion } from '../lib/motion';

const all = [...projects, ...moreProjects];
const SPEED = prefersReducedMotion ? 0 : 45; // px per second, left → right

function Card({ p, copy, onOpen }: { p: Project; copy?: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={copy ? -1 : undefined}
      aria-hidden={copy || undefined}
      aria-haspopup="dialog"
      data-cursor
      className="group block w-[280px] shrink-0 overflow-hidden rounded-[20px] border border-line bg-bg text-left transition-colors hover:border-ink md:w-[340px]"
    >
      {p.image ? (
        <img
          src={p.image}
          alt=""
          draggable={false}
          loading="lazy"
          width={800}
          height={500}
          className="pointer-events-none block aspect-[16/10] w-full bg-surface object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <span className="flex aspect-[16/10] w-full items-center justify-center bg-surface px-6 text-center text-3xl font-semibold tracking-tight text-ink/25">
          {p.title}
        </span>
      )}
      <span className="block p-5">
        <span className="flex items-start justify-between gap-3">
          <span className="text-xl font-semibold">{p.title}</span>
          <span className="mt-1 shrink-0 font-mono text-xs text-muted">{p.tag}</span>
        </span>
        <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-muted">{p.text}</span>
        <span className="mt-3.5 block font-mono text-xs text-muted">{p.stack.slice(0, 3).join(' · ')}</span>
      </span>
    </button>
  );
}

/**
 * Endless strip: drifts left → right on its own, can be dragged (mouse or touch)
 * with a little momentum, and pauses while hovered or focused.
 */
function useRail(track: React.RefObject<HTMLDivElement | null>) {
  const dragged = useRef(false);

  useEffect(() => {
    const el = track.current!;
    let offset = 0; // px; wrapped into [-half, 0)
    let velocity = SPEED;
    let paused = false;
    let down = false;
    let lastX = 0;
    let lastT = 0;
    let startX = 0;
    let raf = 0;
    let prev = performance.now();
    let visible = false;

    const half = () => el.scrollWidth / 2;
    const apply = () => {
      const h = half();
      const x = (((offset % h) + h) % h) - h;
      el.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!down) {
        // Ease back toward the cruising speed after a flick or a pause.
        const target = paused ? 0 : SPEED;
        velocity += (target - velocity) * Math.min(1, dt * 3);
        offset += velocity * dt;
      }
      apply();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    apply();

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = true;
      dragged.current = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      if (!dragged.current && Math.abs(e.clientX - startX) > 6) {
        dragged.current = true;
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
      }
      if (dragged.current) {
        offset += dx;
        velocity = (dx / Math.max(1, now - lastT)) * 1000;
      }
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      down = false;
      el.style.cursor = '';
      velocity = Math.max(-2500, Math.min(2500, velocity));
    };
    // Trackpads: horizontal swipes scroll the strip.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      offset -= e.deltaX;
    };
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    // Keep a keyboard-focused card in view.
    const onFocus = (e: FocusEvent) => {
      const card = (e.target as HTMLElement).closest('button');
      if (!card) return;
      paused = true;
      offset = -(card.offsetLeft - 40);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('focusin', onFocus);
    el.addEventListener('focusout', resume);
    if (!isTouch) {
      el.addEventListener('pointerenter', pause);
      el.addEventListener('pointerleave', resume);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('focusout', resume);
      el.removeEventListener('pointerenter', pause);
      el.removeEventListener('pointerleave', resume);
    };
  }, [track]);

  return dragged;
}

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const last = useRef<Project | null>(null);
  if (project) last.current = project;
  const p = project ?? last.current;

  useEffect(() => {
    const d = ref.current!;
    if (project && !d.open) {
      d.showModal();
      lockScroll(true);
      if (!prefersReducedMotion) gsap.fromTo(d, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' });
    } else if (!project && d.open) {
      d.close();
    }
  }, [project]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="project-dialog-title"
      data-lenis-prevent
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="project-dialog m-auto w-[min(92vw,760px)] max-h-[90svh] overflow-y-auto rounded-[24px] border border-line bg-bg p-0 text-ink shadow-2xl"
    >
      {p && (
        <div>
          {p.image ? (
            <img src={p.image} alt={`${p.title} screenshot`} width={800} height={500} className="block aspect-[16/9] w-full bg-surface object-cover object-top" />
          ) : (
            <div className="flex aspect-[16/7] w-full items-center justify-center bg-surface text-4xl font-semibold tracking-tight text-ink/25">
              {p.title}
            </div>
          )}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 id="project-dialog-title" className="text-3xl font-semibold tracking-tight">
                {p.title}
              </h3>
              <span className="rounded-full bg-surface px-3 py-1 font-mono text-xs text-muted">{p.tag}</span>
            </div>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{p.text}</p>
            <h4 className="eyebrow mt-6">Built with</h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full border border-line px-3 py-1.5 text-sm">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-bg">
                  Visit live site <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="rounded-full bg-surface px-6 py-3.5 text-[15px] text-muted">Live demo coming soon</span>
              )}
              <button type="button" onClick={() => ref.current?.close()} className="rounded-full border border-line px-6 py-3.5 text-[15px] font-medium hover:border-ink">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function Projects() {
  const track = useRef<HTMLDivElement>(null);
  const dragged = useRail(track);
  const [active, setActive] = useState<Project | null>(null);

  // A drag that ends on a card must not also open it.
  const open = (p: Project) => () => {
    if (dragged.current) return;
    setActive(p);
  };

  return (
    <section id="projects" data-scene="projects" className="relative py-24">
      <div className="mx-auto mb-6 flex max-w-[1280px] flex-wrap items-end justify-between gap-3 px-5 md:px-10">
        <h2 className="text-4xl font-semibold tracking-tight">Selected projects</h2>
        <p className="font-mono text-[13px] text-muted">{all.length} projects · drag to browse · click for details</p>
      </div>
      <div className="overflow-hidden">
        {/* Two copies side by side so the loop is seamless. */}
        <div ref={track} className="flex w-max cursor-grab touch-pan-y gap-5 pr-5 select-none will-change-transform">
          {all.map((p) => (
            <Card key={p.title} p={p} onOpen={open(p)} />
          ))}
          {all.map((p) => (
            <Card key={`${p.title}-copy`} p={p} copy onOpen={open(p)} />
          ))}
        </div>
      </div>
      <ProjectDialog project={active} onClose={() => setActive(null)} />
    </section>
  );
}
