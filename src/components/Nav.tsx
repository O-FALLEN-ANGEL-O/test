import { useEffect, useState } from 'react';
import { scrollToTarget } from '../lib/motion';

const links = [
  ['About', '#about'],
  ['Work', '#experience'],
  ['Skills', '#skills'],
  ['Projects', '#projects'],
  ['Contact', '#contact'],
] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () =>
      setTime(
        new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
          hour12: false,
        }).format(new Date()),
      );
    fmt();
    const id = setInterval(fmt, 30_000);
    return () => clearInterval(id);
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(href);
  };

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
      <nav className="flex items-center justify-between px-5 py-5 md:px-10" aria-label="Primary">
        <a href="#top" onClick={go('#top')} className="serif text-2xl italic leading-none">
          Prajwal<span className="text-accent">.</span>
        </a>
        <span className="eyebrow hidden md:inline">Mangalore · {time} IST</span>
        <ul className="hidden gap-7 text-sm md:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={go(href)} className="link-underline">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="eyebrow !text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>
    </header>
      {open && (
        <ul id="mobile-menu" className="fixed inset-0 z-40 flex flex-col justify-center gap-2 bg-bg px-5 md:hidden">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={go(href)} className="serif text-5xl">
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
