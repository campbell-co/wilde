# Wilde England

A private trip app for Campbell × Newby, London 2026.

Built with Next.js 14 (App Router), Vercel Postgres, Google Places API, Open-Meteo weather, and Frankfurter FX rates. PWA-enabled for offline + home screen install.

---

## Features

- **Countdown** to your next flight, with live CDT/BST clocks
- **Campbell / Newby tabs** — each couple sees their own flights, hotel, rental car, phones
- **Itinerary builder** — multi-item days with Google Places address autocomplete
- **Weather** — Open-Meteo forecast low/high per itinerary day, plus today in Keller
- **NOW strip** — mid-trip, shows "next up" with countdown to the next item
- **FLY / STAY / DRIVE / EAT / RIDE** sections, each with an edit page
- **One-tap copy** on every confirmation number
- **Google Maps links** on every address
- **Tap-to-call** on every phone number
- **IDs & DOCS drawer** — per-couple, locked to your passphrase (Campbell never sees Newby's IDs and vice versa)
- **SOS drawer** — UK emergency numbers, hotel front desks, all four of your phone numbers
- **CONVERT drawer** — live GBP ↔ USD converter
- **PWA** — add to home screen, works offline with cached shell + last-viewed data
- **Simple passphrase login** — one shared per couple, httpOnly cookie

---

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in the values (see below)
npm run dev
```

Then open http://localhost:3000. You'll hit `/login` first.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

### `APP_PASSPHRASES`
Pipe-separated `passphrase:family` pairs. Each couple gets one.

```
APP_PASSPHRASES=wildeblake:campbell|wildesam:newby
```

Pick your own passphrases. Anyone with a passphrase can log in; the app remembers which family they belong to and shows the right IDs.

### `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
Needed for the address autocomplete on itinerary / hotel / car / dinner forms.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or reuse one)
3. Enable the **Places API (New)** — not the legacy one
4. Go to Credentials → Create Credentials → API Key
5. **Restrict the key**: Under "API restrictions", allow only `Places API (New)`. Under "Application restrictions", add your domain(s) (localhost for dev, your-app.vercel.app for prod) as HTTP referrers
6. Paste the key into `.env.local`

Cost: the Places API (New) gives you a generous free monthly allowance. For a private 4-person app, you'll be nowhere near the free tier.

### Vercel Postgres vars
Auto-populated when you link a Postgres database in Vercel. For local dev, run `vercel env pull .env.local` after linking.

---

## Database setup

After creating a Vercel Postgres database, run the schema:

**Option A — Vercel dashboard:** Open your database → Query editor → paste `schema.sql` → run.

**Option B — local:** Pull env vars then run psql:

```bash
vercel env pull .env.local
source .env.local
psql "$POSTGRES_URL" -f schema.sql
```

The schema creates all tables and seeds the four people (Blake, Mary Kate, Luke, Sam) and UK emergency contacts.

### Adding phone numbers and IDs

The easiest way: log in, tap IDs & DOCS → MANAGE IDs, and add them from the UI. They're scoped to your family, so Blake adds Blake's & Mary Kate's; Luke adds Luke's & Sam's.

Alternatively, for bulk loading, edit and run `seed-trip.sql` (a template is included). Never commit real passport numbers or ID values to the repo.

---

## Deploy to Vercel

```bash
# First time
npm install -g vercel
vercel

# Add Postgres from the Vercel dashboard → Storage → Create → Postgres
# Link it to this project, then pull env vars:
vercel env pull .env.local

# Run the schema against the production DB
psql "$POSTGRES_URL" -f schema.sql

# Push the passphrase + Google Maps key env vars
vercel env add APP_PASSPHRASES
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Deploy
vercel --prod
```

---

## Install on your iPhone

1. Open your deployed URL in Safari (must be Safari, not Chrome, for full PWA behavior on iOS)
2. Log in with your passphrase
3. Tap the Share button → "Add to Home Screen"
4. Name it "Wilde England" (default), tap Add
5. Icon appears on your home screen. Opens full-screen, works offline after first load.

---

## Project structure

```
app/
  page.tsx                 — main home screen
  login/                   — passphrase gate
  logout/                  — route handler that clears cookie
  itinerary/               — list + day editor (with Places autocomplete)
  fly/ stay/ drive/ eat/ ride/   — per-section edit pages
  ids/                     — manage your family's IDs + phone numbers
  api/places/              — server proxies for Google Places (keeps key server-side)
components/
  Countdown.tsx            — live-updating countdown + CDT/BST clocks
  NowStrip.tsx             — "next up" indicator during the trip
  Drawer.tsx               — collapsible bottom panels
  PersonCard.tsx           — collapsible per-person ID list
  Converter.tsx            — GBP ↔ USD
  CopyButton.tsx           — tap-to-copy
  PlacesAutocomplete.tsx   — Google Places-powered address field
lib/
  auth.ts                  — cookie-based passphrase session
  db.ts                    — Vercel Postgres helpers
  weather.ts               — Open-Meteo (free, no key)
  currency.ts              — Frankfurter FX (free, no key)
  utils.ts                 — maps links, tel links, date formatters, countdown math
public/
  manifest.json            — PWA manifest
  sw.js                    — service worker for offline
  icons/                   — app icons
schema.sql                 — tables + seed data
middleware.ts              — gates everything except /login
```

---

## Customizing

- **Change the title**: search for `WILDE` in `app/page.tsx` and `app/login/page.tsx`
- **Change passphrases**: edit `APP_PASSPHRASES` env var, redeploy
- **Change the countdown logic**: `components/Countdown.tsx` → it pulls the next flight from `getNextFlight(session.family)`, so whichever couple is logged in sees their own next flight
- **Add a new ID type**: just type it in the IDs manage page — there's a datalist of common ones but anything works
- **Change weather locations**: `lib/weather.ts` exports `LONDON` and `KELLER` constants. Add more as needed.

---

Cheers to London 2026. 🇬🇧
