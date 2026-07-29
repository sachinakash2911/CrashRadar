import React from 'react';

const SECTORS = [
  { name: 'Banking & Finance', stocks: ['HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 'SBIN', 'AXISBANK'], scores: [58, 44, 37, 61, 49] },
  { name: 'Information Tech',  stocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'LTIM'],             scores: [28, 33, 40, 25, 36] },
  { name: 'Energy & Oil',      stocks: ['RELIANCE', 'ONGC', 'BPCL', 'IOC', 'GAIL'],             scores: [72, 55, 48, 52, 43] },
  { name: 'Infrastructure',    stocks: ['ADANIENT', 'LT', 'NTPC', 'POWERGRID', 'BHEL'],          scores: [84, 38, 46, 42, 61] },
  { name: 'FMCG & Consumer',   stocks: ['HINDUNILVR', 'ITC', 'NESTLEIND', 'DABUR', 'MARICO'],    scores: [22, 30, 18, 27, 24] },
  { name: 'Pharma & Health',   stocks: ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'ALKEM'],   scores: [35, 41, 29, 44, 33] },
];

function getRiskColor(score) {
  if (score >= 70) return { bg: '#fee2e2', text: '#be123c', intensity: Math.min((score - 70) / 30, 1) };
  if (score >= 40) return { bg: '#fef3c7', text: '#92400e', intensity: Math.min((score - 40) / 30, 1) };
  return { bg: '#dcfce7', text: '#14532d', intensity: Math.min(score / 40, 1) };
}

function getBgStyle(score) {
  if (score >= 70) {
    const a = 0.12 + ((score - 70) / 30) * 0.45;
    return { background: `rgba(225, 29, 72, ${a})`, color: score > 80 ? 'white' : '#be123c' };
  }
  if (score >= 40) {
    const a = 0.10 + ((score - 40) / 30) * 0.35;
    return { background: `rgba(217, 119, 6, ${a})`, color: score > 60 ? '#7c2d12' : '#92400e' };
  }
  const a = 0.08 + (score / 40) * 0.25;
  return { background: `rgba(22, 163, 74, ${a})`, color: '#14532d' };
}

export default function SectorHeatmap() {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-card)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0a0f1e' }}>
            NSE Sector Crash Risk Heatmap
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7a99', marginTop: '0.15rem' }}>
            AI crash probability scores across 6 major sectors
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Color scale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 600 }}>
            <span style={{ color: '#14532d' }}>Safe</span>
            <div style={{ display: 'flex', height: 12, width: 80, borderRadius: 4, overflow: 'hidden' }}>
              {[0.12, 0.20, 0.30, 0.45, 0.60, 0.80].map((o, i) => (
                <div key={i} style={{ flex: 1, background: i < 2 ? `rgba(22,163,74,${o})` : i < 4 ? `rgba(217,119,6,${o})` : `rgba(225,29,72,${o})` }} />
              ))}
            </div>
            <span style={{ color: '#be123c' }}>Danger</span>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div style={{ padding: '1.5rem' }}>
        {SECTORS.map((sector, si) => (
          <div key={si} style={{ marginBottom: si < SECTORS.length - 1 ? '1rem' : 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, color: '#3d4966',
                minWidth: 150, flexShrink: 0,
              }}>
                {sector.name}
              </span>
              <div style={{
                flex: 1, height: 2, borderRadius: 2, background: '#f1f5f9',
              }} />
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8',
                fontFamily: 'var(--font-mono)',
              }}>
                avg: {Math.round(sector.scores.reduce((a, b) => a + b, 0) / sector.scores.length)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sector.stocks.map((sym, idx) => {
                const score = sector.scores[idx];
                const style = getBgStyle(score);
                const isH = hovered === `${si}-${idx}`;
                return (
                  <div
                    key={sym}
                    onMouseEnter={() => setHovered(`${si}-${idx}`)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      flex: 1, minWidth: 80, maxWidth: 120,
                      padding: '0.6rem 0.5rem', borderRadius: 10, textAlign: 'center',
                      cursor: 'default', transition: 'all 0.15s',
                      border: isH ? `2px solid ${score >= 70 ? '#e11d48' : score >= 40 ? '#d97706' : '#16a34a'}` : '2px solid transparent',
                      transform: isH ? 'scale(1.05)' : 'scale(1)',
                      ...style,
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800,
                      color: style.color, marginBottom: '0.2rem', letterSpacing: '-0.02em',
                    }}>
                      {sym}
                    </div>
                    <div style={{
                      fontSize: '1.1rem', fontWeight: 900,
                      color: style.color, fontFamily: 'var(--font-mono)', lineHeight: 1,
                    }}>
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border)',
        background: '#fafbfd', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500,
      }}>
        Numbers represent AI Crash Risk Score (0–100). Green = Safe · Amber = Caution · Red = Danger zone.
      </div>
    </div>
  );
}
