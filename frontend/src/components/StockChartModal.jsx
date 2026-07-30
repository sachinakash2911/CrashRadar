import React, { useState, useEffect } from 'react';
import { X, TrendingDown, AlertTriangle, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts';
import { fetchPriceHistory } from '../services/api';

/* Custom dot: red pulsing circle on Crash_Signal days, tiny blue dot otherwise */
const CustomDot = ({ cx, cy, payload }) => {
  if (payload?.Crash_Signal) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={9} fill="#e11d48" fillOpacity={0.18} />
        <circle cx={cx} cy={cy} r={5} fill="#e11d48" stroke="white" strokeWidth={1.5} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={2.5} fill="#003087" stroke="white" strokeWidth={1} />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 10, padding: '0.75rem 1rem',
      boxShadow: 'var(--shadow-hover)', fontSize: '0.8rem',
    }}>
      <p style={{ fontWeight: 700, color: '#0a0f1e', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#003087', fontSize: '1rem' }}>
        ₹{d.price.toLocaleString('en-IN')}
      </p>
      <p style={{ color: d.change?.startsWith('-') ? '#e11d48' : '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>
        {d.change} · Vol {d.volume}
      </p>
      {d.Crash_Signal && (
        <div style={{
          marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fee2e2',
          color: '#be123c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <AlertTriangle size={12} /> Crash Alert Flagged
        </div>
      )}
    </div>
  );
};

export default function StockChartModal({ isOpen, onClose, symbol = 'RELIANCE' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchPriceHistory(symbol)
      .then(setData)
      .finally(() => setLoading(false));
  }, [isOpen, symbol]);

  if (!isOpen) return null;

  const last = data[data.length - 1];
  const first = data[0];
  const overallChange = last && first
    ? (((last.price - first.price) / first.price) * 100).toFixed(2)
    : '0.00';
  const isUp = parseFloat(overallChange) >= 0;
  const signals = data.filter(d => d.Crash_Signal).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#e8f0fc', border: '1px solid #c0d5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart2 size={22} color="#003087" strokeWidth={2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.5rem', color: '#0a0f1e', letterSpacing: '-0.03em' }}>
                  {symbol}
                </span>
                <span className="badge badge-blue">NSE · EQUITY</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6b7a99', marginTop: '0.15rem' }}>
                30-Day Price History with AI Crash Signal Markers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 8, background: '#f5f7fa',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#be123c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid var(--border)',
        }}>
          {[
            { label: 'Current Price', value: last ? `₹${last.price.toLocaleString('en-IN')}` : '—', mono: true },
            { label: '30-Day Change', value: `${isUp ? '+' : ''}${overallChange}%`, color: isUp ? '#16a34a' : '#e11d48' },
            { label: 'Crash Signals', value: `${signals} Days`, color: signals > 0 ? '#e11d48' : '#16a34a' },
            { label: 'Min / Max', value: data.length ? `₹${Math.min(...data.map(d => d.price))} / ₹${Math.max(...data.map(d => d.price))}` : '—', mono: true, small: true },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '1.1rem 1.25rem',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                {item.label}
              </p>
              <p style={{
                fontFamily: (item.mono) ? 'var(--font-mono)' : 'var(--font)',
                fontWeight: 800, fontSize: item.small ? '0.85rem' : '1.1rem',
                color: item.color || '#0a0f1e', letterSpacing: '-0.01em',
              }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#6b7a99', fontWeight: 600 }}>Closing Price (₹) — NSE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.72rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#003087' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#003087', display: 'inline-block' }} />
                Price
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#e11d48' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e11d48', display: 'inline-block' }} />
                Crash Alert
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
              Loading telemetry data…
            </div>
          ) : (
            <div style={{ height: 260, background: '#fafbfd', borderRadius: 12, border: '1px solid var(--border)', padding: '1rem 0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#003087" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#003087" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="price"
                    stroke="#003087" strokeWidth={2.5}
                    fill="url(#grad)"
                    dot={<CustomDot />}
                    activeDot={{ r: 5, fill: '#003087', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <p style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={12} color="#e11d48" />
            Red markers indicate historical anomaly days matching CrashRadar AI crash alerts. Swap <code style={{ background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>fetchPriceHistory()</code> in api.js for live data.
          </p>
        </div>
      </div>
    </div>
  );
}
