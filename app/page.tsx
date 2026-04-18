import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import {
  getFlights, getHotels, getCars, getTrains, getDinners,
  getItineraryDays, getItineraryItems, getPeople, getPersonIds,
  getEmergencyContacts, getNextFlight,
} from '@/lib/db';
import { getForecast, getTodayForecast, LONDON, KELLER } from '@/lib/weather';
import { getGbpUsdRate } from '@/lib/currency';
import { mapsLink, telLink, fmtDateParts, fmtDate, fmtTime, parseLocalDate } from '@/lib/utils';
import Countdown from '@/components/Countdown';
import CopyButton from '@/components/CopyButton';
import Drawer from '@/components/Drawer';
import PersonCard from '@/components/PersonCard';
import Converter from '@/components/Converter';
import NowStrip from '@/components/NowStrip';

export const dynamic = 'force-dynamic';

type Search = { tab?: string };

export default async function HomePage({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await requireSession();
  const params = await searchParams;
  const activeTab = (params?.tab === 'newby' ? 'newby' : params?.tab === 'campbell' ? 'campbell' : session.family) as 'campbell' | 'newby';

  const [
    flights, hotels, cars, trains, dinners,
    days, items, ownPeople, emergencyContacts,
    todayKeller, rate, nextFlight,
  ] = await Promise.all([
    getFlights(activeTab),
    getHotels(activeTab),
    getCars(activeTab),
    getTrains(),
    getDinners(),
    getItineraryDays(),
    getItineraryItems(),
    getPeople(session.family),
    getEmergencyContacts(),
    getTodayForecast(KELLER.lat, KELLER.lon),
    getGbpUsdRate(),
    getNextFlight(session.family),
  ]);

  // Load London forecasts for itinerary days (max 16 days supported by free tier;
  // beyond that the forecast simply won't populate and we render nothing)
  let londonForecasts: Awaited<ReturnType<typeof getForecast>> = [];
  if (days.length > 0) {
    const start = days[0].date;
    const end = days[days.length - 1].date;
    // only call if the start is within 16 days from today
    const startDate = parseLocalDate(start);
    const daysOut = Math.floor((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysOut < 16 && daysOut > -30) {
      londonForecasts = await getForecast(LONDON.lat, LONDON.lon, start, end);
    }
  }

  // IDs per person — always the logged-in couple, regardless of active tab
  const personIds = await getPersonIds(ownPeople.map((p) => p.id));
  const idsByPerson = new Map<number, typeof personIds>();
  for (const p of ownPeople) idsByPerson.set(p.id, []);
  for (const i of personIds) {
    const list = idsByPerson.get(i.person_id);
    if (list) list.push(i);
  }

  // Items grouped by day
  const itemsByDay = new Map<number, typeof items>();
  for (const d of days) itemsByDay.set(d.id, []);
  for (const it of items) {
    const list = itemsByDay.get(it.day_id);
    if (list) list.push(it);
  }

  // Weather by date
  const wxByDate = new Map<string, typeof londonForecasts[number]>();
  for (const f of londonForecasts) wxByDate.set(f.date, f);

  // Countdown target
  const target = nextFlight?.depart_at ?? null;
  const route = nextFlight ? `${nextFlight.origin} → ${nextFlight.destination}` : '';
  const flightLabel = nextFlight
    ? `${nextFlight.airline ?? ''} ${nextFlight.flight_number ?? ''} · ${fmtTime(nextFlight.depart_at)} · ${fmtDate(nextFlight.depart_at)}`.trim()
    : '';

  // Initials for the avatar
  const initial = activeTab === 'campbell' ? 'C' : 'N';

  // Today header — Keller weather
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase().replace(',', ' ·');
  const todayWx = todayKeller ? ` · ${todayKeller.low}°–${todayKeller.high}°` : '';

  // SOS groupings
  const emergency = emergencyContacts.filter((c) => c.category === 'EMERGENCY');
  const hotelsForSOS = hotels;

  return (
    <div className="shell">
      <div className="topbar">
        <div className="topbar-row">
          <div className="topbar-meta">{todayLabel}{todayWx}</div>
          <Link href="/logout" className="avatar" aria-label="Log out">{initial}</Link>
        </div>
        <div className="title-block">
          <div className="title-main">WILDE</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="title-main">ENGLAND</div>
            <div className="title-sub">CAMPBELL<br/>× NEWBY</div>
          </div>
        </div>
      </div>

      <Countdown
        target={target}
        flightLabel={flightLabel}
        route={route}
      />

      <nav className="nav">
        <Link href="?tab=campbell" className={activeTab === 'campbell' ? 'active' : ''}>CAMPBELL</Link>
        <Link href="?tab=newby" className={activeTab === 'newby' ? 'active' : ''}>NEWBY</Link>
      </nav>

      <NowStrip days={days} items={items} forecasts={londonForecasts} />

      <main className="main">
        {/* --- ITINERARY --- */}
        <div className="section-head">
          <h3>ITINERARY</h3>
          <div className="actions">
            <Link href="/itinerary" className="btn-line">EDIT</Link>
          </div>
        </div>

        {days.length === 0 ? (
          <div className="fine-print" style={{ padding: '8px 0 16px' }}>
            No days added yet. Tap EDIT to build your itinerary.
          </div>
        ) : (
          <div style={{ marginBottom: 8 }}>
            {days.map((d, idx) => {
              const p = fmtDateParts(d.date);
              const wx = wxByDate.get(d.date);
              const dayItems = itemsByDay.get(d.id) || [];
              return (
                <Link href={`/itinerary/${d.id}`} className="itin-row" key={d.id}>
                  <div className="itin-date">
                    <div className="dow">{p.dow}</div>
                    <div className="num">{p.day}</div>
                    <div className="mon">{p.mon}</div>
                  </div>
                  <div className="itin-body">
                    <div className="itin-body-head">
                      <div className="itin-daynum">DAY {(idx + 1).toString().padStart(2, '0')}</div>
                      <div className="itin-weather">{wx ? `${wx.low}°–${wx.high}° · ${wx.condition}` : ''}</div>
                    </div>
                    <div className="itin-desc">
                      {d.title || dayItems.map((i) => i.name).slice(0, 3).join(' · ') || 'Tap to add items'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* --- FLY --- */}
        <div className="section-head">
          <h3>FLY</h3>
          <div className="actions"><Link href="/fly" className="btn-line">EDIT</Link></div>
        </div>
        {flights.length === 0 ? (
          <div className="fine-print" style={{ padding: '4px 0 8px' }}>No flights yet.</div>
        ) : flights.map((f) => (
          <div className="card" key={f.id}>
            <div className="card-row">
              <div className="card-title">{f.origin} → {f.destination}</div>
              {f.status ? <div className="status-pill">{f.status}</div> : null}
            </div>
            <div className="card-meta">
              {f.airline} {f.flight_number} · {fmtDate(f.depart_at)} · {fmtTime(f.depart_at)} → {fmtTime(f.arrive_at, 'Europe/London')}
            </div>
            {f.confirmation ? (
              <div className="card-divider">
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{f.confirmation}</span>
                <CopyButton value={f.confirmation} label="flight confirmation" />
              </div>
            ) : null}
          </div>
        ))}

        {/* --- STAY --- */}
        <div className="section-head">
          <h3>STAY</h3>
          <div className="actions"><Link href="/stay" className="btn-line">EDIT</Link></div>
        </div>
        {hotels.length === 0 ? (
          <div className="fine-print" style={{ padding: '4px 0 8px' }}>No hotel added yet.</div>
        ) : hotels.map((h) => (
          <div className="card" key={h.id}>
            <div className="card-title" style={{ marginBottom: 6 }}>{h.name.toUpperCase()}</div>
            {h.address ? (
              <a href={mapsLink(h.address)} target="_blank" rel="noopener noreferrer" className="maplink">
                {h.address} ↗
              </a>
            ) : null}
            {h.confirmation ? (
              <div className="card-divider">
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{h.confirmation}</span>
                <CopyButton value={h.confirmation} label="hotel confirmation" />
              </div>
            ) : null}
          </div>
        ))}

        {/* --- DRIVE (rental cars) --- */}
        <div className="section-head">
          <h3>DRIVE</h3>
          <div className="actions"><Link href="/drive" className="btn-line">EDIT</Link></div>
        </div>
        {cars.length === 0 ? (
          <div className="fine-print" style={{ padding: '4px 0 8px' }}>No rental car added yet.</div>
        ) : cars.map((c) => (
          <div className="card" key={c.id}>
            <div className="card-title" style={{ marginBottom: 6 }}>{c.company.toUpperCase()}</div>
            {c.pickup_at ? (
              <div className="card-meta">
                Pickup {fmtDate(c.pickup_at)} · {fmtTime(c.pickup_at)}
                {c.return_at ? ` → ${fmtDate(c.return_at)} · ${fmtTime(c.return_at)}` : ''}
              </div>
            ) : null}
            {c.pickup_address ? (
              <a href={mapsLink(c.pickup_address)} target="_blank" rel="noopener noreferrer" className="maplink">
                {c.pickup_location ? `${c.pickup_location} · ` : ''}{c.pickup_address} ↗
              </a>
            ) : null}
            {c.confirmation ? (
              <div className="card-divider">
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{c.confirmation}</span>
                <CopyButton value={c.confirmation} label="car confirmation" />
              </div>
            ) : null}
          </div>
        ))}

        {/* --- EAT --- */}
        <div className="section-head">
          <h3>EAT</h3>
          <div className="actions"><Link href="/eat" className="btn-line">EDIT</Link></div>
        </div>
        {dinners.length === 0 ? (
          <div className="fine-print" style={{ padding: '4px 0 8px' }}>No reservations yet.</div>
        ) : dinners.map((d) => (
          <div className="card" key={d.id}>
            <div className="card-title" style={{ marginBottom: 4 }}>{d.name.toUpperCase()}</div>
            <div className="card-meta" style={{ marginBottom: 6 }}>
              {fmtDate(d.reservation_at)} · {fmtTime(d.reservation_at, 'Europe/London')}
              {d.party_size ? ` · party of ${d.party_size}` : ''}
            </div>
            {d.address ? (
              <a href={mapsLink(d.address)} target="_blank" rel="noopener noreferrer" className="maplink">
                {d.address} ↗
              </a>
            ) : null}
            {d.confirmation ? (
              <div className="card-divider">
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{d.confirmation}</span>
                <CopyButton value={d.confirmation} label="dinner confirmation" />
              </div>
            ) : null}
          </div>
        ))}

        {/* --- RIDE --- */}
        <div className="section-head">
          <h3>RIDE</h3>
          <div className="actions"><Link href="/ride" className="btn-line">EDIT</Link></div>
        </div>
        {trains.length === 0 ? (
          <div className="fine-print" style={{ padding: '4px 0 8px' }}>No trains scheduled yet.</div>
        ) : trains.map((t) => (
          <div className="card" key={t.id}>
            <div className="card-title" style={{ marginBottom: 6 }}>{t.origin.toUpperCase()} → {t.destination.toUpperCase()}</div>
            <div className="card-meta">
              {t.operator} · {fmtDate(t.depart_at)} · {fmtTime(t.depart_at, 'Europe/London')} → {fmtTime(t.arrive_at, 'Europe/London')}
            </div>
            {t.confirmation ? (
              <div className="card-divider">
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{t.confirmation}</span>
                <CopyButton value={t.confirmation} label="train confirmation" />
              </div>
            ) : null}
          </div>
        ))}

        <div style={{ height: 20 }} />
      </main>

      {/* --- IDs & DOCS drawer --- */}
      <Drawer label="IDs & DOCS">
        {ownPeople.length === 0 ? (
          <div className="fine-print">No people added yet.</div>
        ) : ownPeople.map((p) => (
          <PersonCard key={p.id} name={p.name} ids={(idsByPerson.get(p.id) || []).map((i) => ({ id: i.id, label: i.label, value: i.value }))} />
        ))}
        <div style={{ marginTop: 10 }}>
          <Link href="/ids" className="btn-line" style={{ display: 'block', textAlign: 'center' }}>MANAGE IDs</Link>
        </div>
      </Drawer>

      {/* --- SOS drawer --- */}
      <Drawer label="SOS">
        <div className="sos-section-label">EMERGENCY</div>
        <div className="sos-group">
          {emergency.map((c) => (
            <a href={telLink(c.value)} className="sos-row" key={c.id}>
              <span className="sos-row-label">{c.label.toUpperCase()}</span>
              <span className="sos-row-value">{c.value}</span>
            </a>
          ))}
        </div>

        {hotelsForSOS.length > 0 ? (
          <>
            <div className="sos-section-label">HOTEL</div>
            <div className="sos-group">
              {hotelsForSOS.map((h) => (
                h.phone ? (
                  <a href={telLink(h.phone)} className="sos-row" key={h.id}>
                    <span className="sos-row-label">{h.name.toUpperCase()}</span>
                    <span className="sos-row-value">{h.phone}</span>
                  </a>
                ) : null
              ))}
            </div>
          </>
        ) : null}

        <AllPeoplePhones activeTab={activeTab} />
      </Drawer>

      {/* --- CONVERT drawer --- */}
      <Drawer label="CONVERT">
        <Converter usdPerGbp={rate.usdPerGbp} updatedAt={rate.at} />
      </Drawer>
    </div>
  );
}

// Shows ALL four phone numbers regardless of which tab is active, since SOS is universal
async function AllPeoplePhones({ activeTab }: { activeTab: 'campbell' | 'newby' }) {
  const [camp, newb] = await Promise.all([getPeople('campbell'), getPeople('newby')]);
  const all = [...camp, ...newb].filter((p) => p.phone);
  if (all.length === 0) return null;
  return (
    <>
      <div className="sos-section-label">THE FOUR OF US</div>
      <div className="sos-group">
        {all.map((p) => (
          <a href={telLink(p.phone!)} className="sos-row" key={p.id}>
            <span className="sos-row-label">{p.name.toUpperCase()}</span>
            <span className="sos-row-value">{p.phone}</span>
          </a>
        ))}
      </div>
    </>
  );
}
