import React, { useState } from 'react';
import { Lock, Gauge, Network, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Clock, ArrowRight, Shield } from 'lucide-react';

const PROBLEMS = [
  {
    icon: Lock,
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    number: '01',
    title: 'The Liquidity Death-Trap',
    subtitle: 'Lower Circuit Lock-ins',
    description: 'When adverse news hits a stock, NSE/BSE price bands trigger automatic lower circuit breakers (5%, 10%, 20%). Once activated, buy orders disappear entirely. Retail investors who haven\'t exited are trapped — their capital is frozen while institutional desks, with pre-positioned short orders, have already exited at superior prices.',
    impact: 'Retail investors lose liquidity access for 15 minutes to an entire trading session.',
    stat: '₹2,800 Cr', statLabel: 'Average daily retail capital trapped in lower circuits',
  },
  {
    icon: Gauge,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    number: '02',
    title: 'The Speed Gap',
    subtitle: 'Milliseconds vs Hours',
    description: 'Institutional desks and algorithmic trading systems receive order-book data, news feeds, and regulatory disclosures in milliseconds. They act in sub-second timeframes. Retail investors typically learn about a material development from news channels, social media, or broker alerts — often 30 to 120 minutes after the smart money has already exited.',
    impact: 'A 120-minute information asymmetry that systematically disadvantages retail participants.',
    stat: '120 Min', statLabel: 'Typical retail vs institutional information gap on material events',
  },
  {
    icon: Network,
    color: '#003087',
    bg: '#e8f0fc',
    border: '#c0d5f5',
    number: '03',
    title: 'The Shadow Network',
    subtitle: 'Cross-Holding Blindspots',
    description: 'Indian conglomerates share directors, cross-holdings, pledge arrangements, and credit facilities. A default or rating downgrade in one group entity creates cascading margin calls on sister companies. Retail investors with exposure to what appears to be a safe subsidiary are unaware that promoter stress in the parent is about to trigger a correlated selloff.',
    impact: 'Correlated losses across 3–8 group entities from a single parent-level event.',
    stat: '68%', statLabel: 'Of Nifty 500 crashes involve at least one related contagion entity',
  },
  {
    icon: HelpCircle,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    number: '04',
    title: 'The Logic Deficit',
    subtitle: 'Opaque AI Risk Scores',
    description: 'A growing number of fintech platforms now assign risk ratings to stocks — but without explanations. A score of "7.2 / 10 High Risk" tells the investor nothing about whether the risk stems from promoter pledge levels, order flow imbalance, news sentiment collapse, or peer contagion. Without transparency, investors rightfully ignore the warnings until it is too late.',
    impact: 'Black-box signals are dismissed, eliminating the protective value of early AI detection.',
    stat: '84%', statLabel: 'Retail investors who ignore opaque AI risk alerts without clear explanations',
  },
];

const AGENTS = [
  {
    step: '01',
    title: 'Quantitative Analysis',
    desc: 'The AI monitors intraday price movement, order book imbalance (bid-ask depth), volume anomalies, and volatility metrics using gradient-boosted ML models trained on historical NSE crash patterns.',
    color: '#003087',
    bg: '#e8f0fc',
  },
  {
    step: '02',
    title: 'Market Intelligence Scan',
    desc: 'Regulatory filings, exchange disclosures, and financial news headlines are processed through natural language analysis to surface material events — management changes, debt ratings, pledging activity — that historically precede price crashes.',
    color: '#15803d',
    bg: '#f0fdf4',
  },
  {
    step: '03',
    title: 'Contagion Network Mapping',
    desc: 'Corporate ownership graphs are traversed in real time to identify how stress in one entity propagates through promoter pledges, inter-company guarantees, and shared credit facilities to affect adjacent group stocks.',
    color: '#be123c',
    bg: '#fff1f2',
  },
];

export default function ProtectionPage({ setPage }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="wrap">

        {/* Page Header */}
        <div style={{ marginBottom: '3rem' }}>
          <span className="section-label" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
            Retail Investor Protection
          </span>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
            Why Retail Investors Lose — <br />And How CrashRadar Protects Them
          </h1>
          <p className="section-sub">
            Four structural vulnerabilities systematically disadvantage retail investors during market crashes. CrashRadar is built to close each gap.
          </p>
        </div>

        {/* 4 Problems — Accordion Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '4rem' }}>
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                style={{
                  background: 'white', border: `1px solid ${isOpen ? p.color + '60' : 'var(--border)'}`,
                  borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)',
                  transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '1.25rem',
                    padding: '1.25rem 1.5rem', background: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: p.bg, border: `1px solid ${p.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} color={p.color} strokeWidth={2} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800,
                        color: p.color, letterSpacing: '0.06em',
                      }}>
                        PROBLEM {p.number}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, background: p.bg,
                        color: p.color, border: `1px solid ${p.border}`,
                        padding: '0.1rem 0.5rem', borderRadius: 4,
                      }}>
                        {p.subtitle}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 800, color: '#0a0f1e', fontSize: '1.05rem' }}>
                      {p.title}
                    </h3>
                  </div>

                  <div style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                    background: '#f5f7fa', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#64748b',
                  }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: '1.25rem' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: '#3d4966', lineHeight: 1.75, marginBottom: '1rem' }}>
                          {p.description}
                        </p>
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                          background: '#fafbfd', border: '1px solid var(--border)',
                          borderRadius: 10, padding: '0.75rem 1rem',
                        }}>
                          <Shield size={15} color={p.color} style={{ flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
                            <strong style={{ color: '#0a0f1e' }}>Impact:</strong> {p.impact}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        background: p.bg, border: `1px solid ${p.border}`,
                        borderRadius: 14, padding: '1.25rem 1.5rem', textAlign: 'center',
                        minWidth: 140, flexShrink: 0,
                      }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: p.color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}>
                          {p.stat}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem', lineHeight: 1.5 }}>
                          {p.statLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How CrashRadar Protects — 3-Step Intelligence Workflow */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
              Protection Mechanism
            </span>
            <h2 className="section-title" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              3-Layer Market Intelligence Engine
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#6b7a99', maxWidth: 600, margin: '0 auto' }}>
              CrashRadar combines three specialized analysis layers to provide a 15-minute survival window before lower circuits activate.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute', left: '2.5rem', top: '3rem', bottom: '3rem',
              width: 2, background: 'linear-gradient(to bottom, #003087, #15803d, #be123c)',
              opacity: 0.25, borderRadius: 2,
            }} />

            {AGENTS.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                background: 'white', border: '1px solid var(--border)',
                borderRadius: 16, padding: '1.5rem', marginBottom: i < 2 ? '1rem' : 0,
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: a.bg, border: `1px solid ${a.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1rem',
                  color: a.color, zIndex: 1, position: 'relative',
                }}>
                  {a.step}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: '#0a0f1e', marginBottom: '0.4rem', fontSize: '1rem' }}>
                    {a.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7a99', lineHeight: 1.7 }}>
                    {a.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: '#0a0f1e', borderRadius: 20, padding: '3rem',
          textAlign: 'center', color: 'white',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#003087',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
          }}>
            <Clock size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Get Your 15-Minute Survival Window
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Scan any NSE/BSE stock now and receive explainable risk scores with transparent drivers — before lower circuits trap your capital.
          </p>
          <button
            className="btn btn-lg"
            onClick={() => setPage('scanner')}
            style={{ background: 'white', color: '#003087', fontWeight: 800 }}
          >
            Launch Risk Scanner <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
