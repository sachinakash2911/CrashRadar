import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskGauge({ score = 0, isDanger = false }) {
  const s = Math.max(0, Math.min(100, score));

  let status, color, bgColor, textColor, borderColor, Icon;
  if (s >= 70 || isDanger) {
    status = 'DANGER'; color = '#e11d48'; bgColor = '#fff1f2'; textColor = '#be123c'; borderColor = '#fecdd3'; Icon = AlertOctagon;
  } else if (s >= 40) {
    status = 'CAUTION'; color = '#d97706'; bgColor = '#fffbeb'; textColor = '#b45309'; borderColor = '#fde68a'; Icon = AlertTriangle;
  } else {
    status = 'SAFE'; color = '#16a34a'; bgColor = '#f0fdf4'; textColor = '#15803d'; borderColor = '#bbf7d0'; Icon = ShieldCheck;
  }

  // SVG arc math for semi-circle gauge
  const R = 80;
  const sw = 14;
  const r = R - sw / 2;
  const arc = Math.PI * r;
  const offset = arc - (s / 100) * arc;

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 20, padding: '2rem 1.5rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Semi-circle gauge */}
      <div style={{ position: 'relative', width: 200, height: 110, overflow: 'hidden' }}>
        <svg viewBox="0 0 180 100" style={{ width: '100%', height: 'auto', transform: 'scaleY(1)' }}>
          {/* Track */}
          <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#f1f5f9" strokeWidth={sw} strokeLinecap="round" />
          {/* Fill */}
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={arc} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1), stroke 0.4s ease' }}
          />
          {/* Zone markers */}
          <text x="8"  y="102" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="Inter">0</text>
          <text x="90" y="15"  fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="Inter">50</text>
          <text x="172" y="102" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="Inter">100</text>
        </svg>

        {/* Score number overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{
            fontSize: '2.75rem', fontWeight: 900, color: color,
            fontFamily: 'var(--font-mono)', lineHeight: 1, letterSpacing: '-0.04em',
          }}>
            {s}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.1rem' }}>
            Risk Score
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: bgColor, color: textColor, border: `1.5px solid ${borderColor}`,
        borderRadius: 999, padding: '0.45rem 1.1rem',
        fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.06em',
      }}>
        <Icon size={15} strokeWidth={2.5} />
        {status}
      </div>

      {/* Risk level indicator bar */}
      <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 6, height: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 6, background: color,
          width: `${s}%`, transition: 'width 1s ease',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', width: '100%', textAlign: 'center', gap: '0.5rem' }}>
        {[
          { label: 'Safe', range: '0–39', color: '#16a34a', active: s < 40 },
          { label: 'Caution', range: '40–69', color: '#d97706', active: s >= 40 && s < 70 },
          { label: 'Danger', range: '70–100', color: '#e11d48', active: s >= 70 },
        ].map(z => (
          <div key={z.label} style={{
            padding: '0.4rem', borderRadius: 8,
            background: z.active ? `${z.color}12` : 'transparent',
            border: `1px solid ${z.active ? z.color + '30' : 'transparent'}`,
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: z.active ? z.color : '#94a3b8' }}>{z.label}</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{z.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
