'use client';

import { useState } from 'react';

export default function Drawer({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="drawer">
      <button className="drawer-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{label}</span>
        <span className="caret">{open ? '▾' : '▸'}</span>
      </button>
      {open ? <div className="drawer-body">{children}</div> : null}
    </section>
  );
}
