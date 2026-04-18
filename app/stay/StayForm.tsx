'use client';

import { useState } from 'react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

export default function StayForm({ action }: { action: (fd: FormData) => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  return (
    <form action={action} className="card" style={{ marginBottom: 20 }}>
      <div className="form-group">
        <label className="form-label">NAME</label>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="The Ned" />
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
        <div className="form-group">
          <label className="form-label">CHECK IN</label>
          <input name="check_in" type="date" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">CHECK OUT</label>
          <input name="check_out" type="date" className="form-input" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">PHONE</label>
        <input name="phone" className="form-input mono" placeholder="+44 20 3828 2000" />
      </div>
      <div className="form-group">
        <label className="form-label">CONFIRMATION</label>
        <input name="confirmation" className="form-input mono" placeholder="NED-2591" />
      </div>
      <button type="submit" className="btn-solid">+ ADD HOTEL</button>
    </form>
  );
}
