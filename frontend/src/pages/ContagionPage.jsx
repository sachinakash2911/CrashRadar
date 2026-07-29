import React from 'react';
import ContagionGraph from '../components/ContagionGraph';
import SectorHeatmap from '../components/SectorHeatmap';
import { AlertTriangle, TrendingDown, Share2, ArrowRight } from 'lucide-react';

export default function ContagionPage({ setPage }) {
  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="wrap">

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-label" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
            Network Risk Intelligence
          </span>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
            Contagion Map & Sector Heatmap
          </h1>
          <p className="section-sub">
            Visualize how ownership structures, pledged shares, and credit linkages create cascading crash risk across related companies and sectors.
          </p>
        </div>

        {/* Alert Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: 14, padding: '1rem 1.5rem', marginBottom: '2rem',
        }}>
          <AlertTriangle size={20} color="#d97706" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 500 }}>
            <strong>Active Contagion Alert:</strong> ADANIENT and affiliated entities show elevated cross-holding risk.
            Promoter pledge levels in 4 group companies exceed 65%. Monitor ADANIPORTS, ADANIPOWER for downstream impact.
          </p>
          <button
            className="btn btn-sm"
            onClick={() => setPage('scanner')}
            style={{ flexShrink: 0, background: '#d97706', color: 'white', fontWeight: 700 }}
          >
            Scan Risk <ArrowRight size={13} />
          </button>
        </div>

        {/* Two column: Graph + Heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <ContagionGraph />
          <SectorHeatmap />
        </div>

        {/* How Contagion Works */}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 20, padding: '2rem', boxShadow: 'var(--shadow-card)',
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0a0f1e', marginBottom: '0.5rem' }}>
            How Contagion Risk Spreads
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7a99', marginBottom: '1.5rem' }}>
            Corporate failure doesn't travel in isolation — it moves through three primary transmission channels.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {[
              {
                step: '01',
                icon: Share2,
                title: 'Promoter Pledge Cascade',
                desc: 'When promoters pledge shares as collateral and stock falls, brokers force-sell shares triggering further price drops across related holdings.',
                color: '#e11d48',
              },
              {
                step: '02',
                icon: TrendingDown,
                title: 'Credit Linkage Freeze',
                desc: 'Banks exposed to a group entity freeze credit lines across the entire conglomerate, cutting off working capital for otherwise solvent subsidiaries.',
                color: '#d97706',
              },
              {
                step: '03',
                icon: AlertTriangle,
                title: 'Sentiment Contagion',
                desc: 'Investor panic from one entity bleeds into sister stocks regardless of fundamentals, creating liquidity-driven correlated selloffs across the network.',
                color: '#003087',
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} style={{
                  background: '#fafbfd', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: `${item.color}12`, border: `1px solid ${item.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={item.color} strokeWidth={2} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800,
                      color: item.color, letterSpacing: '0.06em',
                    }}>
                      CHANNEL {item.step}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#0a0f1e', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#6b7a99', lineHeight: 1.65 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .contagion-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
