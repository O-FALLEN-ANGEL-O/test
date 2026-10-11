/** Invisible reCAPTCHA v3: loaded on demand, one token per submission. */
type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};
declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

let loading: Promise<Grecaptcha> | null = null;

export function loadRecaptcha(): Promise<Grecaptcha> {
  if (!RECAPTCHA_SITE_KEY) return Promise.reject(new Error('reCAPTCHA not configured'));
  loading ??= new Promise<Grecaptcha>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
    s.async = true;
    s.onload = () => window.grecaptcha?.ready(() => resolve(window.grecaptcha!));
    s.onerror = () => {
      loading = null; // allow a retry on the next attempt
      reject(new Error('reCAPTCHA failed to load'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Token for the "contact" action, or '' when reCAPTCHA isn't configured or can't load. */
export async function captchaToken(): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) return '';
  try {
    const g = await loadRecaptcha();
    return await g.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
  } catch {
    return '';
  }
}
