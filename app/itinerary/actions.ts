'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { requireSession } from '@/lib/auth';
import {
  upsertItineraryDay, deleteItineraryDay,
  createItineraryItem, updateItineraryItem, deleteItineraryItem,
} from '@/lib/db';

export async function addDay(formData: FormData) {
  await requireSession();
  const date = String(formData.get('date') || '').trim();
  if (!date) return;
  // Don't blow away an existing day's title/notes if someone re-adds the same date
  const { rows } = await sql<{ id: number }>`SELECT id FROM itinerary_days WHERE date = ${date}`;
  let dayId: number;
  if (rows[0]?.id) {
    dayId = rows[0].id;
  } else {
    const day = await upsertItineraryDay(date, null, null);
    dayId = day.id;
  }
  revalidatePath('/');
  revalidatePath('/itinerary');
  redirect(`/itinerary/${dayId}`);
}

export async function saveDay(dayId: number, formData: FormData) {
  await requireSession();
  const date = String(formData.get('date') || '').trim();
  const title = String(formData.get('title') || '').trim() || null;
  const notes = String(formData.get('notes') || '').trim() || null;
  if (!date) return;
  await upsertItineraryDay(date, title, notes);

  // Parse items[] — fields are arrays (new items have id='')
  const ids = formData.getAll('item_id').map(String);
  const times = formData.getAll('item_time').map(String);
  const types = formData.getAll('item_type').map(String);
  const names = formData.getAll('item_name').map(String);
  const addrs = formData.getAll('item_address').map(String);
  const notesArr = formData.getAll('item_notes').map(String);

  // Snapshot the ids that existed BEFORE this save so we can tell
  // what was deleted client-side.
  const { rows: preexisting } = await sql<{ id: number }>`
    SELECT id FROM itinerary_items WHERE day_id = ${dayId}
  `;
  const preexistingIds = new Set(preexisting.map((r) => r.id));
  const keptIds = new Set<number>();

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const payload = {
      time: times[i]?.trim() || null,
      type: types[i]?.trim() || 'ACTIVITY',
      name: names[i]?.trim() || '',
      address: addrs[i]?.trim() || null,
      notes: notesArr[i]?.trim() || null,
    };
    if (!payload.name) continue;
    if (id) {
      const existingId = Number(id);
      await updateItineraryItem(existingId, payload);
      keptIds.add(existingId);
    } else {
      await createItineraryItem({
        day_id: dayId,
        time: payload.time,
        type: payload.type,
        name: payload.name,
        address: payload.address,
        notes: payload.notes,
        sort_order: i,
      });
    }
  }

  // Delete any items that EXISTED before this save but weren't submitted.
  // (We compare against the pre-save snapshot, so newly-created items
  // from this same save are safe.)
  for (const oldId of preexistingIds) {
    if (!keptIds.has(oldId)) {
      await deleteItineraryItem(oldId);
    }
  }

  revalidatePath('/');
  revalidatePath('/itinerary');
  revalidatePath(`/itinerary/${dayId}`);
  redirect('/itinerary');
}

export async function removeItem(itemId: number, dayId: number) {
  await requireSession();
  await deleteItineraryItem(itemId);
  revalidatePath('/');
  revalidatePath(`/itinerary/${dayId}`);
}

export async function removeDay(dayId: number) {
  await requireSession();
  await deleteItineraryDay(dayId);
  revalidatePath('/');
  revalidatePath('/itinerary');
  redirect('/itinerary');
}
