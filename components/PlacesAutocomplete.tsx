'use client';

import { useEffect, useRef, useState } from 'react';

type Suggestion = {
  placeId: string;
  main: string;
  secondary: string;
};

export default function PlacesAutocomplete({
  name,
  value,
  defaultValue,
  placeholder,
  onChange,
  onPick,
}: {
  name: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  onPick?: (v: { name: string; address: string }) => void;
}) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? '');
  const query = controlled ? (value as string) : internal;

  function setQuery(v: string) {
    if (controlled) onChange?.(v);
    else { setInternal(v); onChange?.(v); }
  }

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [sessionToken] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!focused) return;
    if (!query || query.trim().length < 2) { setSuggestions([]); return; }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const r = await fetch('/api/places/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, sessionToken }),
          signal: ac.signal,
        });
        if (!r.ok) return;
        const json = await r.json();
        setSuggestions(json.suggestions || []);
      } catch {}
    }, 220);

    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, focused]);

  async function pick(s: Suggestion) {
    try {
      const r = await fetch('/api/places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: s.placeId, sessionToken }),
      });
      const json = await r.json();
      const addr = json.address || `${s.main}, ${s.secondary}`;
      setQuery(addr);
      setSuggestions([]);
      onPick?.({ name: s.main, address: addr });
    } catch {
      const addr = `${s.main}, ${s.secondary}`;
      setQuery(addr);
      setSuggestions([]);
      onPick?.({ name: s.main, address: addr });
    }
  }

  return (
    <div className="ac-wrap">
      <input
        type="text"
        name={name}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 180)}
        onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
          else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); pick(suggestions[activeIdx]); }
          else if (e.key === 'Escape') { setSuggestions([]); setActiveIdx(-1); }
        }}
        className="form-input"
        style={{ borderBottom: focused && suggestions.length ? 'none' : undefined }}
      />

      {focused && suggestions.length > 0 ? (
        <div className="ac-list">
          {suggestions.map((s, i) => (
            <div
              key={s.placeId}
              className={`ac-item ${i === activeIdx ? 'active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
            >
              <div className="name">{s.main}</div>
              <div className="addr">{s.secondary}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
