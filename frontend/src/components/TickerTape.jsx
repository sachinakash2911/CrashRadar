import React, { useState, useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

const INDICES = [
  { label: 'NIFTY 50',     value: '24,852.15', pct: '+0.45%', up: true  },
  { label: 'BANK NIFTY',   value: '52,140.80', pct: '-0.22%', up: false },
  { label: 'SENSEX',       value: '81,450.90', pct: '+0.38%', up: true  },
  { label: 'INDIA VIX',    value: '12.85',     pct: '-3.10%', up: false },
  { label: 'NIFTY IT',     value: '38,920.40', pct: '+0.64%', up: true  },
  { label: 'NIFTY BANK',   value: '52,215.60', pct: '-0.17%', up: false },
  { label: 'NIFTY ENERGY', value: '39,110.20', pct: '+0.20%', up: true  },
  { label: 'NIFTY AUTO',   value: '21,380.10', pct: '+0.57%', up: true  },
  { label: 'NIFTY FMCG',   value: '54,720.30', pct: '+0.11%', up: true  },
  { label: 'NIFTY PHARMA', value: '18,940.60', pct: '-0.08%', up: false },
];

export default function TickerTape({ setPage }) {
  const [paused, setPaused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Map index labels to stock symbols for navigation
  const indexToStock = {
    'NIFTY 50': null, 'BANK NIFTY': null, 'SENSEX': null, 'INDIA VIX': null,
    'NIFTY IT': 'INFY', 'NIFTY BANK': 'HDFCBANK', 'NIFTY ENERGY': 'RELIANCE',
    'NIFTY AUTO': null, 'NIFTY FMCG': null, 'NIFTY PHARMA': null,
  };

  return (
    <div style={{
      background: '#0a0f1e', color: '#e2e8f0',
      borderBottom: '1px solid #1e2a45',
      fontSize: '0.78rem', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>

        {/* Left Label */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem',
          background: '#003087', borderRight: '1px solid #1e3a8a',
          fontWeight: 800, letterSpacing: '0.06em', fontSize: '0.7rem',
          color: 'white', whiteSpace: 'nowrap', userSelect: 'none',
        }}>
          <span className="status-dot pulse-dot" />
          LIVE FEED
        </div>

        {/* Scrolling Ticker */}
        <div
          style={{ flex: 1, overflow: 'hidden', padding: '0.45rem 0', cursor: 'default' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); setHoveredIdx(null); }}
        >
          <div style={{
            display: 'flex', gap: '2.5rem',
            animationName: 'ticker',
            animationDuration: '45s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: paused ? 'paused' : 'running',
            width: 'max-content',
          }}>
            {[...INDICES, ...INDICES].map((idx, i) => {
              const localIdx = i % INDICES.length;
              const isHov = hoveredIdx === i;
              const stock = indexToStock[idx.label];
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => stock && setPage && setPage('stock-' + stock)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    whiteSpace: 'nowrap',
                    background: isHov ? 'rgba(255,255,255,0.07)' : 'transparent',
                    borderRadius: 6,
                    padding: isHov ? '0.15rem 0.5rem' : '0.15rem 0.1rem',
                    transition: 'background 0.15s, padding 0.15s',
                    cursor: stock ? 'pointer' : 'default',
                  }}
                >
                  <span style={{
                    color: isHov ? '#e2e8f0' : '#94a3b8',
                    fontWeight: 600, fontSize: '0.7rem',
                    transition: 'color 0.15s',
                  }}>
                    {idx.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: isHov ? '#ffffff' : '#f1f5f9',
                    transition: 'color 0.15s',
                  }}>
                    {idx.value}
                  </span>
                  <span style={{
                    fontWeight: 700, fontSize: '0.68rem', padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    background: idx.up ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: idx.up ? '#34d399' : '#f87171',
                    border: isHov ? `1px solid ${idx.up ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` : '1px solid transparent',
                    transition: 'border-color 0.15s',
                  }}>
                    {idx.up ? '▲' : '▼'} {idx.pct}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Clock */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderLeft: '1px solid #1e2a45', color: '#64748b',
          fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          <Activity size={12} color="#3b82f6" />
          {timeStr} IST
        </div>
      </div>
    </div>
  );
}
