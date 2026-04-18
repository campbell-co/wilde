'use client';

import { useState } from 'react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

export default function DriveForm({ action }: { action: (fd: FormData) => void }) {
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');

  return (
    <form action={action} className="card" style={{ marginBottom: 20 }}>
      <div className="form-group">
        <label className="form-label">COMPANY</label>
        <input name="company" required className="form-input" placeholder="Hertz / Avis / Enterprise" />
      </div>
      <div className="form-group">
        <label className="form-label">PICKUP LOCATION NAME</label>
        <input name="pickup_location" value={location} onChange={(e) => setLocation(e.target.value)} className="form-input" placeholder="LHR T5" />
      </div>
      <div className="form-group">
        <label className="form-label">PICKUP ADDRESS <span style={{ color: '#000', marginLeft: 4 }}>· GOOGLE</span></label>
        <PlacesAutocomplete
          name="pickup_address"
          value={address}
          onChange={setAddress}
          onPick={(p) => {
            setAddress(p.address);
            if (!location.trim()) setLocation(p.name);
          }}
          placeholder="start typing..."
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">PICKUP</label>
          <input name="pickup_at" type="datetime-local" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">RETURN</label>
          <input name="return_at" type="datetime-local" className="form-input" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">CONFIRMATION</label>
        <input name="confirmation" className="form-input mono" placeholder="HTZ-ABCD1234" />
      </div>
      <button type="submit" className="btn-solid">+ ADD CAR</button>
    </form>
  );
}
