import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'we_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 120; // 120 days

export type Family = 'campbell' | 'newby';

export type Session = {
  family: Family;
};

function parsePassphrases(): Array<{ passphrase: string; family: Family }> {
  const raw = process.env.APP_PASSPHRASES || '';
  return raw.split('|').filter(Boolean).map((pair) => {
    const [passphrase, family] = pair.split(':');
    return { passphrase, family: (family as Family) || 'campbell' };
  });
}

export function verifyPassphrase(input: string): Family | null {
  const list = parsePassphrases();
  const match = list.find((p) => p.passphrase === input);
  return match?.family ?? null;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  if (raw !== 'campbell' && raw !== 'newby') return null;
  return { family: raw as Family };
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect('/login');
  return s;
}

export async function setSession(family: Family) {
  const store = await cookies();
  store.set(COOKIE_NAME, family, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
