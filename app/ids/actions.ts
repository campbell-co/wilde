'use server';

import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';
import { requireSession } from '@/lib/auth';
import { upsertPersonId, deletePersonId, updatePersonPhone } from '@/lib/db';

// Ensure the personId belongs to the session's family
async function assertOwnsPerson(personId: number, family: string) {
  const { rows } = await sql<{ family: string }>`SELECT family FROM people WHERE id = ${personId}`;
  if (rows[0]?.family !== family) throw new Error('Not allowed');
}

async function assertOwnsId(idRowId: number, family: string) {
  const { rows } = await sql<{ family: string }>`
    SELECT p.family FROM person_ids pi JOIN people p ON p.id = pi.person_id WHERE pi.id = ${idRowId}
  `;
  if (rows[0]?.family !== family) throw new Error('Not allowed');
}

export async function addId(personId: number, formData: FormData) {
  const session = await requireSession();
  await assertOwnsPerson(personId, session.family);
  const label = String(formData.get('label') || '').trim().toUpperCase();
  const value = String(formData.get('value') || '').trim();
  if (!label || !value) return;
  await upsertPersonId(personId, label, value);
  revalidatePath('/');
  revalidatePath('/ids');
}

export async function removeIdAction(idRowId: number) {
  const session = await requireSession();
  await assertOwnsId(idRowId, session.family);
  await deletePersonId(idRowId);
  revalidatePath('/');
  revalidatePath('/ids');
}

export async function updatePhone(personId: number, formData: FormData) {
  const session = await requireSession();
  await assertOwnsPerson(personId, session.family);
  const phone = String(formData.get('phone') || '').trim();
  await updatePersonPhone(personId, phone);
  revalidatePath('/');
  revalidatePath('/ids');
}
