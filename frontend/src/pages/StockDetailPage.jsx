import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { fetchPriceHistory, predictStockCrash, WATCHLIST_STOCKS } from '../services/api';
import { ArrowLeft, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp, BarChart2, AlertOctagon } from 'lucide-react';
import AgentAnalysisPanel from '../components/AgentAnalysisPanel';
import { useTranslation } from '../i18n/LanguageContext';

/* ── Custom Tooltip for chart ─────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'white', border: '1px solid #dce3ef',
      borderRadius: 10, padding: '0.65rem 0.9rem',
      boxShadow: '0 4px 20px rgba(10,15,30,0.1)',
      fontSize: '0.78rem', pointerEvents: 'none',
    }}>
      <p style={{ fontWeight: 700, color: '#0a0f1e', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#003087', fontSize: '1rem' }}>
        ₹{d.price?.toLocaleString('en-IN')}
      </p>
      {d.Crash_Signal && (
        <p style={{
          marginTop: '0.3rem', color: '#be123c', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.7rem',
        }}>
          <AlertTriangle size={11} /> AI Crash Signal
        </p>
      )}
    </div>
  );
};

/* ── Custom dot: red circle on signal days ────────────── */
const CustomDot = ({ cx, cy, payload }) => {
  if (payload?.Crash_Signal) {
    return (
      <g key={`dot-${cx}`}>
        <circle cx={cx} cy={cy} r={8} fill="#e11d48" fillOpacity={0.15} />
        <circle cx={cx} cy={cy} r={4.5} fill="#e11d48" stroke="white" strokeWidth={1.5} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={2.5} fill="#003087" stroke="white" strokeWidth={1} />;
};

/* ── Risk level helpers ───────────────────────────────── */
const RISK_CONFIG = {
  safe:    { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'SAFE',    Icon: ShieldCheck },
  caution: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'CAUTION', Icon: AlertTriangle },
  danger:  { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', label: 'DANGER',  Icon: AlertOctagon },
};

export default function StockDetailPage({ symbol, onBack }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingPred, setLoadingPred] = useState(true);

  const meta = WATCHLIST_STOCKS.find(s => s.symbol === symbol) || {
    symbol, name: symbol, sector: 'Equity', price: '—', change: '—',
    risk: 0, status: 'safe', marketCap: '—', pe: '—', volume: '—',
    high52: '—', low52: '—',
  };

  const rc = RISK_CONFIG[meta.status] || RISK_CONFIG.safe;

  useEffect(() => {
    setLoadingChart(true);
    setLoadingPred(true);

    fetchPriceHistory(symbol)
      .then(setHistory)
      .finally(() => setLoadingChart(false));

    predictStockCrash(symbol)
      .then(setPrediction)
      .catch(() => setPrediction(null))
      .finally(() => setLoadingPred(false));
  }, [symbol]);

  const last = history[history.length - 1];
  const first = history[0];
  const monthChange = last && first
    ? (((last.price - first.price) / first.price) * 100).toFixed(2)
    : '0.00';
  const monthUp = parseFloat(monthChange) >= 0;

  return (
    <div style={{ padding: '2rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="wrap">

        {/* ── Back Button ─────────────────────────────────── */}
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7a99', fontWeight: 600, fontSize: '0.85rem',
            marginBottom: '1.5rem', padding: '0.4rem 0',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#003087'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7a99'}
        >
          <ArrowLeft size={16} />
          {t('backOverview')}
        </button>

        {/* ── Stock Header ─────────────────────────────────── */}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 20, padding: '2rem', marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '2rem',
                color: '#0a0f1e', letterSpacing: '-0.04em',
              }}>
                {meta.symbol}
              </h1>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: rc.bg, color: rc.color, border: `1.5px solid ${rc.border}`,
                borderRadius: 999, padding: '0.3rem 0.85rem',
                fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em',
              }}>
                <rc.Icon size={13} strokeWidth={2.5} />
                {rc.label}
              </div>
            </div>
            <p style={{ color: '#6b7a99', fontSize: '0.875rem', fontWeight: 500 }}>
              {meta.name} &nbsp;·&nbsp; {meta.sector} &nbsp;·&nbsp; NSE
            </p>
          </div>

          {/* Price + Change */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '2rem', color: '#0a0f1e', letterSpacing: '-0.04em' }}>
              {meta.price}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              fontWeight: 700, fontSize: '0.85rem',
              color: meta.change.startsWith('+') ? '#16a34a' : '#e11d48',
            }}>
              {meta.change.startsWith('+')
                ? <TrendingUp size={15} strokeWidth={2.5} />
                : <TrendingDown size={15} strokeWidth={2.5} />}
              {meta.change} {t('todayChange')}
            </div>
          </div>
        </div>

        {/* ── Main Grid: Chart + Details ─────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }} className="stock-detail-grid">

          {/* Left: Price Chart */}
          <div style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 20, padding: '1.75rem', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <p style={{ fontWeight: 800, color: '#0a0f1e', fontSize: '0.95rem' }}>{t('priceMovement30d')}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7a99', marginTop: '0.15rem' }}>
                  {t('hoverChartHint')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.72rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#003087' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#003087', display: 'inline-block' }} />
                  Price
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#e11d48' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e11d48', display: 'inline-block' }} />
                  AI Alert
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontWeight: 700,
                  color: monthUp ? '#16a34a' : '#e11d48',
                }}>
                  30D: {monthUp ? '+' : ''}{monthChange}%
                </span>
              </div>
            </div>

            {loadingChart ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Loading chart data…
              </div>
            ) : (
              <div style={{ height: 240, background: '#fafbfd', borderRadius: 12, border: '1px solid #f1f5f9', padding: '0.75rem 0.25rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sdGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#003087" stopOpacity={0.14} />
                        <stop offset="100%" stopColor="#003087" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 9.5 }} tickLine={false} axisLine={false} interval={5} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 9.5 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone" dataKey="price"
                      stroke="#003087" strokeWidth={2.5}
                      fill="url(#sdGrad)"
                      dot={<CustomDot />}
                      activeDot={{ r: 5, fill: '#003087', stroke: 'white', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Right: Key Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Key Stats Card */}
            <div style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 20, padding: '1.5rem', boxShadow: 'var(--shadow-card)',
            }}>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0a0f1e', marginBottom: '1rem' }}>
                {t('keyMetrics')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { label: t('marketCap'),  value: meta.marketCap },
                  { label: t('peRatio'),   value: meta.pe },
                  { label: t('volume'),      value: meta.volume },
                  { label: t('high52'),    value: meta.high52 },
                  { label: t('low52'),     value: meta.low52 },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '0.6rem', borderBottom: '1px solid #f5f7fa',
                  }}>
                    <span style={{ fontSize: '0.78rem', color: '#6b7a99', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#0a0f1e' }}>{value}</span>
                  </div>
                ))}

                {/* AI Risk Score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6b7a99', fontWeight: 500 }}>{t('aiRiskScore')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 900, color: rc.color }}>
                    {loadingPred ? '—' : prediction?.risk_score ?? meta.risk}/100
                  </span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{
                    width: `${loadingPred ? meta.risk : (prediction?.risk_score ?? meta.risk)}%`,
                    height: '100%', background: rc.color, borderRadius: 4,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* AI Risk Alert — info only for danger stocks */}
            {meta.status === 'danger' && (
              <div style={{
                background: '#fff1f2', border: '1px solid #fecdd3',
                borderRadius: 14, padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              }}>
                <AlertOctagon size={18} color="#e11d48" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 700, color: '#be123c', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                    {t('highCrashRiskTitle')}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.55 }}>
                    {t('highCrashRiskDesc')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 3-Agent Intelligence Outputs Panel ───────────────── */}
        <AgentAnalysisPanel
          symbol={symbol}
          riskScore={prediction?.risk_score ?? meta.risk}
          isDanger={prediction?.is_danger ?? (meta.status === 'danger')}
          reasons={prediction?.reasons ?? []}
        />

        {/* ── AI Reasons (if available) ─────────────────── */}
        {prediction?.reasons?.length > 0 && (
          <div style={{
            marginTop: '1.5rem', background: 'white', border: '1px solid var(--border)',
            borderRadius: 20, padding: '1.75rem', boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0a0f1e', marginBottom: '1rem' }}>
              {t('aiRiskFactors')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {prediction.reasons.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  background: '#fafbfd', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '0.75rem 1rem',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800,
                    color: '#94a3b8', minWidth: 24,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: '#3d4966', fontWeight: 500, lineHeight: 1.6 }}>
                    {r}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
