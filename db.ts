import { sql } from '@vercel/postgres';

export type Flight = {
  id: number;
  family: string;
  origin: string;
  destination: string;
  airline: string | null;
  flight_number: string | null;
  depart_at: string;
  arrive_at: string;
  confirmation: string | null;
  status: string | null;
  sort_order: number;
};

export type Hotel = {
  id: number;
  family: string;
  name: string;
  address: string | null;
  check_in: string | null;
  check_out: string | null;
  confirmation: string | null;
  phone: string | null;
  sort_order: number;
};

export type Car = {
  id: number;
  family: string;
  company: string;
  pickup_location: string | null;
  pickup_address: string | null;
  pickup_at: string | null;
  return_at: string | null;
  confirmation: string | null;
  sort_order: number;
};

export type Train = {
  id: number;
  origin: string;
  destination: string;
  operator: string | null;
  depart_at: string;
  arrive_at: string;
  confirmation: string | null;
  notes: string | null;
  sort_order: number;
};

export type Dinner = {
  id: number;
  name: string;
  address: string | null;
  reservation_at: string;
  party_size: number | null;
  confirmation: string | null;
  notes: string | null;
  sort_order: number;
};

export type ItineraryDay = {
  id: number;
  date: string;
  title: string | null;
  notes: string | null;
};

export type ItineraryItem = {
  id: number;
  day_id: number;
  time: string | null;
  type: string;
  name: string;
  address: string | null;
  notes: string | null;
  sort_order: number;
};

export type Person = {
  id: number;
  family: string;
  name: string;
  phone: string | null;
  sort_order: number;
};

export type PersonId = {
  id: number;
  person_id: number;
  label: string;
  value: string;
  sort_order: number;
};

export type EmergencyContact = {
  id: number;
  label: string;
  value: string;
  category: string;
  sort_order: number;
};

// --- READ ---

export async function getFlights(family: string) {
  const { rows } = await sql<Flight>`
    SELECT * FROM flights WHERE family = ${family}
    ORDER BY depart_at ASC, sort_order ASC
  `;
  return rows;
}

export async function getHotels(family: string) {
  const { rows } = await sql<Hotel>`
    SELECT * FROM hotels WHERE family = ${family}
    ORDER BY check_in ASC NULLS LAST, sort_order ASC
  `;
  return rows.map((r) => ({
    ...r,
    check_in: r.check_in ? normalizeDate(r.check_in as unknown as string | Date) : null,
    check_out: r.check_out ? normalizeDate(r.check_out as unknown as string | Date) : null,
  }));
}

export async function getCars(family: string) {
  const { rows } = await sql<Car>`
    SELECT * FROM cars WHERE family = ${family}
    ORDER BY pickup_at ASC NULLS LAST, sort_order ASC
  `;
  return rows;
}

export async function getTrains() {
  const { rows } = await sql<Train>`
    SELECT * FROM trains ORDER BY depart_at ASC, sort_order ASC
  `;
  return rows;
}

export async function getDinners() {
  const { rows } = await sql<Dinner>`
    SELECT * FROM dinners ORDER BY reservation_at ASC, sort_order ASC
  `;
  return rows;
}

export async function getItineraryDays() {
  const { rows } = await sql<ItineraryDay>`
    SELECT * FROM itinerary_days ORDER BY date ASC
  `;
  // Neon returns DATE columns as JS Date objects. Normalize to YYYY-MM-DD strings
  // so the rest of the app can just do string comparisons.
  return rows.map((r) => ({
    ...r,
    date: normalizeDate(r.date as unknown as string | Date),
  }));
}

function normalizeDate(v: string | Date): string {
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, '0');
    const d = String(v.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(v).slice(0, 10);
}

export async function getItineraryItems() {
  const { rows } = await sql<ItineraryItem>`
    SELECT * FROM itinerary_items ORDER BY day_id ASC, sort_order ASC, time ASC
  `;
  return rows;
}

export async function getPeople(family: string) {
  const { rows } = await sql<Person>`
    SELECT * FROM people WHERE family = ${family} ORDER BY sort_order ASC
  `;
  return rows;
}

export async function getPersonIds(personIds: number[]) {
  if (personIds.length === 0) return [];
  // Build an IN (...) clause. Vercel Postgres' tagged template doesn't
  // great-handle array bindings, so use a parameterized query.
  const placeholders = personIds.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = await sql.query<PersonId>(
    `SELECT * FROM person_ids WHERE person_id IN (${placeholders}) ORDER BY person_id ASC, sort_order ASC`,
    personIds
  );
  return rows;
}

export async function getEmergencyContacts() {
  const { rows } = await sql<EmergencyContact>`
    SELECT * FROM emergency_contacts ORDER BY category ASC, sort_order ASC
  `;
  return rows;
}

export async function getNextFlight(family: string) {
  const { rows } = await sql<Flight>`
    SELECT * FROM flights
    WHERE family = ${family} AND depart_at > NOW()
    ORDER BY depart_at ASC
    LIMIT 1
  `;
  return rows[0] ?? null;
}

// --- WRITE: itinerary ---

export async function upsertItineraryDay(date: string, title: string | null, notes: string | null) {
  const { rows } = await sql<ItineraryDay>`
    INSERT INTO itinerary_days (date, title, notes)
    VALUES (${date}, ${title}, ${notes})
    ON CONFLICT (date) DO UPDATE SET title = EXCLUDED.title, notes = EXCLUDED.notes
    RETURNING *
  `;
  return rows[0];
}

export async function deleteItineraryDay(id: number) {
  await sql`DELETE FROM itinerary_days WHERE id = ${id}`;
}

export async function createItineraryItem(item: {
  day_id: number;
  time: string | null;
  type: string;
  name: string;
  address: string | null;
  notes: string | null;
  sort_order: number;
}) {
  const { rows } = await sql<ItineraryItem>`
    INSERT INTO itinerary_items (day_id, time, type, name, address, notes, sort_order)
    VALUES (${item.day_id}, ${item.time}, ${item.type}, ${item.name}, ${item.address}, ${item.notes}, ${item.sort_order})
    RETURNING *
  `;
  return rows[0];
}

export async function updateItineraryItem(
  id: number,
  patch: { time?: string | null; type?: string; name?: string; address?: string | null; notes?: string | null }
) {
  const { rows } = await sql<ItineraryItem>`
    UPDATE itinerary_items
    SET
      time = ${patch.time ?? null},
      type = ${patch.type ?? 'ACTIVITY'},
      name = ${patch.name ?? ''},
      address = ${patch.address ?? null},
      notes = ${patch.notes ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteItineraryItem(id: number) {
  await sql`DELETE FROM itinerary_items WHERE id = ${id}`;
}

// --- WRITE: flights / hotels / cars / trains / dinners ---
// These are generic upserts. For brevity we only implement create/update/delete
// patterns needed by the edit UI.

export async function createFlight(f: Omit<Flight, 'id' | 'sort_order'> & { sort_order?: number }) {
  const { rows } = await sql<Flight>`
    INSERT INTO flights (family, origin, destination, airline, flight_number, depart_at, arrive_at, confirmation, status, sort_order)
    VALUES (${f.family}, ${f.origin}, ${f.destination}, ${f.airline}, ${f.flight_number}, ${f.depart_at}, ${f.arrive_at}, ${f.confirmation}, ${f.status ?? 'ON TIME'}, ${f.sort_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}

export async function deleteFlight(id: number) { await sql`DELETE FROM flights WHERE id = ${id}`; }

export async function createHotel(h: Omit<Hotel, 'id' | 'sort_order'> & { sort_order?: number }) {
  const { rows } = await sql<Hotel>`
    INSERT INTO hotels (family, name, address, check_in, check_out, confirmation, phone, sort_order)
    VALUES (${h.family}, ${h.name}, ${h.address}, ${h.check_in}, ${h.check_out}, ${h.confirmation}, ${h.phone}, ${h.sort_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}

export async function deleteHotel(id: number) { await sql`DELETE FROM hotels WHERE id = ${id}`; }

export async function createCar(c: Omit<Car, 'id' | 'sort_order'> & { sort_order?: number }) {
  const { rows } = await sql<Car>`
    INSERT INTO cars (family, company, pickup_location, pickup_address, pickup_at, return_at, confirmation, sort_order)
    VALUES (${c.family}, ${c.company}, ${c.pickup_location}, ${c.pickup_address}, ${c.pickup_at}, ${c.return_at}, ${c.confirmation}, ${c.sort_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}

export async function deleteCar(id: number) { await sql`DELETE FROM cars WHERE id = ${id}`; }

export async function createTrain(t: Omit<Train, 'id' | 'sort_order'> & { sort_order?: number }) {
  const { rows } = await sql<Train>`
    INSERT INTO trains (origin, destination, operator, depart_at, arrive_at, confirmation, notes, sort_order)
    VALUES (${t.origin}, ${t.destination}, ${t.operator}, ${t.depart_at}, ${t.arrive_at}, ${t.confirmation}, ${t.notes}, ${t.sort_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}

export async function deleteTrain(id: number) { await sql`DELETE FROM trains WHERE id = ${id}`; }

export async function createDinner(d: Omit<Dinner, 'id' | 'sort_order'> & { sort_order?: number }) {
  const { rows } = await sql<Dinner>`
    INSERT INTO dinners (name, address, reservation_at, party_size, confirmation, notes, sort_order)
    VALUES (${d.name}, ${d.address}, ${d.reservation_at}, ${d.party_size}, ${d.confirmation}, ${d.notes}, ${d.sort_order ?? 0})
    RETURNING *
  `;
  return rows[0];
}

export async function deleteDinner(id: number) { await sql`DELETE FROM dinners WHERE id = ${id}`; }

// --- WRITE: people / ids ---

export async function upsertPersonId(personId: number, label: string, value: string, sortOrder = 0) {
  const { rows } = await sql<PersonId>`
    INSERT INTO person_ids (person_id, label, value, sort_order)
    VALUES (${personId}, ${label}, ${value}, ${sortOrder})
    RETURNING *
  `;
  return rows[0];
}

export async function deletePersonId(id: number) {
  await sql`DELETE FROM person_ids WHERE id = ${id}`;
}

export async function updatePersonPhone(id: number, phone: string) {
  await sql`UPDATE people SET phone = ${phone} WHERE id = ${id}`;
}
