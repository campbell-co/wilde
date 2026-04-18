'use server';

import { redirect } from 'next/navigation';
import { setSession, verifyPassphrase, clearSession } from '@/lib/auth';

export async function login(formData: FormData) {
  const input = String(formData.get('passphrase') || '').trim();
  if (!input) redirect('/login?error=1');
  const family = verifyPassphrase(input);
  if (!family) redirect('/login?error=1');
  await setSession(family);
  redirect('/');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}
