import React from 'react';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';

export default function ReasonCards({ reasons = [] }) {
  if (!reasons || reasons.length === 0) {
    return (
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: 14, padding: '2rem', textAlign: 'center',
      }}>
        <CheckCircle size={28} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
        <p style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>No Active Risk Factors Detected</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
          Quantitative metrics and market microstructure are within normal parameters.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} color="#003087" />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0a0f1e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Risk Drivers
          </span>
          <span style={{
            background: '#e8f0fc', color: '#003087', border: '1px solid #c0d5f5',
            borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
            padding: '0.1rem 0.55rem',
          }}>
            {reasons.length}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
          Explainable AI Attribution
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {reasons.map((reason, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 12, padding: '0.9rem 1rem',
            boxShadow: 'var(--shadow-card)',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#b8c4d8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: '#fff7ed', border: '1px solid #fed7aa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: '0.05rem',
            }}>
              <AlertCircle size={14} color="#d97706" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '0.3rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Factor #{i + 1}
                </span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '0.12rem 0.5rem',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 4, color: '#64748b',
                }}>
                  AI INSIGHT
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#3d4966', fontWeight: 500, lineHeight: 1.6 }}>
                {reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
