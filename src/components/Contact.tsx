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
    'w-full border-b border-line bg-transparent py-4 text-lg outline-none transition-colors placeholder:text-muted/70 focus:border-accent';

  return (
    <form onSubmit={submit} className="space-y-2">
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="block">
        <span className="sr-only">Your name</span>
        <input required name="name" autoComplete="name" placeholder="Your name" className={field} />
      </label>
      <label className="block">
        <span className="sr-only">Email address</span>
        <input required type="email" name="email" autoComplete="email" placeholder="Email address" className={field} />
      </label>
      <label className="block">
        <span className="sr-only">Message</span>
        <textarea required name="message" rows={4} placeholder="Tell me about your project" className={`${field} resize-none`} />
      </label>
      <div className="flex items-center gap-6 pt-6">
        <Magnetic>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-full bg-accent px-8 py-4 font-medium text-bg transition-opacity disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </Magnetic>
        <p role="status" className="text-sm text-muted">
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
    <section id="contact" ref={root} data-scene="contact" className="relative flex min-h-[100svh] flex-col justify-between px-5 pt-32 md:px-10">
      <div>
        <p className="eyebrow">(05) — Contact</p>
        <h2 className="contact-title mt-6 text-[15vw] font-medium uppercase leading-[0.85] tracking-[-0.05em] md:text-[10vw]">
          <span className="line-mask">
            <Split text="Let’s build" />
          </span>
          <span className="line-mask serif normal-case italic text-accent">
            <Split text="something." />
          </span>
        </h2>
      </div>

      <div className="mt-20 grid gap-16 md:grid-cols-12">
        <div className="space-y-8 md:col-span-5">
          <a href={`mailto:${profile.email}`} className="link-underline serif block break-all text-3xl md:text-5xl">
            {profile.email}
          </a>
          <dl className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <dt className="eyebrow">Phone</dt>
              <dd className="mt-2">
                <a href={profile.phoneHref} className="link-underline">{profile.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Elsewhere</dt>
              <dd className="mt-2 space-x-4">
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="link-underline">LinkedIn ↗</a>
                <a href={profile.resume} download="Prajwal-DL-Resume.pdf" className="link-underline">Résumé ↓</a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl border border-line bg-bg/60 p-6 backdrop-blur-xl md:col-span-6 md:col-start-7 md:p-10">
          <ContactForm />
        </div>
      </div>

      <footer className="mt-24 flex flex-col gap-4 border-t border-line py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>© {year} Prajwal D L</p>
        <p className="serif text-base italic">Full stack developer · Debugging specialist · Mangalore</p>
        <button onClick={() => scrollToTarget(0)} className="link-underline self-start md:self-auto">
          Back to top ↑
        </button>
      </footer>
    </section>
  );
}
