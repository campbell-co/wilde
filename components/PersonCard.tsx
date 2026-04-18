'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';

type Id = { id: number; label: string; value: string };

export default function PersonCard({ name, ids }: { name: string; ids: Id[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="id-box">
      <button className={`id-head ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{name.toUpperCase()}</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="id-body">
          {ids.length === 0 ? (
            <div className="fine-print">No IDs saved yet.</div>
          ) : (
            ids.map((i) => (
              <div className="id-row" key={i.id}>
                <span className="label">{i.label}</span>
                <span className="value">{i.value}</span>
                <CopyButton value={i.value} label={i.label} />
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
