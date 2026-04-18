'use client';

import { useState } from 'react';

type Props = {
  usdPerGbp: number;
  updatedAt: number;
};

function fmt(n: number) {
  if (!isFinite(n) || isNaN(n)) return '';
  return (Math.round(n * 100) / 100).toFixed(2);
}

function minutesAgo(ts: number) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return 'JUST NOW';
  if (m === 1) return '1 MIN AGO';
  if (m < 60) return `${m} MIN AGO`;
  const h = Math.round(m / 60);
  if (h === 1) return '1 HR AGO';
  return `${h} HR AGO`;
}

export default function Converter({ usdPerGbp, updatedAt }: Props) {
  const [gbp, setGbp] = useState('100.00');
  const [usd, setUsd] = useState(fmt(100 * usdPerGbp));

  function onGbp(v: string) {
    setGbp(v);
    const n = parseFloat(v);
    if (isNaN(n)) { setUsd(''); return; }
    setUsd(fmt(n * usdPerGbp));
  }

  function onUsd(v: string) {
    setUsd(v);
    const n = parseFloat(v);
    if (isNaN(n)) { setGbp(''); return; }
    setGbp(fmt(n / usdPerGbp));
  }

  return (
    <>
      <div className="conv-rate-row">
        <span className="conv-rate-label">LIVE RATE</span>
        <span className="conv-rate-value">£1 = ${fmt(usdPerGbp)}</span>
      </div>

      <div className="conv-field primary">
        <div className="prefix">£</div>
        <input
          inputMode="decimal"
          value={gbp}
          onChange={(e) => onGbp(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </div>

      <div className="conv-swap">↓</div>

      <div className="conv-field secondary">
        <div className="prefix">$</div>
        <input
          inputMode="decimal"
          value={usd}
          onChange={(e) => onUsd(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </div>

      <div className="conv-updated">UPDATED {minutesAgo(updatedAt)}</div>
    </>
  );
}
