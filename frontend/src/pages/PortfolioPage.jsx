import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldCheck, AlertTriangle, AlertOctagon, ArrowRight, PieChart } from 'lucide-react';
import { fetchPortfolioAnalysis } from '../services/portfolioService';
import { WATCHLIST_STOCKS } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import { useTranslation } from '../i18n/LanguageContext';

export default function PortfolioPage({ setPage }) {
  const { t } = useTranslation();
  const [selectedSymbols, setSelectedSymbols] = useState(['RELIANCE', 'ADANIENT', 'TCS']);
  const [analysis, setAnalysis] = useState(null);
  const [newSymbol, setNewSymbol] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchPortfolioAnalysis(selectedSymbols).then(setAnalysis);
  }, [selectedSymbols]);

  const handleAdd = (sym) => {
    const s = (sym || newSymbol).toUpperCase().trim();
    if (!s || selectedSymbols.includes(s)) return;
    setSelectedSymbols([...selectedSymbols, s]);
    setNewSymbol('');
    setShowDropdown(false);
  };

  // All NSE symbols to search from (watchlist + common NSE stocks)
  const ALL_SYMBOLS = [
    ...WATCHLIST_STOCKS,
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'NBFC' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobile' },
    { symbol: 'WIPRO',      name: 'Wipro Ltd.',         sector: 'IT' },
    { symbol: 'ICICIBANK',  name: 'ICICI Bank Ltd.',    sector: 'Banking' },
    { symbol: 'AXISBANK',   name: 'Axis Bank Ltd.',     sector: 'Banking' },
    { symbol: 'MARUTI',     name: 'Maruti Suzuki Ltd.', sector: 'Automobile' },
    { symbol: 'LT',         name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure' },
    { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical', sector: 'Pharma' },
    { symbol: 'ONGC',       name: 'Oil & Natural Gas Corp.', sector: 'Energy' },
    { symbol: 'NTPC',       name: 'NTPC Ltd.',           sector: 'Power' },
  ];

  const filteredSuggestions = newSymbol.trim().length > 0
    ? ALL_SYMBOLS.filter(s =>
        !selectedSymbols.includes(s.symbol) &&
        (s.symbol.startsWith(newSymbol.toUpperCase()) ||
         s.name.toLowerCase().includes(newSymbol.toLowerCase()))
      ).slice(0, 7)
    : [];

  const handleRemove = (sym) => {
    setSelectedSymbols(selectedSymbols.filter(s => s !== sym));
  };

  const availableToAdd = WATCHLIST_STOCKS.filter(w => !selectedSymbols.includes(w.symbol));

  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="wrap">

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="section-label">{t('navPortfolio')}</span>
              <span className="badge-simulated">
                {t('simulatedTag')}
              </span>
            </div>
            <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
              {t('portfolioTitle')}
            </h1>
            <p className="section-sub">
              {t('portfolioSub')}
            </p>
          </div>
        </div>

        {/* ── Summary Banner ───────────────────────────────── */}
        {analysis && (
          <div style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 20, padding: '1.75rem 2rem', marginBottom: '2rem',
            boxShadow: 'var(--shadow-card)',
            display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'center',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <PieChart size={20} color="#003087" />
                <h3 style={{ fontWeight: 800, color: '#0a0f1e', fontSize: '1.2rem' }}>
                  {t('holdingsSummary')}
                </h3>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#3d4966', fontWeight: 600 }}>
                {analysis.summary.elevatedCount > 0
                  ? `⚠️ ${analysis.summary.elevatedCount} of your ${analysis.totalHoldings} holdings are at elevated risk`
                  : `✅ All ${analysis.totalHoldings} holdings are operating within safe parameters`}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Overall Portfolio Risk Index: <strong style={{ color: '#003087' }}>{analysis.overallRiskScore}/100</strong>
              </p>
            </div>

            {/* Safe / Caution / Danger Pill Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '0.75rem' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d' }}>{analysis.summary.safeCount}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a' }}>{t('safeHoldings')}</div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '0.75rem' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#b45309' }}>{analysis.summary.cautionCount}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d97706' }}>{t('cautionHoldings')}</div>
              </div>
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '0.75rem' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#be123c' }}>{analysis.summary.dangerCount}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e11d48' }}>{t('dangerHoldings')}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Stock Controls ────────────────────────────── */}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0a0f1e' }}>{t('addStock')}:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {availableToAdd.map(stock => (
                <button
                  key={stock.symbol}
                  onClick={() => handleAdd(stock.symbol)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.35rem', fontSize: '0.75rem', transition: 'all 0.15s' }}
                >
                  <Plus size={13} /> {stock.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Search input with dropdown */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Search symbol or name…"
                value={newSymbol}
                onChange={e => {
                  setNewSymbol(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd(newSymbol);
                  if (e.key === 'Escape') setShowDropdown(false);
                }}
                style={{
                  padding: '0.45rem 0.85rem', borderRadius: 8,
                  border: '1.5px solid var(--border)',
                  fontSize: '0.82rem', width: 220,
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#003087'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={() => handleAdd(newSymbol)}
                className="btn btn-primary btn-sm"
                disabled={!newSymbol.trim()}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && filteredSuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                background: 'white', border: '1.5px solid var(--border)',
                borderRadius: 12, boxShadow: '0 8px 30px rgba(10,15,30,0.12)',
                zIndex: 200, minWidth: 280, overflow: 'hidden',
              }}>
                {filteredSuggestions.map((stock, i) => (
                  <button
                    key={stock.symbol}
                    onMouseDown={() => handleAdd(stock.symbol)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%', padding: '0.65rem 1rem',
                      background: 'none', border: 'none',
                      borderBottom: i < filteredSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 800,
                        fontSize: '0.82rem', color: '#003087',
                      }}>
                        {stock.symbol}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>
                        {stock.name}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8',
                      background: '#f5f7fa', borderRadius: 4,
                      padding: '0.1rem 0.4rem',
                    }}>
                      {stock.sector}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Holdings Grid ─────────────────────────────────── */}
        {analysis?.holdings.length === 0 ? (
          <div style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 20, padding: '3rem', textAlign: 'center', color: '#64748b',
          }}>
            {t('emptyPortfolio')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {analysis?.holdings.map((stock) => (
              <div
                key={stock.symbol}
                style={{
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '1.5rem', boxShadow: 'var(--shadow-card)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Card Top */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.3rem', color: '#0a0f1e' }}>
                          {stock.symbol}
                        </span>
                        <span className="badge badge-blue">{stock.sector}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#6b7a99' }}>{stock.name}</p>
                    </div>

                    <button
                      onClick={() => handleRemove(stock.symbol)}
                      style={{
                        padding: '0.35rem', borderRadius: 8, background: '#fff1f2',
                        color: '#be123c', border: '1px solid #fecdd3', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      title={t('removeStock')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Compact Risk Gauge */}
                  <RiskGauge score={stock.risk_score} isDanger={stock.is_danger} />
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setPage && setPage('stock-' + stock.symbol)}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center', gap: '0.4rem' }}
                >
                  {t('viewDetails')} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
