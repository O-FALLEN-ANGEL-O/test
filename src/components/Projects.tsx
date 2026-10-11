import { moreProjects, projects, type Project } from '../data';
import { prefersReducedMotion } from '../lib/motion';

const all = [...projects, ...moreProjects];

function Card({ p, hidden }: { p: Project; hidden?: boolean }) {
  const inner = (
    <>
      {p.image ? (
        <img
          src={p.image}
          alt={hidden ? '' : `${p.title} screenshot`}
          loading="lazy"
          width={800}
          height={500}
          className="block aspect-[16/10] w-full bg-surface object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-surface px-6 text-center text-3xl font-semibold tracking-tight text-ink/25">
          {p.title}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xl font-semibold">{p.title}</p>
          <p className="mt-1 shrink-0 font-mono text-xs text-muted">{p.tag}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{p.text}</p>
        <p className="mt-3.5 font-mono text-xs text-muted">{p.stack.slice(0, 3).join(' · ')}</p>
      </div>
    </>
  );
  const cls =
    'group block w-[300px] shrink-0 overflow-hidden rounded-[20px] border border-line bg-bg transition-colors hover:border-ink md:w-[340px]';
  return p.url ? (
    <a href={p.url} target="_blank" rel="noreferrer" className={cls} tabIndex={hidden ? -1 : undefined} aria-hidden={hidden || undefined}>
      {inner}
    </a>
  ) : (
    <div className={cls} aria-hidden={hidden || undefined}>
      {inner}
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" data-scene="projects" className="relative py-24">
      <div className="mx-auto mb-6 flex max-w-[1280px] flex-wrap items-end justify-between gap-3 px-5 md:px-10">
        <h2 className="text-4xl font-semibold tracking-tight">Selected projects</h2>
        <p className="font-mono text-[13px] text-muted">
          {all.length} projects{prefersReducedMotion ? '' : ' · hover to pause'}
        </p>
      </div>
      {prefersReducedMotion ? (
        <div className="flex gap-5 overflow-x-auto px-5 pb-4 md:px-10">
          {all.map((p) => (
            <Card key={p.title} p={p} />
          ))}
        </div>
      ) : (
        // Two copies side by side; the track slides by half its width and loops seamlessly.
        <div className="rail overflow-hidden">
          <div className="rail-track flex w-max gap-5 pr-5">
            {all.map((p) => (
              <Card key={p.title} p={p} />
            ))}
            {all.map((p) => (
              <Card key={`${p.title}-copy`} p={p} hidden />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
