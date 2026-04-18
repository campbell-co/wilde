'use client';

import { useState } from 'react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

export default function EatForm({ action }: { action: (fd: FormData) => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  return (
    <form action={action} className="card" style={{ marginBottom: 20 }}>
      <div className="form-group">
        <label className="form-label">NAME</label>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="Dishoom Covent Garden" />
      </div>
      <div className="form-group">
        <label className="form-label">ADDRESS <span style={{ color: '#000', marginLeft: 4 }}>· GOOGLE</span></label>
        <PlacesAutocomplete
          name="address"
          value={address}
          onChange={setAddress}
          onPick={(p) => {
            setAddress(p.address);
            if (!name.trim()) setName(p.name);
          }}
          placeholder="start typing..."
        />
      </div>
      <div className="form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">RESERVATION (local)</label>
          <input name="reservation_at" type="datetime-local" required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">PARTY</label>
          <input name="party_size" type="number" min={1} max={20} defaultValue={4} className="form-input mono" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">CONFIRMATION</label>
        <input name="confirmation" className="form-input mono" placeholder="RES-A1B2" />
      </div>
      <div className="form-group">
        <label className="form-label">NOTES</label>
        <textarea name="notes" className="form-textarea" rows={2} placeholder="window seat · no shellfish" />
      </div>
      <button type="submit" className="btn-solid">+ ADD RESERVATION</button>
    </form>
  );
}
