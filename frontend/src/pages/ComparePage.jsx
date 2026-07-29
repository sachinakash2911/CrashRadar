import React, { useState, useEffect } from 'react';
import { Columns, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { compareStocks } from '../services/compareService';
import { WATCHLIST_STOCKS } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import ReasonCards from '../components/ReasonCards';
import { useTranslation } from '../i18n/LanguageContext';

export default function ComparePage({ setPage }) {
  const { t } = useTranslation();
  const [stock1, setStock1] = useState('RELIANCE');
  const [stock2, setStock2] = useState('TCS');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    compareStocks(stock1, stock2)
      .then(setComparisonData)
      .finally(() => setLoading(false));
  }, [stock1, stock2]);

  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="wrap">

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="section-label">{t('navCompare')}</span>
            <span className="badge-simulated">
              {t('simulatedTag')}
            </span>
          </div>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
            {t('compareTitle')}
          </h1>
          <p className="section-sub">
            {t('compareSub')}
          </p>
        </div>

        {/* Stock Selectors Bar */}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 20, padding: '1.5rem 2rem', marginBottom: '2rem',
          boxShadow: 'var(--shadow-card)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem',
        }}>
          {/* Selector 1 */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d4966', display: 'block', marginBottom: '0.5rem' }}>
              {t('selectStock1')}
            </label>
            <select
              value={stock1}
              onChange={e => setStock1(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
                border: '1.5px solid var(--border)', fontSize: '0.95rem',
                fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#003087',
                background: '#fafbfd', cursor: 'pointer',
              }}
            >
              {WATCHLIST_STOCKS.map(s => (
                <option key={s.symbol} value={s.symbol} disabled={s.symbol === stock2}>
                  {s.symbol} — {s.name} ({s.sector})
                </option>
              ))}
            </select>
          </div>

          {/* Selector 2 */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d4966', display: 'block', marginBottom: '0.5rem' }}>
              {t('selectStock2')}
            </label>
            <select
              value={stock2}
              onChange={e => setStock2(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
                border: '1.5px solid var(--border)', fontSize: '0.95rem',
                fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#003087',
                background: '#fafbfd', cursor: 'pointer',
              }}
            >
              {WATCHLIST_STOCKS.map(s => (
                <option key={s.symbol} value={s.symbol} disabled={s.symbol === stock1}>
                  {s.symbol} — {s.name} ({s.sector})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Textual Delta Line */}
        {comparisonData && !loading && (
          <div style={{
            background: 'linear-gradient(135deg, #003087 0%, #001b6e 100%)',
            color: 'white', borderRadius: 16, padding: '1.25rem 2rem', marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0,48,135,0.15)', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <Sparkles size={20} color="#93c5fd" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              {t('compareDelta')}: {comparisonData.comparison.summaryText}
            </span>
          </div>
        )}

        {/* Side by side columns */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            Comparing risk profiles…
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Column 1 */}
            <div style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 20, padding: '1.75rem', boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.5rem', color: '#0a0f1e' }}>
                    {comparisonData.stock1.symbol}
                  </h3>
                  <span className="badge badge-blue">NSE EQUITY</span>
                </div>
                <button
                  onClick={() => setPage && setPage('stock-' + comparisonData.stock1.symbol)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.3rem' }}
                >
                  View Details <ArrowRight size={13} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <RiskGauge score={comparisonData.stock1.risk_score} isDanger={comparisonData.stock1.is_danger} />
              </div>

              <ReasonCards reasons={comparisonData.stock1.reasons} />
            </div>

            {/* Column 2 */}
            <div style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 20, padding: '1.75rem', boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.5rem', color: '#0a0f1e' }}>
                    {comparisonData.stock2.symbol}
                  </h3>
                  <span className="badge badge-blue">NSE EQUITY</span>
                </div>
                <button
                  onClick={() => setPage && setPage('stock-' + comparisonData.stock2.symbol)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.3rem' }}
                >
                  View Details <ArrowRight size={13} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <RiskGauge score={comparisonData.stock2.risk_score} isDanger={comparisonData.stock2.is_danger} />
              </div>

              <ReasonCards reasons={comparisonData.stock2.reasons} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
