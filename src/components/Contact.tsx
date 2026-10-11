import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap, prefersReducedMotion, scrollToTarget } from '../lib/motion';
import { profile } from '../data';
import Split from './Split';
import Magnetic from './Magnetic';
import { captchaToken, loadRecaptcha, RECAPTCHA_SITE_KEY } from '../lib/recaptcha';

const FORM_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'blocked';
type Outcome = 'ok' | 'mailto' | 'error' | 'blocked';

/**
 * Keyless email: FormSubmit (https://formsubmit.co) relays the message straight to
 * profile.email. The very first submission makes FormSubmit email that address an
 * activation link; once clicked, every message is delivered.
 */
async function sendViaFormSubmit(fields: { name: string; email: string; message: string }) {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(profile.email)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        ...fields,
        _subject: `Portfolio enquiry from ${fields.name}`,
        _replyto: fields.email,
        _template: 'table',
        _captcha: 'false', // our own reCAPTCHA + server checks already ran
      }),
    });
    const j = await res.json();
    if (String(j.success) === 'true') return true;
    console.warn('FormSubmit did not deliver the message:', j.message);
  } catch (err) {
    console.warn('FormSubmit unreachable:', err);
  }
  return false;
}

/**
 * Our /api/contact function checks the submission first (validation, rate limit,
 * reCAPTCHA) and forwards it to WhatsApp. Only once it is accepted does the email
 * copy go out — through FormSubmit (no key needed), or Web3Forms when a key is set.
 * Either channel getting through counts as sent.
 */
async function deliver(data: FormData): Promise<Outcome> {
  const fields = {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    message: String(data.get('message') ?? ''),
  };

  // The build-time key is optional; the function also hands one out at runtime.
  let emailKey = FORM_KEY;
  let whatsapp = false;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...fields, botcheck: data.get('botcheck') ? 'on' : '', captcha: await captchaToken() }),
    });
    // 4xx = the server looked at it and said no (bot, invalid, too many): send nothing else.
    if (res.status >= 400 && res.status < 500 && res.status !== 404) return 'blocked';
    if (res.ok) {
      const j = await res.json();
      whatsapp = j.whatsapp === 'sent';
      emailKey ||= j.emailKey;
    }
  } catch {
    /* function unreachable (e.g. plain `vite dev`) — fall through to email */
  }

  if (emailKey) {
    // Optional: Web3Forms, when an access key is configured.
    const mail = new FormData();
    Object.entries(fields).forEach(([k, v]) => mail.append(k, v));
    mail.append('access_key', emailKey);
    mail.append('subject', `Portfolio enquiry from ${fields.name}`);
    mail.append('from_name', 'praxel.space contact form');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { accept: 'application/json' },
        body: mail,
      });
      const j = await res.json();
      if (j.success) return 'ok';
      console.warn('Web3Forms rejected the message:', j.message);
    } catch (err) {
      console.warn('Web3Forms unreachable:', err);
    }
  } else if (await sendViaFormSubmit(fields)) {
    return 'ok';
  }
  if (whatsapp) return 'ok';
  return 'error';
}

function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [letter, setLetter] = useState({ name: '', message: '' });
  const formRef = useRef<HTMLFormElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const tick = useRef<SVGPathElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Fetch reCAPTCHA as the form approaches the viewport, so the token is ready on submit.
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !formRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        loadRecaptcha().catch(() => {});
        io.disconnect();
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(formRef.current);
    return () => io.disconnect();
  }, []);

  /** Form → letter → folded into an envelope → sealed. Pauses there until the send settles. */
  const buildTimeline = (onSealed: () => void) => {
    const envelope = flyer.current!.querySelectorAll('.env-part');
    return gsap
      .timeline()
      .set(stage.current, { autoAlpha: 1 })
      .set(flap.current, { rotateX: 180, transformPerspective: 600, zIndex: -1 }) // open, tucked behind the letter
      .to(formRef.current, { autoAlpha: 0, scale: 0.96, filter: 'blur(6px)', duration: 0.35, ease: 'power2.in' })
      .fromTo(paper.current, { y: -40, scale: 1.08, autoAlpha: 0, rotate: -3 }, { y: -40, scale: 1, rotate: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }, '<0.15')
      .fromTo(envelope, { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.4)' }, '-=0.1')
      .to(paper.current, { scaleY: 0.6, duration: 0.3, ease: 'power2.in' })
      .to(paper.current, { y: 60, duration: 0.45, ease: 'power3.in' })
      .set(flap.current, { zIndex: 5 })
      .to(flap.current, { rotateX: 0, duration: 0.4, ease: 'power2.inOut' })
      .fromTo(stamp.current, { scale: 0, rotate: -30 }, { scale: 1, rotate: 8, duration: 0.35, ease: 'back.out(3)' })
      .addPause('+=0', onSealed)
      .to(flyer.current, { y: -14, duration: 0.2, ease: 'power1.out' })
      .to(flyer.current, { x: 560, y: -460, rotate: 24, scale: 0.4, autoAlpha: 0, duration: 0.9, ease: 'power3.in' })
      .set(stage.current, { autoAlpha: 0 })
      .fromTo(done.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' })
      .fromTo(tick.current, { strokeDashoffset: 48 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '<0.15');
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '');
    const message = String(data.get('message') ?? '');
    // Render the letter's text before the animation measures it.
    flushSync(() => {
      setLetter({ name, message });
      setStatus('sending');
    });

    const sealed = prefersReducedMotion
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          tl.current?.kill();
          tl.current = buildTimeline(resolve);
        });
    const [outcome] = await Promise.all([deliver(data), sealed]);

    if (outcome === 'ok') {
      form.reset();
      setStatus('sent');
      if (tl.current) tl.current.play();
      else gsap.set(done.current, { autoAlpha: 1 });
      return;
    }
    // Unwind the envelope back into the form, keeping what the visitor typed.
    const settle = () => {
      setStatus(outcome === 'mailto' ? 'idle' : outcome === 'blocked' ? 'blocked' : 'error');
      if (outcome === 'mailto') {
        const body = `${message}\n\n— ${name} (${data.get('email')})`;
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent('Portfolio enquiry')}&body=${encodeURIComponent(body)}`;
      }
    };
    if (tl.current) tl.current.eventCallback('onReverseComplete', settle).timeScale(2).reverse();
    else settle();
  };

  const reset = () => {
    tl.current?.revert();
    tl.current = null;
    gsap.set([formRef.current, done.current], { clearProps: 'all' });
    setStatus('idle');
    formRef.current?.querySelector<HTMLInputElement>('input:not([type=checkbox])')?.focus();
  };

  const field =
    'w-full rounded-xl border border-[#5a5a5a] bg-transparent px-3.5 py-3 text-base text-white outline-none transition-colors focus:border-white';
  const sent = status === 'sent';

  return (
    <div className="relative" style={{ perspective: '1000px' }}>
      <form
        ref={formRef}
        onSubmit={submit}
        onFocus={() => loadRecaptcha().catch(() => {})}
        className="flex flex-col gap-3"
        inert={sent || status === 'sending'}
        aria-hidden={sent || undefined}
      >
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
        <label className="block">
          <span className="mb-1.5 block text-[13px] text-[#c9c9c6]">Name</span>
          <input required name="name" autoComplete="name" maxLength={80} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] text-[#c9c9c6]">Email</span>
          <input required type="email" name="email" autoComplete="email" maxLength={120} className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] text-[#c9c9c6]">Message</span>
          <textarea required name="message" rows={3} maxLength={1000} className={`${field} resize-none`} />
        </label>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Magnetic>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition-opacity disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </Magnetic>
          <p role="status" className="text-sm text-[#c9c9c6]">
            {status === 'error' && `Couldn’t send just now — please email ${profile.email}.`}
            {status === 'blocked' && `That didn’t pass our spam check. Please try again, or email ${profile.email}.`}
          </p>
        </div>
        {RECAPTCHA_SITE_KEY && (
          <p className="text-xs leading-relaxed text-[#9a9a96]">
            Protected by reCAPTCHA — Google’s{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline text-[#c9c9c6]">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline text-[#c9c9c6]">
              Terms
            </a>{' '}
            apply.
          </p>
        )}
      </form>

      {/* The envelope animation, layered over the form. */}
      <div ref={stage} aria-hidden="true" className="pointer-events-none invisible absolute inset-0 flex items-center justify-center">
        <div ref={flyer} className="relative isolate h-[176px] w-[264px]">
          <div className="env-part absolute inset-0 rounded-lg bg-[#e3e3df]" />
          {/* Clip box ends just above the envelope's bottom edge, so the letter vanishes into it. */}
          <div className="absolute inset-x-3 bottom-2 top-[-150px] overflow-hidden">
            <div ref={paper} className="absolute inset-x-0 bottom-2 h-[250px] origin-bottom rounded-md bg-white p-4 text-ink shadow-lg">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">To: Prajwal D L</p>
              <p className="mt-2 text-sm font-medium">Dear Prajwal,</p>
              <p className="mt-1 line-clamp-6 text-[13px] leading-snug text-muted">{letter.message}</p>
              <p className="mt-2 text-right text-[13px] font-medium">— {letter.name}</p>
            </div>
          </div>
          <div className="env-part absolute inset-0 rounded-lg bg-[#f4f4f1] shadow-[0_20px_40px_rgba(0,0,0,0.35)]" style={{ clipPath: 'polygon(0 28%, 50% 66%, 100% 28%, 100% 100%, 0 100%)' }} />
          <svg className="env-part absolute inset-0 h-full w-full" viewBox="0 0 264 176" fill="none" stroke="#d2d2ce" strokeWidth="1.5">
            <path d="M2 174 132 104 262 174" />
          </svg>
          <div ref={flap} className="env-part absolute inset-x-0 top-0 h-[66%] origin-top rounded-t-lg bg-[#d9d9d5]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
          <span ref={stamp} className="env-part absolute right-3 top-3 z-10 flex h-10 w-8 items-center justify-center rounded-sm border-2 border-dashed border-ink/40 bg-white font-mono text-[9px] font-semibold text-ink">
            PDL
          </span>
        </div>
      </div>

      {/* Success */}
      <div
        ref={done}
        role="status"
        aria-live="polite"
        aria-hidden={!sent || undefined}
        className={`absolute inset-0 flex flex-col items-start justify-center gap-4 ${sent ? '' : 'invisible opacity-0'}`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink">
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path ref={tick} d="M5 12.5 10 17.5 19 7" strokeDasharray="48" />
          </svg>
        </span>
        <p className="text-3xl font-semibold tracking-tight">Message sent.</p>
        <p className="max-w-sm text-[15px] leading-relaxed text-[#c9c9c6]">
          Thanks{letter.name ? `, ${letter.name.split(' ')[0]}` : ''}. Your message is on its way to me — I usually reply within a day.
        </p>
        <button type="button" onClick={reset} tabIndex={sent ? undefined : -1} className="link-underline text-[15px] font-medium">
          Send another message
        </button>
      </div>
    </div>
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
