import React, { useState } from 'react';
import { MessageSquare, Play, Pause, CheckCheck, Volume2, ShieldAlert } from 'lucide-react';
import { generateWhatsAppPreview } from '../services/whatsappPreviewService';

export default function WhatsAppPreview({ symbol = 'RELIANCE', riskScore = 72, reasons = [], isDanger = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const preview = generateWhatsAppPreview(symbol, riskScore, reasons, isDanger);

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-card)',
      marginTop: '1.5rem',
    }}>
      {/* Container Header */}
      <div style={{
        padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fafbfd',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: '#25D366',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <MessageSquare size={16} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0a0f1e' }}>
            Assistive Guardian Hub — WhatsApp Voice Alert Preview
          </span>
        </div>

        {/* Mandatory Simulated Tag */}
        <span className="badge-simulated">
          Simulated Preview
        </span>
      </div>

      {/* Mock Chat Body */}
      <div style={{
        background: '#efeae2', padding: '1.25rem',
        backgroundImage: 'radial-gradient(#d1c7b7 1px, transparent 1px)',
        backgroundSize: '16px 16px', minHeight: 180,
      }}>
        {/* Date pill */}
        <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
          <span style={{
            background: 'rgba(255,255,255,0.85)', borderRadius: 6,
            padding: '0.2rem 0.6rem', fontSize: '0.68rem', color: '#54656f',
            fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}>
            TODAY · {preview.timestamp}
          </span>
        </div>

        {/* WhatsApp Chat Bubble */}
        <div style={{
          background: '#ffffff', borderRadius: '0 12px 12px 12px',
          padding: '0.85rem 1rem', maxWidth: 440,
          boxShadow: '0 1px 3px rgba(11,20,26,0.13)',
          borderLeft: '4px solid #25D366', margin: '0 auto',
        }}>
          {/* Sender header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#075e54' }}>
              {preview.senderName}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#667781', fontFamily: 'var(--font-mono)' }}>
              {preview.recipientMasked}
            </span>
          </div>

          {/* Voice note player preview */}
          <div style={{
            background: '#f0f2f5', borderRadius: 10, padding: '0.5rem 0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem',
          }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: '#00a884',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
            </button>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: 16 }}>
                {[40, 70, 30, 90, 50, 80, 100, 40, 60, 80, 50, 90, 30, 70, 40].map((h, i) => (
                  <span key={i} style={{
                    width: 3, height: `${h}%`,
                    background: isPlaying ? '#00a884' : '#8696a0',
                    borderRadius: 2, transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#667781', marginTop: 2 }}>
                <span>{isPlaying ? '0:07' : '0:00'}</span>
                <span>{preview.audioDuration}</span>
              </div>
            </div>
            <Volume2 size={16} color="#8696a0" />
          </div>

          {/* Message Text */}
          <p style={{
            fontSize: '0.82rem', color: '#111b21', lineHeight: 1.6,
            whiteSpace: 'pre-line', fontWeight: 450,
          }}>
            {preview.messageText}
          </p>

          {/* Timestamp & Double Ticks */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: '0.35rem' }}>
            <span style={{ fontSize: '0.62rem', color: '#667781' }}>{preview.timestamp}</span>
            <CheckCheck size={14} color="#53bdeb" />
          </div>
        </div>
      </div>
    </div>
  );
}
