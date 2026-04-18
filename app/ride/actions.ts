'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { createTrain, deleteTrain } from '@/lib/db';

export async function addTrain(formData: FormData) {
  await requireSession();
  const origin = String(formData.get('origin') || '').trim();
  const destination = String(formData.get('destination') || '').trim();
  const operator = String(formData.get('operator') || '').trim() || null;
  const depart_at = String(formData.get('depart_at') || '').trim();
  const arrive_at = String(formData.get('arrive_at') || '').trim();
  const confirmation = String(formData.get('confirmation') || '').trim() || null;
  const notes = String(formData.get('notes') || '').trim() || null;
  if (!origin || !destination || !depart_at || !arrive_at) return;
  await createTrain({
    origin,
    destination,
    operator,
    depart_at: new Date(depart_at).toISOString(),
    arrive_at: new Date(arrive_at).toISOString(),
    confirmation,
    notes,
  });
  revalidatePath('/');
  revalidatePath('/ride');
  redirect('/ride');
}

export async function removeTrainAction(id: number) {
  await requireSession();
  await deleteTrain(id);
  revalidatePath('/');
  revalidatePath('/ride');
}
