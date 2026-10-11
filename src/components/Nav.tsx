import { useEffect, useState } from 'react';
import { scrollToTarget } from '../lib/motion';
import { profile } from '../data';

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 md:px-10" aria-label="Primary">
        <a href="#top" onClick={go('#top')} className="text-lg font-semibold tracking-tight">
          Prajwal D L
        </a>
        <span className="eyebrow hidden md:inline">Mangalore · {time} IST</span>
        <ul className="hidden items-center gap-7 text-sm md:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={go(href)} className="link-underline">
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href={profile.resume} download="Prajwal-DL-Resume.pdf" className="rounded-full bg-ink px-4 py-2.5 font-medium text-bg">
              Résumé ↓
            </a>
          </li>
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
