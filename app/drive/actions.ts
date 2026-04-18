'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { createCar, deleteCar } from '@/lib/db';

export async function addCar(formData: FormData) {
  const session = await requireSession();
  const company = String(formData.get('company') || '').trim();
  if (!company) return;
  const pickup_location = String(formData.get('pickup_location') || '').trim() || null;
  const pickup_address = String(formData.get('pickup_address') || '').trim() || null;
  const pickup_at_raw = String(formData.get('pickup_at') || '').trim();
  const return_at_raw = String(formData.get('return_at') || '').trim();
  const confirmation = String(formData.get('confirmation') || '').trim() || null;
  await createCar({
    family: session.family,
    company,
    pickup_location,
    pickup_address,
    pickup_at: pickup_at_raw ? new Date(pickup_at_raw).toISOString() : null,
    return_at: return_at_raw ? new Date(return_at_raw).toISOString() : null,
    confirmation,
  });
  revalidatePath('/');
  revalidatePath('/drive');
  redirect('/drive');
}

export async function removeCarAction(id: number) {
  await requireSession();
  await deleteCar(id);
  revalidatePath('/');
  revalidatePath('/drive');
}
