// Vercel Function: forwards a contact-form submission to the site owner's WhatsApp
// through CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/).
// Secrets live in Vercel env vars so they never reach the browser:
//   CALLMEBOT_PHONE   — your WhatsApp number with country code, e.g. 918105561638
//   CALLMEBOT_APIKEY  — the key CallMeBot sends you after you register that number

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best effort only: each warm function instance keeps its own counts.
const hits = new Map();

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

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

export async function POST(request) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return json({ ok: false, error: 'not-configured' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad-request' }, 400);
  }
  // Honeypot field filled in → a bot. Pretend success so it doesn't retry.
  if (body.botcheck) return json({ ok: true });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const message = clean(body.message, 1000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 2) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return json({ ok: false, error: 'rate-limited' }, 429);

  const text = `New message from praxel.space\n\nFrom: ${name}\nEmail: ${email}\n\n${message}`;
  const url =
    'https://api.callmebot.com/whatsapp.php' +
    `?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return json({ ok: false, error: 'whatsapp-failed' }, 502);
  } catch {
    return json({ ok: false, error: 'whatsapp-failed' }, 502);
  }
  return json({ ok: true });
}

export function GET() {
  return json({ ok: false, error: 'method-not-allowed' }, 405);
}
