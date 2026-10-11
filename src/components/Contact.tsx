import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, scrollToTarget } from '../lib/motion';
import { profile } from '../data';
import Split from './Split';
import Magnetic from './Magnetic';

const FORM_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!FORM_KEY) {
      // No form service configured — hand off to the visitor's mail client.
      const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent('Portfolio enquiry')}&body=${encodeURIComponent(body)}`;
      return;
    }
    setStatus('sending');
    data.append('access_key', FORM_KEY);
    data.append('subject', `Portfolio enquiry from ${data.get('name')}`);
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  const field =
    'w-full rounded-xl border border-[#5a5a5a] bg-transparent px-3.5 py-3 text-base text-white outline-none transition-colors focus:border-white';

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="block">
        <span className="mb-1.5 block text-[13px] text-[#c9c9c6]">Name</span>
        <input required name="name" autoComplete="name" className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] text-[#c9c9c6]">Email</span>
        <input required type="email" name="email" autoComplete="email" className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] text-[#c9c9c6]">Message</span>
        <textarea required name="message" rows={3} className={`${field} resize-none`} />
      </label>
      <div className="flex flex-wrap items-center gap-6 pt-2">
        <Magnetic>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition-opacity disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </Magnetic>
        <p role="status" className="text-sm text-[#c9c9c6]">
          {status === 'sent' && 'Thanks — I’ll get back to you soon.'}
          {status === 'error' && `Something went wrong. Email me at ${profile.email}.`}
        </p>
      </div>
    </form>
  );
}

export default function Contact() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from('.contact-title .char', {
        yPercent: 110,
        stagger: 0.025,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.contact-title', start: 'top 85%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const year = new Date().getFullYear();

  return (
    <section id="contact" ref={root} data-scene="contact" className="relative mx-auto max-w-[1280px] px-5 pt-24 md:px-10">
      <div className="flex flex-wrap gap-12 rounded-[28px] bg-ink p-8 text-white md:p-14">
        <div className="flex-[1_1_360px]">
          <h2 className="contact-title text-[clamp(40px,5vw,64px)] font-semibold leading-none tracking-[-0.04em]">
            <span className="line-mask">
              <Split text="Let’s build something." />
            </span>
          </h2>
          <p className="mt-5">
            <a href={`mailto:${profile.email}`} className="link-underline text-xl md:text-[22px]">
              {profile.email}
            </a>
          </p>
          <p className="mt-3 text-[15px] text-[#c9c9c6]">
            <a href={profile.phoneHref} className="link-underline">{profile.phone}</a>
            {' · '}
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="link-underline text-white">LinkedIn ↗</a>
            {' · '}
            <a href={profile.resume} download="Prajwal-DL-Resume.pdf" className="link-underline text-white">Résumé ↓</a>
          </p>
        </div>
        <div className="flex-[1_1_360px]">
          <ContactForm />
        </div>
      </div>

      <footer className="flex flex-wrap justify-between gap-3 py-8 text-[13px] text-muted">
        <p>© {year} Prajwal D L</p>
        <p>Full stack developer · Mangalore</p>
        <button onClick={() => scrollToTarget(0)} className="link-underline">
          Back to top ↑
        </button>
      </footer>
    </section>
  );
}
