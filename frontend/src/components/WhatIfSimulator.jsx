import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import RiskGauge from './RiskGauge';

export default function WhatIfSimulator({ symbol = 'RELIANCE', baseScore = 50, isDanger = false, onGaugeUpdate }) {
  const [volSpike, setVolSpike] = useState(0); // 0 to 500%
  const [priceDrop, setPriceDrop] = useState(0); // 0 to 30%

  // Formula: baseScore + (volSpike * 0.08) + (priceDrop * 1.5)
  const computedScore = Math.min(100, Math.max(0, Math.round(
    baseScore + (volSpike * 0.08) + (priceDrop * 1.5)
  )));

  const computedDanger = computedScore >= 70;

  const handleReset = () => {
    setVolSpike(0);
    setPriceDrop(0);
  };

  return (
    <div style={{
      background: 'white', border: '1.5px dashed #3b82f6',
      borderRadius: 20, padding: '1.75rem', boxShadow: 'var(--shadow-card)',
      marginTop: '1.5rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: '#eff6ff',
            border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#1d4ed8',
          }}>
            <Sliders size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontWeight: 800, color: '#0a0f1e', fontSize: '1.05rem' }}>
                What-If Crash Risk Simulator
              </h3>
              <span className="badge-simulated">
                What-if simulator (not live data)
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6b7a99' }}>
              Simulate volume spikes &amp; intraday drops for {symbol} to test real-time risk gauge response.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
        >
          <RefreshCw size={13} /> Reset to live score
        </button>
      </div>

      {/* Grid: Sliders on left, Live Computed Gauge on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem', alignItems: 'center' }}>
        
        {/* Left Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Slider 1: Volume Spike */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3d4966' }}>
                Simulated Volume Spike (%)
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#003087', fontSize: '0.9rem' }}>
                +{volSpike}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={volSpike}
              onChange={e => setVolSpike(Number(e.target.value))}
              style={{
                width: '100%', height: 6, borderRadius: 3,
                accentColor: '#003087', cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
              <span>0% (Normal)</span>
              <span>+250%</span>
              <span>+500% (Extreme)</span>
            </div>
          </div>

          {/* Slider 2: Price Drop */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3d4966' }}>
                Simulated Price Drop (%)
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#be123c', fontSize: '0.9rem' }}>
                -{priceDrop}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={priceDrop}
              onChange={e => setPriceDrop(Number(e.target.value))}
              style={{
                width: '100%', height: 6, borderRadius: 3,
                accentColor: '#e11d48', cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
              <span>0% (Stable)</span>
              <span>-15%</span>
              <span>-30% (Lower Circuit)</span>
            </div>
          </div>

          {/* Explanation note */}
          <div style={{
            background: '#fafbfd', border: '1px solid var(--border)',
            borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#64748b',
          }}>
            ⚡ Base Score: <strong style={{ color: '#0a0f1e' }}>{baseScore}/100</strong> → Simulated Score: <strong style={{ color: computedDanger ? '#be123c' : '#15803d' }}>{computedScore}/100</strong>
          </div>
        </div>

        {/* Right Live Computed Gauge */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Simulated Live Response
            </span>
          </div>
          <RiskGauge score={computedScore} isDanger={computedDanger} />
        </div>

      </div>
    </div>
  );
}
