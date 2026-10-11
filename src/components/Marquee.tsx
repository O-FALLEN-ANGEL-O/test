const items = ['React', 'Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'PHP', 'MySQL', 'Tailwind', 'REST APIs', 'WordPress'];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line py-6" aria-hidden="true">
      <div className="marquee-track flex w-max gap-10">
        {row.map((t, i) => (
          <span key={i} className="serif flex items-center gap-10 text-4xl italic text-ink/80 md:text-6xl">
            {t}
            <span className="text-xl not-italic text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
