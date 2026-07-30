import React from 'react';

/*
  SVG Corporate Contagion Network Graph
  Nodes represent companies; edges show ownership/pledge linkages.
  Color-coded by risk level. Hoverable for company name display.
*/

const NODES = [
  { id: 'parent', x: 215, y: 100, r: 34, label: 'Adani Group', color: '#e11d48', risk: 84, sector: 'Conglomerate' },
  { id: 'ent',    x: 100, y: 200, r: 26, label: 'ADANIENT',    color: '#e11d48', risk: 84, sector: 'Infrastructure' },
  { id: 'ports',  x: 330, y: 200, r: 22, label: 'ADANIPORTS',  color: '#d97706', risk: 62, sector: 'Ports & SEZ' },
  { id: 'green',  x: 60,  y: 310, r: 20, label: 'ADANIGREEN',  color: '#d97706', risk: 57, sector: 'Renewables' },
  { id: 'power',  x: 170, y: 320, r: 20, label: 'ADANIPOWER',  color: '#e11d48', risk: 76, sector: 'Power' },
  { id: 'total',  x: 340, y: 320, r: 20, label: 'ADANITOTAL',  color: '#16a34a', risk: 31, sector: 'Gas & Energy' },
  { id: 'trans',  x: 250, y: 310, r: 18, label: 'ATGL',        color: '#d97706', risk: 53, sector: 'Gas Trans.' },
  { id: 'ndtv',   x: 80,  y: 410, r: 16, label: 'NDTV',        color: '#d97706', risk: 48, sector: 'Media' },
];

const EDGES = [
  { from: 'parent', to: 'ent',    label: 'Promoter 72%',   type: 'control' },
  { from: 'parent', to: 'ports',  label: 'Promoter 65%',   type: 'control' },
  { from: 'parent', to: 'green',  label: 'Promoter 60%',   type: 'control' },
  { from: 'ent',    to: 'power',  label: 'Cross-holding',  type: 'pledge' },
  { from: 'ent',    to: 'ndtv',   label: 'Acquisition',    type: 'pledge' },
  { from: 'ports',  to: 'total',  label: 'Subsidiary',     type: 'subsidiary' },
  { from: 'ports',  to: 'trans',  label: 'JV Stake',       type: 'subsidiary' },
  { from: 'power',  to: 'green',  label: 'Shared Credit',  type: 'pledge' },
];

const EDGE_STYLES = {
  control:    { stroke: '#e11d48', dash: '', width: 2.5, opacity: 0.7 },
  pledge:     { stroke: '#d97706', dash: '6,4', width: 2, opacity: 0.6 },
  subsidiary: { stroke: '#003087', dash: '3,3', width: 1.5, opacity: 0.5 },
};

function nodeById(id) { return NODES.find(n => n.id === id); }

export default function ContagionGraph() {
  const [hovered, setHovered] = React.useState(null);
  const node = hovered ? NODES.find(n => n.id === hovered) : null;

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-card)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0a0f1e' }}>
            Corporate Shadow Network — Contagion Map
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7a99', marginTop: '0.15rem' }}>
            Hover nodes to explore ownership & pledge linkages
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { color: '#e11d48', label: 'Danger', dash: '' },
            { color: '#d97706', label: 'Caution', dash: '' },
            { color: '#16a34a', label: 'Safe', dash: '' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative' }}>
        <svg viewBox="0 0 430 460" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
            {NODES.map(n => (
              <radialGradient key={`g-${n.id}`} id={`g-${n.id}`} cx="40%" cy="40%">
                <stop offset="0%" stopColor={n.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={n.color} stopOpacity="0.08" />
              </radialGradient>
            ))}
          </defs>
          <rect width="430" height="460" fill="url(#grid)" />

          {/* Edges */}
          {EDGES.map((e, i) => {
            const a = nodeById(e.from);
            const b = nodeById(e.to);
            const style = EDGE_STYLES[e.type];
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const isActive = hovered === e.from || hovered === e.to;
            return (
              <g key={i}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={style.stroke} strokeWidth={isActive ? style.width + 1 : style.width}
                  strokeDasharray={style.dash} opacity={isActive ? 1 : style.opacity}
                  strokeLinecap="round"
                />
                {isActive && (
                  <>
                    <rect x={mx - 36} y={my - 10} width={72} height={18} rx="4" fill="white" stroke={style.stroke} strokeWidth="1" opacity="0.95" />
                    <text x={mx} y={my + 4} textAnchor="middle" fontSize="9" fill={style.stroke} fontFamily="Inter" fontWeight="700">
                      {e.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map(n => (
            <g
              key={n.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Glow ring */}
              <circle cx={n.x} cy={n.y} r={n.r + 8} fill={`url(#g-${n.id})`} />
              {/* Border ring */}
              <circle
                cx={n.x} cy={n.y} r={n.r}
                fill="white" stroke={n.color} strokeWidth={hovered === n.id ? 3 : 2}
              />
              {/* Risk fill */}
              <circle cx={n.x} cy={n.y} r={n.r - 4} fill={n.color} opacity={hovered === n.id ? 0.25 : 0.12} />
              {/* Risk score */}
              <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={n.r > 28 ? 13 : 11} fontWeight="800" fill={n.color} fontFamily="Inter, monospace">
                {n.risk}
              </text>
              {/* Label */}
              <text x={n.x} y={n.y + n.r + 12} textAnchor="middle"
                fontSize="9.5" fontWeight="700" fill="#3d4966" fontFamily="Inter">
                {n.label}
              </text>
            </g>
          ))}

          {/* Legend note */}
          <text x="215" y="445" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter">
            Node number = AI Risk Score (0–100) · Edges show ownership, pledge &amp; credit links
          </text>
        </svg>

        {/* Hover info panel */}
        {node && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'white', border: `2px solid ${node.color}`,
            borderRadius: 12, padding: '0.75rem 1rem', minWidth: 160,
            boxShadow: 'var(--shadow-hover)', fontSize: '0.8rem',
          }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#0a0f1e', marginBottom: '0.2rem' }}>
              {node.label}
            </p>
            <p style={{ color: '#6b7a99', marginBottom: '0.5rem', fontSize: '0.72rem' }}>{node.sector}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>Risk Score</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.15rem',
                color: node.color,
              }}>{node.risk}</span>
            </div>
            <div style={{ marginTop: '0.35rem', background: '#f1f5f9', borderRadius: 4, height: 5, overflow: 'hidden' }}>
              <div style={{ width: `${node.risk}%`, height: '100%', background: node.color, borderRadius: 4 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
