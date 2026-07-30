import React from 'react';
import { ShieldAlert, Menu, X, Globe, Bell } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function Navbar({ activePage, setPage }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { lang, setLang, t } = useTranslation();

  const PAGES = [
    { id: 'home',       labelKey: 'navHome' },
    { id: 'scanner',    labelKey: 'navScanner' },
    { id: 'portfolio',  labelKey: 'navPortfolio' },
    { id: 'compare',    labelKey: 'navCompare' },
    { id: 'contagion',  labelKey: 'navContagion' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'white', borderBottom: '2px solid #003087',
      boxShadow: '0 2px 12px rgba(0,48,135,0.08)',
    }}>
      <div className="wrap" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: '64px',
      }}>
        {/* Logo */}
        <button
          onClick={() => setPage('home')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: '#003087', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ShieldAlert size={20} color="white" strokeWidth={2.2} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0a0f1e', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {t('brandTitle')}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#6b7a99', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {t('brandSub')}
            </div>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }} className="desktop-nav">
          {PAGES.map(p => (
            <button
              key={p.id}
              onClick={() => setPage(p.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.85rem',
                background: activePage === p.id ? '#e8f0fc' : 'none',
                color: activePage === p.id ? '#003087' : '#3d4966',
                border: activePage === p.id ? '1px solid #c0d5f5' : '1px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (activePage !== p.id) { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.color = '#0a0f1e'; } }}
              onMouseLeave={e => { if (activePage !== p.id) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#3d4966'; } }}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </nav>

        {/* Controls: Language Switcher + Alert Bell Icon + Scan CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#f0f3f8', borderRadius: 8, padding: '0.2rem 0.4rem' }}>
            <Globe size={14} color="#6b7a99" />
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={{
                background: 'none', border: 'none', fontSize: '0.75rem',
                fontWeight: 800, color: '#0a0f1e', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          {/* Alert History Bell Icon in top right */}
          <button
            onClick={() => setPage('alerts')}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: activePage === 'alerts' ? '#e8f0fc' : '#f5f7fa',
              border: `1px solid ${activePage === 'alerts' ? '#c0d5f5' : '#dce3ef'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: activePage === 'alerts' ? '#003087' : '#3d4966',
              position: 'relative', transition: 'all 0.15s',
            }}
            title={t('alertHistoryTitle')}
            onMouseEnter={e => e.currentTarget.style.background = '#e8f0fc'}
            onMouseLeave={e => e.currentTarget.style.background = activePage === 'alerts' ? '#e8f0fc' : '#f5f7fa'}
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 8, height: 8,
              borderRadius: '50%', background: '#e11d48', border: '1.5px solid white',
            }} />
          </button>

          {/* CTA button */}
          <button
            className="btn btn-primary btn-sm desktop-only"
            onClick={() => setPage('scanner')}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}
          >
            {t('scanBtn')}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', padding: '0.4rem' }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div style={{
          background: 'white', borderBottom: '1px solid var(--border)',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {PAGES.map(p => (
            <button
              key={p.id}
              onClick={() => { setPage(p.id); setMobileOpen(false); }}
              style={{
                padding: '0.65rem 1rem', textAlign: 'left', borderRadius: 8,
                fontWeight: 700, fontSize: '0.875rem',
                background: activePage === p.id ? '#e8f0fc' : 'none',
                color: activePage === p.id ? '#003087' : '#0a0f1e',
              }}
            >
              {t(p.labelKey)}
            </button>
          ))}
          <button
            onClick={() => { setPage('alerts'); setMobileOpen(false); }}
            style={{
              padding: '0.65rem 1rem', textAlign: 'left', borderRadius: 8,
              fontWeight: 700, fontSize: '0.875rem',
              background: activePage === 'alerts' ? '#e8f0fc' : 'none',
              color: '#003087', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <Bell size={16} /> {t('alertHistoryTitle')}
          </button>
        </div>
      )}
    </header>
  );
}
