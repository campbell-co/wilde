'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { createHotel, deleteHotel } from '@/lib/db';

export async function addHotel(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get('name') || '').trim();
  const address = String(formData.get('address') || '').trim() || null;
  const check_in = String(formData.get('check_in') || '').trim() || null;
  const check_out = String(formData.get('check_out') || '').trim() || null;
  const phone = String(formData.get('phone') || '').trim() || null;
  const confirmation = String(formData.get('confirmation') || '').trim() || null;
  if (!name) return;
  await createHotel({
    family: session.family,
    name,
    address,
    check_in,
    check_out,
    phone,
    confirmation,
  });
  revalidatePath('/');
  revalidatePath('/stay');
  redirect('/stay');
}

export async function removeHotelAction(id: number) {
  await requireSession();
  await deleteHotel(id);
  revalidatePath('/');
  revalidatePath('/stay');
}
