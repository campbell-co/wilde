import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getPeople, getPersonIds } from '@/lib/db';
import { addId, removeIdAction, updatePhone } from './actions';
import CopyButton from '@/components/CopyButton';

export const dynamic = 'force-dynamic';

const COMMON_LABELS = ['PASSPORT', 'KTN', 'GLOBAL ENTRY', 'AADVANTAGE', 'CLEAR', 'DL NUMBER'];

export default async function IdsPage() {
  const session = await requireSession();
  const people = await getPeople(session.family);
  const ids = await getPersonIds(people.map((p) => p.id));
  const idsByPerson = new Map<number, typeof ids>();
  for (const p of people) idsByPerson.set(p.id, []);
  for (const i of ids) idsByPerson.get(i.person_id)?.push(i);

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/">← BACK</Link>
        <span>IDs · {session.family.toUpperCase()}</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        {people.map((p) => {
          const pIds = idsByPerson.get(p.id) || [];
          return (
            <div className="card" key={p.id} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #000', marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: 1 }}>{p.name.toUpperCase()}</div>
              </div>

              <form action={updatePhone.bind(null, p.id)} style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">PHONE</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input name="phone" defaultValue={p.phone || ''} className="form-input mono" placeholder="+1 817 555 0100" style={{ flex: 1 }} />
                    <button className="btn-line">SAVE</button>
                  </div>
                </div>
              </form>

              <div style={{ fontSize: 10, letterSpacing: 2, color: '#5F5E5A', marginBottom: 8 }}>IDs</div>
              {pIds.length === 0 ? (
                <div className="fine-print" style={{ marginBottom: 12 }}>None yet.</div>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  {pIds.map((i) => (
                    <div className="id-row" key={i.id} style={{ marginBottom: 6 }}>
                      <span className="label">{i.label}</span>
                      <span className="value">{i.value}</span>
                      <CopyButton value={i.value} label={i.label} />
                      <form action={removeIdAction.bind(null, i.id)} style={{ display: 'inline' }}>
                        <button type="submit" style={{ border: 'none', background: 'transparent', color: '#A32D2D', fontSize: 11, cursor: 'pointer', padding: '0 4px' }}>✕</button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              <form action={addId.bind(null, p.id)}>
                <div className="form-row" style={{ marginBottom: 8 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">LABEL</label>
                    <input name="label" list={`labels-${p.id}`} required className="form-input" placeholder="PASSPORT" />
                    <datalist id={`labels-${p.id}`}>
                      {COMMON_LABELS.map((l) => <option key={l} value={l} />)}
                    </datalist>
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">VALUE</label>
                    <input name="value" required className="form-input mono" placeholder="556291847" />
                  </div>
                </div>
                <button type="submit" className="btn-line" style={{ width: '100%' }}>+ ADD ID</button>
              </form>
            </div>
          );
        })}

        <div className="fine-print">
          Passphrase logged in: {session.family}. Only the {session.family} family's IDs are visible here.
        </div>
      </main>
    </div>
  );
}
