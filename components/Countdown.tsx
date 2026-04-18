'use client';

import { useEffect, useState } from 'react';
import { countdownTo, pad2, fmtTime, fmtDate } from '@/lib/utils';

type Props = {
  target: string | null; // ISO timestamp
  flightLabel: string;   // e.g. "AA 6014 · 6:15 PM · sun may 31"
  route: string;         // e.g. "DFW → LHR"
};

export default function Countdown({ target, flightLabel, route }: Props) {
  const [tick, setTick] = useState(0);
  const [times, setTimes] = useState({ cdt: '--:--', bst: '--:--' });

  useEffect(() => {
    const update = () => {
      setTick((t) => t + 1);
      const now = new Date().toISOString();
      setTimes({
        cdt: fmtTime(now, 'America/Chicago'),
        bst: fmtTime(now, 'Europe/London'),
      });
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  if (!target) {
    return (
      <div className="countdown">
        <div className="countdown-row">
          <div className="countdown-label">NO UPCOMING FLIGHT</div>
        </div>
        <div className="countdown-times">
          <div><span className="label">CDT</span>{times.cdt}</div>
          <div><span className="label">BST</span>{times.bst}</div>
        </div>
      </div>
    );
  }

  const cd = countdownTo(target);

  return (
    <div className="countdown">
      <div className="countdown-row">
        <div className="countdown-label">{cd.past ? 'LAST FLIGHT' : 'NEXT FLIGHT'}</div>
        <div className="countdown-dest">{route}</div>
      </div>
      <div className="countdown-digits">
        <div>
          <span className="countdown-num">{pad2(cd.days)}</span>
          <span className="countdown-unit">D</span>
        </div>
        <div>
          <span className="countdown-num">{pad2(cd.hours)}</span>
          <span className="countdown-unit">H</span>
        </div>
        <div>
          <span className="countdown-num">{pad2(cd.minutes)}</span>
          <span className="countdown-unit">M</span>
        </div>
      </div>
      <div className="countdown-sub">{flightLabel}</div>
      <div className="countdown-times">
        <div><span className="label">CDT</span>{times.cdt}</div>
        <div><span className="label">BST</span>{times.bst}</div>
      </div>
    </div>
  );
}
