import React, { useState } from 'react';
import { Activity, Search, Network, Bot, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

/**
 * AgentAnalysisPanel
 *
 * Reads LIVE backend data from the full /predict/{stock} response.
 * Props:
 *   symbol       - stock ticker string
 *   predictData  - full object returned by predictStockCrash() / api.js
 *                  Must contain agent1, agent2, agent3 sub-objects.
 *
 * Legacy fallback props (when predictData is not available yet):
 *   riskScore, isDanger, reasons
 */
export default function AgentAnalysisPanel({ symbol, predictData, riskScore = 0, isDanger = false, reasons = [] }) {
  const [activeTab, setActiveTab] = useState('all');

  // Pull live data from the full backend response when available
  const agent1 = predictData?.agent1 ?? {};
  const agent2 = predictData?.agent2 ?? {};
  const agent3 = predictData?.agent3 ?? {};
  const breakdown = predictData?.score_breakdown ?? {};

  const liveRiskScore  = predictData?.final_risk_score ?? riskScore;
  const liveIsDanger   = predictData?.is_danger ?? isDanger;
  const liveFinalVerdict = predictData?.final_verdict ?? '';

  const hasLiveData = Boolean(predictData?.agent1?.risk_score !== undefined);

  // ─── Agent 1 data ────────────────────────────────────────────────
  const agent1Score = agent1.risk_score ?? 0;
  const agent1Danger = agent1.is_danger ?? false;
  const agent1Reasons = Array.isArray(agent1.shap_reasons) ? agent1.shap_reasons : [];
  const agent1PlainEnglish = agent1.plain_english ?? '';
  const liveMarket = agent1.live_market ?? {};

  const agent1Status = agent1Danger
    ? (agent1Score >= 70 ? 'HIGH ANOMALY' : 'MODERATE ANOMALY')
    : 'HEARTBEAT NORMAL';
  const agent1StatusColor = agent1Danger ? '#e11d48' : '#15803d';

  const agent1Metrics = hasLiveData ? [
    {
      label: 'Agent 1 Risk Score',
      value: `${agent1Score}/100`,
      alert: agent1Danger,
    },
    {
      label: 'Live Intraday',
      value: liveMarket.price_change_pct != null
        ? `${liveMarket.price_change_pct > 0 ? '+' : ''}${liveMarket.price_change_pct}%`
        : (agent1PlainEnglish.match(/live intraday: price ([^\s,]+)/i)?.[1] ?? '—'),
      alert: liveMarket.price_change_pct != null && liveMarket.price_change_pct < -1,
    },
    {
      label: 'Contribution to Score',
      value: breakdown.agent1_contribution != null ? `+${breakdown.agent1_contribution}` : '—',
      alert: false,
    },
  ] : [
    { label: 'Risk Score', value: `${agent1Score}/100`, alert: agent1Danger },
    { label: 'Model Signal', value: agent1Danger ? 'ELEVATED' : 'NORMAL', alert: agent1Danger },
    { label: 'Status', value: agent1Status, alert: agent1Danger },
  ];

  const agent1Finding = agent1Reasons.length > 0
    ? agent1Reasons[0]
    : (agent1PlainEnglish || `Agent 1 historical model processed ${symbol}.`);

  // ─── Agent 2 data ────────────────────────────────────────────────
  const agent2Sentiment = agent2.sentiment ?? 'neutral';
  const agent2Score = agent2.score ?? 0;
  const agent2Conclusion = agent2.conclusion ?? '';
  const agent2Articles = Array.isArray(agent2.articles) ? agent2.articles : [];
  const agent2Boost = agent2.risk_boost ?? 0;
  const latestArticle = agent2Articles[0];

  const agent2SentimentUpper = agent2Sentiment.toUpperCase();
  const agent2StatusColor =
    agent2Sentiment === 'negative' ? '#e11d48' :
    agent2Sentiment === 'neutral'  ? '#d97706' : '#15803d';
  const agent2Status = hasLiveData
    ? `${agent2SentimentUpper} SENTIMENT (${agent2Score}/100)`
    : 'NEWS SENTIMENT';

  const agent2Metrics = hasLiveData ? [
    {
      label: 'Sentiment',
      value: agent2SentimentUpper,
      alert: agent2Sentiment === 'negative',
    },
    {
      label: 'Confidence Score',
      value: `${agent2Score}/100`,
      alert: agent2Score < 40,
    },
    {
      label: 'Risk Boost Applied',
      value: `+${agent2Boost}/30`,
      alert: agent2Boost > 10,
    },
  ] : [
    { label: 'Sentiment', value: '—', alert: false },
    { label: 'Score', value: '—', alert: false },
    { label: 'Risk Boost', value: '—', alert: false },
  ];

  const agent2Finding = agent2Conclusion
    || (latestArticle ? `Latest: "${latestArticle.title}" (${latestArticle.source})` : `No news data for ${symbol}.`);

  // ─── Agent 3 data ────────────────────────────────────────────────
  const agent3ContagionRisk  = agent3.contagion_risk ?? 'UNKNOWN';
  const agent3ContagionScore = agent3.contagion_score ?? 0;
  const agent3Conclusion     = agent3.conclusion ?? '';
  const agent3Affected       = Array.isArray(agent3.affected_companies) ? agent3.affected_companies : [];
  const agent3Sector         = Array.isArray(agent3.sector) ? agent3.sector.join(', ') : (agent3.sector ?? '—');

  const agent3StatusColor =
    agent3ContagionRisk === 'CRITICAL' ? '#e11d48' :
    agent3ContagionRisk === 'HIGH'     ? '#e11d48' :
    agent3ContagionRisk === 'MODERATE' ? '#d97706' : '#15803d';
  const agent3Status = hasLiveData
    ? `CONTAGION: ${agent3ContagionRisk} (${agent3ContagionScore}/100)`
    : 'CONTAGION RISK';

  const worstAffected = agent3Affected.length > 0
    ? [...agent3Affected].sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))[0]
    : null;

  const agent3Metrics = hasLiveData ? [
    {
      label: 'Contagion Score',
      value: `${agent3ContagionScore}/100`,
      alert: agent3ContagionScore >= 50,
    },
    {
      label: 'Sector',
      value: agent3Sector || '—',
      alert: false,
    },
    {
      label: 'Related Companies',
      value: agent3Affected.length > 0 ? `${agent3Affected.length} linked` : 'None',
      alert: agent3Affected.length > 3,
    },
  ] : [
    { label: 'Contagion Risk', value: '—', alert: false },
    { label: 'Sector', value: '—', alert: false },
    { label: 'Related Entities', value: '—', alert: false },
  ];

  const agent3Finding = agent3Conclusion
    || (worstAffected
      ? `Highest risk linked entity: ${worstAffected.ticker} (${worstAffected.relation}, ${worstAffected.risk_score}/100).`
      : `No contagion data for ${symbol}.`);

  // ─── Case report (Human-AI Bridge) ───────────────────────────────
  const caseReport = liveFinalVerdict
    || (liveIsDanger
      ? `CASE REPORT: High crash risk flagged for ${symbol} (Risk Score: ${liveRiskScore}/100). ` +
        `Agent 1 detected elevated model signals. Agent 2 sentiment: ${agent2SentimentUpper}. ` +
        `Agent 3 contagion: ${agent3ContagionRisk}.`
      : `CASE REPORT: ${symbol} cleared all three agent scans (Risk Score: ${liveRiskScore}/100). ` +
        `Microstructure heartbeat, news sentiment, and contagion graph all within safe parameters.`);

  // ─── Agents config ───────────────────────────────────────────────
  const agents = [
    {
      id: 'agent1',
      number: 'Agent 1',
      title: 'The Quantitative Analyst',
      subtitle: 'Price & Volume Heartbeat',
      icon: Activity,
      themeColor: '#003087',
      themeBg: '#e8f0fc',
      themeBorder: '#c0d5f5',
      role: 'Watches the "Heartbeat" of the stock. Detects abnormal volume and price patterns using XGBoost ML model trained on historical crash data.',
      data: { status: agent1Status, statusColor: agent1StatusColor, metrics: agent1Metrics, finding: agent1Finding },
    },
    {
      id: 'agent2',
      number: 'Agent 2',
      title: 'The Intelligence Researcher',
      subtitle: 'News, Filings & Sentiment',
      icon: Search,
      themeColor: '#15803d',
      themeBg: '#f0fdf4',
      themeBorder: '#bbf7d0',
      role: 'Scours live news and analyses sentiment to find the "Why" behind the numbers. Adjusts risk score based on article confidence.',
      data: { status: agent2Status, statusColor: agent2StatusColor, metrics: agent2Metrics, finding: agent2Finding },
    },
    {
      id: 'agent3',
      number: 'Agent 3',
      title: 'The Graph Master',
      subtitle: 'Knowledge Graph & Contagion',
      icon: Network,
      themeColor: '#be123c',
      themeBg: '#fff1f2',
      themeBorder: '#fecdd3',
      role: 'Navigates the corporate Knowledge Graph to detect if parent/subsidiary entities carry contagion risk that could cascade.',
      data: { status: agent3Status, statusColor: agent3StatusColor, metrics: agent3Metrics, finding: agent3Finding },
    },
  ];

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 20, padding: '1.75rem', boxShadow: 'var(--shadow-card)',
      marginTop: '1.5rem',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #003087 0%, #001b6e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontWeight: 900, color: '#0a0f1e', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                Multi-Agent Intelligence Telemetry
              </h3>
              <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>
                {hasLiveData ? 'LIVE DATA' : '3-AGENT CONSENSUS'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6b7a99', marginTop: '0.15rem' }}>
              {hasLiveData
                ? `Live outputs from 3 AI agents — real backend data for ${symbol}`
                : `Detailed outputs from the 3 specialized AI agents inspecting ${symbol}`}
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{
          display: 'flex', gap: '0.35rem', background: '#f5f7fa',
          padding: '0.25rem', borderRadius: 10, border: '1px solid var(--border)',
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: 7, border: 'none',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              background: activeTab === 'all' ? 'white' : 'transparent',
              color: activeTab === 'all' ? '#003087' : '#64748b',
              boxShadow: activeTab === 'all' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            All 3 Agents
          </button>
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveTab(a.id)}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: 7, border: 'none',
                fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                background: activeTab === a.id ? 'white' : 'transparent',
                color: activeTab === a.id ? a.themeColor : '#64748b',
                boxShadow: activeTab === a.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {a.number}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3 Agent Cards Grid ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeTab === 'all' ? 'repeat(3, 1fr)' : '1fr',
        gap: '1.25rem', marginBottom: '1.5rem',
      }}>
        {agents
          .filter(a => activeTab === 'all' || activeTab === a.id)
          .map((agent) => {
            const Icon = agent.icon;
            const data = agent.data;
            return (
              <div
                key={agent.id}
                style={{
                  background: '#fafbfd', border: `1px solid ${agent.themeBorder}`,
                  borderRadius: 16, padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  {/* Card Top: Icon + Title + Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: agent.themeBg, border: `1px solid ${agent.themeBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={19} color={agent.themeColor} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 800,
                          color: agent.themeColor, textTransform: 'uppercase', letterSpacing: '0.08em',
                        }}>
                          {agent.number}
                        </div>
                        <h4 style={{ fontWeight: 800, color: '#0a0f1e', fontSize: '0.92rem', lineHeight: 1.2 }}>
                          {agent.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Agent Role description */}
                  <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem', fontStyle: 'italic' }}>
                    "{agent.role}"
                  </p>

                  {/* Status Pill */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: `${data.statusColor}12`, border: `1px solid ${data.statusColor}30`,
                    color: data.statusColor, borderRadius: 6, padding: '0.25rem 0.6rem',
                    fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '1rem',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: data.statusColor, display: 'inline-block' }} />
                    {data.status}
                  </div>

                  {/* Metrics Telemetry */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                    {data.metrics.map((m, idx) => (
                      <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'white', border: '1px solid #edf2f7',
                        borderRadius: 8, padding: '0.45rem 0.75rem', fontSize: '0.75rem',
                      }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>{m.label}</span>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: m.alert ? '#be123c' : '#15803d',
                        }}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Finding Summary */}
                <div style={{
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '0.75rem 0.85rem',
                  fontSize: '0.78rem', color: '#3d4966', lineHeight: 1.55, fontWeight: 500,
                }}>
                  <strong style={{ color: '#0a0f1e', display: 'block', marginBottom: '0.2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🔍 AGENT OBSERVATION:
                  </strong>
                  {data.finding}
                </div>

              </div>
            );
          })}
      </div>

      {/* ── The Human-AI Bridge (Synthesized Case Report) ───── */}
      <div style={{
        background: liveIsDanger ? 'linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #e8f0fc 100%)',
        border: `1.5px solid ${liveIsDanger ? '#fecdd3' : '#bbf7d0'}`,
        borderRadius: 16, padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: liveIsDanger ? '#ffe4e6' : '#dcfce7',
          border: `1px solid ${liveIsDanger ? '#fecdd3' : '#bbf7d0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: liveIsDanger ? '#be123c' : '#15803d', marginTop: '0.1rem',
        }}>
          <Sparkles size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900,
              color: liveIsDanger ? '#be123c' : '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              The Human-AI Bridge (Synthesized Case Report)
            </span>
            <span style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 4, padding: '0.08rem 0.45rem', fontSize: '0.65rem', fontWeight: 800,
              color: '#475569',
            }}>
              FINAL VERDICT
            </span>
          </div>

          <p style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.6 }}>
            {caseReport}
          </p>

          {/* Score breakdown if available */}
          {breakdown.formula && (
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              Score formula: {breakdown.formula} → Agent1: {breakdown.agent1_contribution} | News: {breakdown.news_contribution} | Contagion: {breakdown.contagion_contribution}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
