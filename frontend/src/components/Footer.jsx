import React from 'react';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function Footer({ setPage }) {
  const { t } = useTranslation();

  return (
    <footer style={{
      background: '#0a0f1e', color: '#94a3b8',
      borderTop: '1px solid #1e2a45', padding: '4rem 0 2rem',
      fontSize: '0.875rem',
    }}>
      <div className="wrap">
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem',
          paddingBottom: '3rem', borderBottom: '1px solid #1e2a45',
        }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#003087', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldAlert size={20} color="white" />
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.03em' }}>
                {t('brandTitle')}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, maxWidth: 320, marginBottom: '1rem' }}>
              {t('footerDesc')}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 6, padding: '0.35rem 0.75rem',
              fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              SEBI Compliant Telemetry Format
            </div>
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>
              Platform
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
              <li>
                <button onClick={() => setPage('home')} style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  {t('navHome')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('scanner')} style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  {t('navScanner')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('portfolio')} style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  {t('navPortfolio')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('compare')} style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  {t('navCompare')}
                </button>
              </li>
            </ul>
          </div>

          {/* Intelligence */}
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>
              Intelligence
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
              <li>
                <button onClick={() => setPage('contagion')} style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  {t('navContagion')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('alerts')} style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  {t('alertHistoryTitle')}
                </button>
              </li>
            </ul>
          </div>

          {/* Regulatory Scope */}
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>
              Coverage
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0, fontSize: '0.85rem' }}>
              <li style={{ color: '#64748b' }}>NSE Equities &amp; F&amp;O</li>
              <li style={{ color: '#64748b' }}>BSE Monitored Stocks</li>
              <li style={{ color: '#64748b' }}>Nifty 500 Index</li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '2rem', fontSize: '0.78rem', color: '#475569', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            © {new Date().getFullYear()} CrashRadar. {t('footerRights')} Built for retail investor protection.
          </div>
          <div>
            Disclaimer: AI risk scores are predictive telemetry indicators. Not financial investment advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
