'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { createFlight, deleteFlight } from '@/lib/db';

export async function addFlight(formData: FormData) {
  const session = await requireSession();
  const origin = String(formData.get('origin') || '').trim().toUpperCase();
  const destination = String(formData.get('destination') || '').trim().toUpperCase();
  const airline = String(formData.get('airline') || '').trim() || null;
  const flight_number = String(formData.get('flight_number') || '').trim() || null;
  const depart_at = String(formData.get('depart_at') || '').trim();
  const arrive_at = String(formData.get('arrive_at') || '').trim();
  const confirmation = String(formData.get('confirmation') || '').trim() || null;
  if (!origin || !destination || !depart_at || !arrive_at) return;
  await createFlight({
    family: session.family,
    origin,
    destination,
    airline,
    flight_number,
    depart_at: new Date(depart_at).toISOString(),
    arrive_at: new Date(arrive_at).toISOString(),
    confirmation,
    status: 'ON TIME',
  });
  revalidatePath('/');
  revalidatePath('/fly');
  redirect('/fly');
}

export async function removeFlightAction(id: number) {
  await requireSession();
  await deleteFlight(id);
  revalidatePath('/');
  revalidatePath('/fly');
}
