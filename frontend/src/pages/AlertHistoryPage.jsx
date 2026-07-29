import React, { useState, useEffect } from 'react';
import { Clock, Filter, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchAlertHistory } from '../services/alertHistoryService';
import { WATCHLIST_STOCKS } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function AlertHistoryPage({ setPage }) {
  const { t } = useTranslation();
  const [filterSymbol, setFilterSymbol] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [data, setData] = useState({ total: 0, alerts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAlertHistory(filterSymbol, filterStatus)
      .then(setData)
      .finally(() => setLoading(false));
  }, [filterSymbol, filterStatus]);

  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="wrap">

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="section-label">{t('navAlerts')}</span>
              <span className="badge-simulated">
                {t('sampleTag')}
              </span>
            </div>
            <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
              {t('alertHistoryTitle')}
            </h1>
            <p className="section-sub">
              {t('alertHistorySub')}
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7a99', fontWeight: 600, fontSize: '0.85rem' }}>
            <Filter size={16} /> Filter Log:
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Symbol Filter */}
            <select
              value={filterSymbol}
              onChange={e => setFilterSymbol(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem', borderRadius: 8, border: '1px solid var(--border)',
                fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: '#003087', background: '#fafbfd', cursor: 'pointer',
              }}
            >
              <option value="ALL">{t('filterAll')}</option>
              {WATCHLIST_STOCKS.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem', borderRadius: 8, border: '1px solid var(--border)',
                fontSize: '0.8rem', fontWeight: 700,
                color: '#003087', background: '#fafbfd', cursor: 'pointer',
              }}
            >
              <option value="ALL">{t('filterStatus')}</option>
              <option value="elevated">Still Elevated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Alert Log Table */}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-card)',
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Loading historical alerts…
            </div>
          ) : data.alerts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No historical alerts matching selected filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#fafbfd', borderBottom: '1px solid var(--border)', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Timestamp</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Stock</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Risk Score</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Primary AI Factor</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.alerts.map((item) => {
                  const isElevated = item.status === 'Still elevated';
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafbfd'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.25rem', color: '#6b7a99', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} color="#94a3b8" />
                          {item.timestamp}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0a0f1e' }}>
                        {item.symbol}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                        <span style={{
                          color: item.risk_score >= 70 ? '#e11d48' : item.risk_score >= 40 ? '#d97706' : '#16a34a',
                        }}>
                          {item.risk_score}/100
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: '#3d4966', fontWeight: 500, maxWidth: 360 }}>
                        {item.primaryReason}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          background: isElevated ? '#fff1f2' : '#f0fdf4',
                          color: isElevated ? '#be123c' : '#15803d',
                          border: `1px solid ${isElevated ? '#fecdd3' : '#bbf7d0'}`,
                          borderRadius: 999, padding: '0.2rem 0.65rem',
                          fontSize: '0.72rem', fontWeight: 800,
                        }}>
                          {isElevated ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                          {item.status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setPage && setPage('stock-' + item.symbol)}
                          className="btn btn-ghost btn-sm"
                          style={{ gap: '0.3rem', fontSize: '0.75rem' }}
                        >
                          View <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
