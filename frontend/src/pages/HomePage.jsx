import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle, Clock, Users, BarChart2, AlertOctagon, ChevronRight, RefreshCw } from 'lucide-react';
import { WATCHLIST_STOCKS, predictStockCrash } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

const STATUS_COLORS = {
  safe:    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'SAFE',    bar: '#16a34a' },
  caution: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'CAUTION', bar: '#d97706' },
  danger:  { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', label: 'DANGER',  bar: '#e11d48' },
};

/* ── Compact 15-Min Countdown Pill ───────────────────── */
function DangerPill({ stock, onClick }) {
  const TOTAL = 15 * 60;
  const [secs, setSecs] = useState(TOTAL - Math.floor(Math.random() * 480));

  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(secs / 60);
  const seconds = secs % 60;
  const urgent = secs < 180;

  return (
    <button
      onClick={() => onClick(stock.symbol)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        background: urgent ? '#e11d48' : '#be123c',
        border: 'none', borderRadius: 999,
        padding: '0.28rem 0.85rem 0.28rem 0.6rem',
        cursor: 'pointer', transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#9f1239'; e.currentTarget.style.transform = 'scale(1.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = urgent ? '#e11d48' : '#be123c'; e.currentTarget.style.transform = 'scale(1)'; }}
      title={`${stock.symbol} — High crash risk. Click to view details.`}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'rgba(255,255,255,0.8)',
        display: 'inline-block',
        animation: 'pulse 1.4s infinite ease-in-out',
      }} />

      <span style={{
        fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.72rem',
        color: 'white', letterSpacing: '0.02em',
      }}>
        {stock.symbol}
      </span>

      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>·</span>

      <span style={{
        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.92)', letterSpacing: '0.04em',
      }}>
        {String(mins).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </button>
  );
}

/* ── Main HomePage ───────────────────────────────────────────── */
export default function HomePage({ setPage }) {
  const { t } = useTranslation();

  // Hero stocks: RELIANCE, TCS, INFY, HDFCBANK — fetch live risk on mount
  const HERO_SYMBOLS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'];
  const [heroData, setHeroData] = useState({});
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchHero = async () => {
      const results = await Promise.allSettled(
        HERO_SYMBOLS.map(sym => predictStockCrash(sym))
      );
      if (!mounted) return;
      const map = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[HERO_SYMBOLS[i]] = r.value;
      });
      setHeroData(map);
      setHeroLoading(false);
    };
    fetchHero();
    return () => { mounted = false; };
  }, []);

  // Derive danger stocks from live fetched data
  const dangerStocks = HERO_SYMBOLS
    .filter(sym => heroData[sym]?.is_danger)
    .map(sym => ({ symbol: sym, ...heroData[sym] }));

  const handleStockClick = (symbol) => setPage('stock-' + symbol);

  const STATS = [
    { label: t('statStocksWatch'),     value: '487',    icon: BarChart2,     color: '#003087' },
    { label: t('statAlertsToday'),     value: '12',     icon: AlertTriangle, color: '#be123c' },
    { label: t('statProtected'),        value: '2,300+', icon: Users,         color: '#15803d' },
    { label: t('statLeadTime'),         value: '15 Min', icon: Clock,         color: '#b45309' },
  ];

  return (
    <div>

      {/* ── COMPACT DANGER ALERT STRIP ───────────────────── */}
      {dangerStocks.length > 0 && (
        <div style={{
          background: '#1a0608',
          borderBottom: '1px solid #3f0d12',
          padding: '0.4rem 0',
        }}>
          <div className="wrap">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
              }}>
                <AlertOctagon size={13} color="#f87171" strokeWidth={2.5} />
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, color: '#f87171',
                  textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                }}>
                  15-Min Alert
                </span>
                <span style={{ color: '#3f0d12', fontSize: '0.65rem' }}>|</span>
              </div>

              {dangerStocks.map(s => (
                <DangerPill key={s.symbol} stock={s} onClick={handleStockClick} />
              ))}

              <span style={{
                fontSize: '0.62rem', color: '#6b2e35', marginLeft: 'auto',
                fontWeight: 500, whiteSpace: 'nowrap',
              }}>
                Click to view details
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #001b6e 60%, #003087 100%)',
        color: 'white', padding: '5rem 0 4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.5) 40px),
                            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.5) 40px)`,
        }} />
        <div style={{ position: 'absolute', top: '-120px', right: '-100px', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,82,201,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
            {/* Left */}
            <div className="anim-slide-up">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 999, padding: '0.3rem 0.9rem', marginBottom: '1.5rem',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', color: '#bfdbfe',
              }}>
                <span className="status-dot pulse-dot" />
                {t('heroBadge')}
              </div>

              <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900,
                letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '1.25rem',
              }}>
                {t('heroTitle')}
              </h1>

              <p style={{ fontSize: '1.15rem', color: '#93c5fd', lineHeight: 1.6, marginBottom: '2rem', maxWidth: 460, fontWeight: 600, fontStyle: 'italic' }}>
                {t('heroSub')}
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-lg"
                  onClick={() => setPage('scanner')}
                  style={{ background: 'white', color: '#003087', fontWeight: 800, boxShadow: '0 4px 20px rgba(255,255,255,0.15)', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                >
                  {t('scanRiskBtn')} <ArrowRight size={18} />
                </button>
                <button
                  className="btn btn-lg"
                  onClick={() => setPage('contagion')}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                >
                  {t('viewContagionBtn')}
                </button>
              </div>
            </div>

            {/* Right: Stock cards — live backend data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {HERO_SYMBOLS.map((sym, i) => {
                const live = heroData[sym];
                const meta = WATCHLIST_STOCKS.find(s => s.symbol === sym) || { symbol: sym, sector: 'Equity' };
                const level = live?.risk_level?.toUpperCase() ?? 'UNKNOWN';
                const status =
                  level === 'HIGH' || level === 'ELEVATED' ? 'danger' :
                  level === 'MODERATE' ? 'caution' : 'safe';
                const c = STATUS_COLORS[status] || STATUS_COLORS.safe;
                const score = live?.final_risk_score ?? null;

                return (
                  <div
                    key={sym}
                    onClick={() => handleStockClick(sym)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 14, padding: '1rem',
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {sym}
                      </span>
                      {heroLoading ? (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.13rem 0.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>…</span>
                      ) : (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '0.13rem 0.45rem', borderRadius: 4, background: c.bg, color: c.text }}>
                          {c.label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.4rem' }}>{meta.sector}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>
                        {heroLoading ? '—' : (score !== null ? `Risk: ${score}` : '—')}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.55rem', background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${heroLoading ? 0 : (score ?? 0)}%`, height: '100%', background: c.bar, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap" style={{ padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }} className="stats-grid">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{
                  padding: '1.75rem 1.5rem',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: `${s.color}12`, border: `1px solid ${s.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} color={s.color} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7a99', fontWeight: 500, marginTop: '0.2rem' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 15-MIN WINDOW EXPLAINER ──────────────────────── */}
      <section style={{ padding: '5rem 0', background: '#f5f7fa' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span className="section-label" style={{ marginBottom: '1rem', display: 'inline-flex' }}>{t('coreInnovation')}</span>
                <h2 className="section-title" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
                  {t('survivalTitle')}
                </h2>
                <p className="section-sub">
                  {t('survivalSub')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  t('feature1'),
                  t('feature2'),
                  t('feature3'),
                  t('feature4'),
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={18} color="#16a34a" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.92rem', color: '#3d4966', fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>

              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => setPage('scanner')}
                  style={{ transition: 'all 0.18s' }}
                >
                  {t('scanRiskBtn')} <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* SVG Timeline */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7a99', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.5rem' }}>
                Crash Lifecycle — Retail vs CrashRadar
              </p>
              <svg viewBox="0 0 420 200" style={{ width: '100%', height: 'auto' }}>
                <line x1="30" y1="160" x2="400" y2="160" stroke="#e2e8f0" strokeWidth="2" />
                {[{ x: 30, l: 'T-30m' }, { x: 120, l: 'T-15m' }, { x: 210, l: 'T-0' }, { x: 300, l: 'T+15m' }, { x: 390, l: 'T+30m' }].map(({ x, l }) => (
                  <g key={l}>
                    <line x1={x} y1="155" x2={x} y2="165" stroke="#cbd5e1" strokeWidth="1.5" />
                    <text x={x} y="178" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter">{l}</text>
                  </g>
                ))}
                <polyline points="30,30 100,28 140,26 180,60 210,120 240,155 300,155 390,155" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="110" y="10" width="110" height="145" fill="rgba(0,48,135,0.05)" rx="4" />
                <line x1="120" y1="10" x2="120" y2="155" stroke="#003087" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x="125" y="24" fontSize="9" fill="#003087" fontFamily="Inter" fontWeight="700">⚡ CrashRadar</text>
                <text x="125" y="36" fontSize="9" fill="#003087" fontFamily="Inter" fontWeight="700">Alert at T-15m</text>
                <line x1="30" y1="140" x2="400" y2="140" stroke="#fca5a5" strokeWidth="1" strokeDasharray="5,3" />
                <text x="300" y="135" fontSize="9" fill="#e11d48" fontFamily="Inter" fontWeight="600">Lower Circuit</text>
                <line x1="260" y1="10" x2="260" y2="155" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4,3" />
                <text x="265" y="24" fontSize="9" fill="#b45309" fontFamily="Inter" fontWeight="700">Retail Discovers</text>
                <text x="265" y="36" fontSize="9" fill="#b45309" fontFamily="Inter">at T+30m</text>
                <text x="30" y="24" fontSize="10" fill="#0f172a" fontFamily="Inter" fontWeight="700">Stock Price</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{ background: '#003087', color: 'white', padding: '4rem 0' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            {t('ctaTitle')}
          </h2>
          <p style={{ color: '#93c5fd', fontSize: '1rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            {t('ctaSub')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-lg"
              onClick={() => setPage('scanner')}
              style={{ background: 'white', color: '#003087', fontWeight: 800, transition: 'all 0.18s' }}
            >
              {t('startScanBtn')} <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-lg"
              onClick={() => setPage('contagion')}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', transition: 'all 0.18s' }}
            >
              {t('viewContagionBtn')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
