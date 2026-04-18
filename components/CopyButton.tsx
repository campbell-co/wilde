'use client';

import { useState } from 'react';

export default function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback: old-school
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
      document.body.removeChild(ta);
    }
  }

  return (
    <button
      type="button"
      className={`copybtn ${copied ? 'copied' : ''}`}
      onClick={onClick}
      aria-label={label ? `Copy ${label}` : 'Copy'}
    >
      {copied ? '✓' : '⧉'}
    </button>
  );
}
