-- Run once against your Vercel Postgres database to set up tables.
-- You can run this via `vercel env pull` then `psql $POSTGRES_URL -f schema.sql`
-- or paste it into the Vercel Postgres dashboard query editor.

CREATE TABLE IF NOT EXISTS flights (
  id SERIAL PRIMARY KEY,
  family TEXT NOT NULL, -- 'campbell' | 'newby'
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  airline TEXT,
  flight_number TEXT,
  depart_at TIMESTAMPTZ NOT NULL,
  arrive_at TIMESTAMPTZ NOT NULL,
  confirmation TEXT,
  status TEXT DEFAULT 'ON TIME',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  family TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  check_in DATE,
  check_out DATE,
  confirmation TEXT,
  phone TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  family TEXT NOT NULL,
  company TEXT NOT NULL,
  pickup_location TEXT,
  pickup_address TEXT,
  pickup_at TIMESTAMPTZ,
  return_at TIMESTAMPTZ,
  confirmation TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trains (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  operator TEXT,
  depart_at TIMESTAMPTZ NOT NULL,
  arrive_at TIMESTAMPTZ NOT NULL,
  confirmation TEXT,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dinners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  reservation_at TIMESTAMPTZ NOT NULL,
  party_size INT,
  confirmation TEXT,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itinerary_days (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itinerary_items (
  id SERIAL PRIMARY KEY,
  day_id INT REFERENCES itinerary_days(id) ON DELETE CASCADE,
  time TEXT, -- free-text like '8:00 PM' or '10:00 AM'
  type TEXT NOT NULL DEFAULT 'ACTIVITY', -- 'EAT' | 'STAY' | 'ACTIVITY' | 'FLY' | 'RIDE'
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  family TEXT NOT NULL, -- 'campbell' | 'newby'
  name TEXT NOT NULL,
  phone TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS person_ids (
  id SERIAL PRIMARY KEY,
  person_id INT REFERENCES people(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- 'PASSPORT', 'KTN', 'GLOBAL', 'AADV', etc.
  value TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL, -- phone number
  category TEXT DEFAULT 'EMERGENCY', -- 'EMERGENCY' | 'HOTEL' | 'OTHER'
  sort_order INT DEFAULT 0
);

-- Seed the four of you
INSERT INTO people (family, name, sort_order) VALUES
  ('campbell', 'Blake', 1),
  ('campbell', 'Mary Kate', 2),
  ('newby', 'Luke', 3),
  ('newby', 'Sam', 4)
ON CONFLICT DO NOTHING;

-- Seed UK emergency numbers
INSERT INTO emergency_contacts (label, value, category, sort_order) VALUES
  ('UK Emergency', '999', 'EMERGENCY', 1),
  ('Non-emergency', '101', 'EMERGENCY', 2),
  ('US Embassy London', '+442074999000', 'EMERGENCY', 3)
ON CONFLICT DO NOTHING;
