'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { createDinner, deleteDinner } from '@/lib/db';

export async function addDinner(formData: FormData) {
  await requireSession();
  const name = String(formData.get('name') || '').trim();
  const address = String(formData.get('address') || '').trim() || null;
  const reservation_at = String(formData.get('reservation_at') || '').trim();
  const party_size_raw = String(formData.get('party_size') || '').trim();
  const confirmation = String(formData.get('confirmation') || '').trim() || null;
  const notes = String(formData.get('notes') || '').trim() || null;
  if (!name || !reservation_at) return;
  await createDinner({
    name,
    address,
    reservation_at: new Date(reservation_at).toISOString(),
    party_size: party_size_raw ? Number(party_size_raw) : null,
    confirmation,
    notes,
  });
  revalidatePath('/');
  revalidatePath('/eat');
  redirect('/eat');
}

export async function removeDinnerAction(id: number) {
  await requireSession();
  await deleteDinner(id);
  revalidatePath('/');
  revalidatePath('/eat');
}
