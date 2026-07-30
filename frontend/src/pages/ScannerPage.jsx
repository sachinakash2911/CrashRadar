import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle, RefreshCw, BarChart2, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { predictStockCrash, WATCHLIST_STOCKS } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import ReasonCards from '../components/ReasonCards';
import StockChartModal from '../components/StockChartModal';
import AgentAnalysisPanel from '../components/AgentAnalysisPanel';
import WhatIfSimulator from '../components/WhatIfSimulator';
import WhatsAppPreview from '../components/WhatsAppPreview';
import { useTranslation } from '../i18n/LanguageContext';

export default function ScannerPage({ setPage }) {
  const [input, setInput] = useState('');
  const [activeSymbol, setActiveSymbol] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartOpen, setChartOpen] = useState(false);

  const scan = async (sym) => {
    const s = (sym || input).trim().toUpperCase();
    if (!s) return;
    setActiveSymbol(s);
    setInput(s);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await predictStockCrash(s);
      setResult(data);
    } catch (err) {
      setError({ msg: err.message || 'Could not reach CrashRadar API server.', sym: s });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="wrap">

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-label" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
            AI Risk Intelligence
          </span>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
            Stock Crash Risk Scanner
          </h1>
          <p className="section-sub">
            Enter any NSE-listed stock symbol to receive an AI-generated risk score with transparent explanations.
          </p>
        </div>

        {/* Search Panel */}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-card)', marginBottom: '2rem',
        }}>
          <form
            onSubmit={e => { e.preventDefault(); scan(input); }}
            style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="input"
                style={{ paddingLeft: '2.75rem' }}
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g. RELIANCE, TCS, INFY…)"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: 140, gap: '0.5rem' }}
            >
              {loading
                ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
                : <><Sparkles size={16} /> Run Scan</>
              }
            </button>
          </form>

          {/* Watchlist chips */}
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>
              Quick Watchlist — NSE F&O Stocks
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {WATCHLIST_STOCKS.map(s => (
                <button
                  key={s.symbol}
                  onClick={() => scan(s.symbol)}
                  className={`chip ${activeSymbol === s.symbol ? 'active' : ''}`}
                >
                  {s.symbol}
                  <span style={{ opacity: 0.65, fontSize: '0.7rem' }}>· {s.sector}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{
            background: 'white', border: '1px solid var(--border)', borderRadius: 20,
            padding: '4rem', textAlign: 'center', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#e8f0fc', margin: '0 auto 1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'spin 1s linear infinite',
            }}>
              <RefreshCw size={26} color="#003087" />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0a0f1e', marginBottom: '0.4rem' }}>
              Evaluating Risk Telemetry for {activeSymbol}…
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              GET /predict/{activeSymbol}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{
            background: '#fff1f2', border: '1px solid #fecdd3',
            borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: '#ffe4e6', border: '1px solid #fecdd3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={22} color="#be123c" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 800, color: '#be123c', marginBottom: '0.4rem' }}>
                  Backend Unavailable — {error.sym}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
                  CrashRadar expects FastAPI server at{' '}
                  <code style={{ background: '#ffe4e6', padding: '0.1rem 0.4rem', borderRadius: 4, fontFamily: 'var(--font-mono)', color: '#be123c' }}>
                    http://localhost:8000/predict/{error.sym}
                  </code>
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem' }}>{error.msg}</p>
              </div>
              <button
                onClick={() => scan(error.sym)}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="anim-fade-in" style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-card)',
          }}>
            {/* Result header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)',
              flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '2rem',
                    color: '#0a0f1e', letterSpacing: '-0.04em',
                  }}>
                    {result.symbol}
                  </span>
                  <span className="badge badge-blue">NSE EQUITY</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                  <Clock size={13} />
                  <span>Scanned at {result.scannedAt}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setChartOpen(true)}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e8f0fc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <BarChart2 size={15} /> Price Chart
                </button>
                {setPage && (
                  <button
                    onClick={() => setPage('stock-' + result.symbol)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1652c9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#003087'}
                  >
                    <ExternalLink size={15} /> View Stock Details
                  </button>
                )}
              </div>
            </div>

            {/* Gauge + Reasons */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
              <div>
                <RiskGauge score={result.final_risk_score} isDanger={result.is_danger} />
                <div style={{
                  marginTop: '1rem', padding: '1rem', background: '#f8fafc',
                  border: '1px solid var(--border)', borderRadius: 12,
                  fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6, textAlign: 'center',
                }}>
                  {result.is_danger
                    ? '⚡ High crash risk detected. Order flow indicates elevated lower circuit risk. Review your positions.'
                    : '✅ Market structure is within normal parameters. Monitor for changes.'}
                </div>
              </div>
              <ReasonCards reasons={result.agent1?.shap_reasons ?? result.reasons ?? []} />
            </div>

            {/* 3 AI Agents Telemetry Panel */}
            <AgentAnalysisPanel
              symbol={result.symbol}
              predictData={result}
              riskScore={result.final_risk_score}
              isDanger={result.is_danger}
              reasons={result.agent1?.shap_reasons ?? []}
            />

            {/* WhatsApp Voice Alert Preview */}
            <WhatsAppPreview
              symbol={result.symbol}
              riskScore={result.final_risk_score}
              reasons={result.agent1?.shap_reasons ?? []}
              isDanger={result.is_danger}
            />

            {/* What-If Simulator Panel */}
            <WhatIfSimulator
              symbol={result.symbol}
              baseScore={result.final_risk_score}
              isDanger={result.is_danger}
            />
          </div>
        )}

      </div>

      <StockChartModal isOpen={chartOpen} onClose={() => setChartOpen(false)} symbol={result?.symbol} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .scanner-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
