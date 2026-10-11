import { skillGroups } from '../data';

export default function Skills() {
  return (
    <section id="skills" data-scene="skills" className="relative mx-auto max-w-[1280px] px-5 md:px-10">
      <h2 className="mb-6 text-4xl font-semibold tracking-tight">Stack</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {skillGroups.map((g) => (
          <div key={g.title} className="rounded-[20px] bg-surface p-6">
            <h3 className="eyebrow">{g.title}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((s) => (
                <li key={s} className="rounded-full border border-[#dcdcd8] bg-bg px-3 py-1.5 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
