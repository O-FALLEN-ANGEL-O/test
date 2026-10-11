// Vercel Function behind the contact form.
//  1. Validates the submission, rejects cross-site posts, oversized bodies and honeypot bots.
//  2. Rate-limits per IP.
//  3. Verifies the visitor's reCAPTCHA v3 token with Google (when RECAPTCHA_SECRET is set).
//  4. Forwards the message to the owner's WhatsApp through CallMeBot (when configured).
//
// Env vars (server-side only — never prefix these with VITE_):
//   RECAPTCHA_SECRET       — reCAPTCHA v3 secret key
//   RECAPTCHA_MIN_SCORE    — optional, 0..1, default 0.5 (lower = more lenient)
//   CALLMEBOT_PHONE        — WhatsApp number with country code, digits only, e.g. 918105561638
//   CALLMEBOT_APIKEY       — key CallMeBot sends after you register that number
//
// Response: 200 { ok, whatsapp: 'sent' | 'failed' | 'off' } once the submission is accepted;
// 4xx { ok: false, error } when it is rejected (the client then sends nothing else).

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 8 * 1024;
// Best effort only: each warm function instance keeps its own counts.
const hits = new Map();

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

/** Trims, strips control characters and caps length. */
const clean = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** Only accept posts made by pages on this same site. */
function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser clients still face the captcha
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function verifyCaptcha(secret, token, ip) {
  if (!token) return false;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8_000),
    });
    const r = await res.json();
    const min = Number(process.env.RECAPTCHA_MIN_SCORE ?? 0.5);
    return r.success === true && r.action === 'contact' && typeof r.score === 'number' && r.score >= min;
  } catch {
    return false;
  }
}

async function sendWhatsApp(text) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return 'off';
  const url =
    'https://api.callmebot.com/whatsapp.php' +
    `?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403);
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'too-large' }, 413);
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: 'too-large' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'bad-request' }, 400);
  }
  // Honeypot field filled in → a bot. Pretend success so it doesn't retry.
  if (body.botcheck) return json({ ok: true, whatsapp: 'off' });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const message = clean(body.message, 1000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 2) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return json({ ok: false, error: 'rate-limited' }, 429);

  const secret = process.env.RECAPTCHA_SECRET;
  if (secret && !(await verifyCaptcha(secret, clean(body.captcha, 4096), ip))) {
    return json({ ok: false, error: 'captcha' }, 403);
  }

  const whatsapp = await sendWhatsApp(`New message from praxel.space\n\nFrom: ${name}\nEmail: ${email}\n\n${message}`);
  return json({ ok: true, whatsapp });
}

export function GET() {
  return json({ ok: false, error: 'method-not-allowed' }, 405);
}
