'use client';

import { useState } from 'react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

type Item = {
  id?: number | '';
  time: string;
  type: string;
  name: string;
  address: string;
  notes: string;
};

const TYPES = ['EAT', 'STAY', 'ACTIVITY', 'FLY', 'RIDE'];

export default function DayEditor({
  date,
  title,
  notes,
  items,
  saveAction,
  deleteAction,
}: {
  date: string;
  title: string | null;
  notes: string | null;
  items: Array<{ id: number; time: string | null; type: string; name: string; address: string | null; notes: string | null }>;
  saveAction: (fd: FormData) => void;
  deleteAction: () => void;
}) {
  const [rows, setRows] = useState<Item[]>(
    items.map((i) => ({
      id: i.id,
      time: i.time || '',
      type: i.type || 'ACTIVITY',
      name: i.name || '',
      address: i.address || '',
      notes: i.notes || '',
    }))
  );

  function addRow() {
    setRows((r) => [...r, { id: '', time: '', type: 'EAT', name: '', address: '', notes: '' }]);
  }

  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, patch: Partial<Item>) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  return (
    <form action={saveAction}>
      <input type="hidden" name="date" value={date} />

      <div className="form-group">
        <label className="form-label">DAY TITLE</label>
        <input name="title" defaultValue={title || ''} className="form-input" placeholder="e.g. Arrival day" />
      </div>

      <div className="form-group">
        <label className="form-label">DAY NOTES</label>
        <textarea name="notes" defaultValue={notes || ''} className="form-textarea" rows={2} />
      </div>

      {rows.map((row, idx) => (
        <div className="item-block" key={idx}>
          <div className="item-head">
            <div>ITEM {(idx + 1).toString().padStart(2, '0')}</div>
            <button type="button" onClick={() => removeRow(idx)}>REMOVE ✕</button>
          </div>
          <div className="item-body">
            {/* Stable hidden id so server action can tell create vs update */}
            <input type="hidden" name="item_id" value={row.id} />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">TIME</label>
                <input
                  name="item_time"
                  value={row.time}
                  onChange={(e) => updateRow(idx, { time: e.target.value })}
                  className="form-input mono"
                  placeholder="8:00 PM"
                />
              </div>
              <div className="form-group">
                <label className="form-label">TYPE</label>
                <select
                  name="item_type"
                  value={row.type}
                  onChange={(e) => updateRow(idx, { type: e.target.value })}
                  className="form-select"
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">NAME</label>
              <input
                name="item_name"
                value={row.name}
                onChange={(e) => updateRow(idx, { name: e.target.value })}
                className="form-input"
                placeholder="Dishoom Covent Garden"
              />
            </div>

            <div className="form-group">
              <label className="form-label">WHERE <span style={{ color: '#000', marginLeft: 4 }}>· GOOGLE</span></label>
              <PlacesAutocomplete
                name="item_address"
                value={row.address}
                onChange={(v) => updateRow(idx, { address: v })}
                onPick={(p) => updateRow(idx, {
                  address: p.address,
                  name: row.name.trim() ? row.name : p.name,
                })}
                placeholder="start typing..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">NOTES</label>
              <textarea
                name="item_notes"
                value={row.notes}
                onChange={(e) => updateRow(idx, { notes: e.target.value })}
                className="form-textarea"
                rows={2}
                placeholder="party of 4 · ask for booth"
              />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="add-btn" onClick={addRow} style={{ marginTop: 16 }}>+ ADD ITEM</button>

      <div className="editor-footer">
        <button
          type="button"
          className="danger"
          onClick={() => {
            if (confirm('Delete this day? This will also delete all items on it.')) {
              deleteAction();
            }
          }}
        >
          DELETE DAY
        </button>
        <div className="actions">
          <a href="/itinerary" className="btn-line">CANCEL</a>
          <button type="submit" className="btn-solid" style={{ width: 'auto', padding: '8px 16px' }}>SAVE</button>
        </div>
      </div>
    </form>
  );
}
