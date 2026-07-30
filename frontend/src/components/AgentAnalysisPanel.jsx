import React, { useState } from 'react';
import { Activity, Search, Network, Bot, ShieldAlert, CheckCircle2, ChevronRight, Sparkles, FileText, Share2 } from 'lucide-react';

/**
 * Generate stock-specific mock outputs for the 3 AI Agents based on PPT architecture:
 * Agent 1: Quantitative Analyst (Price & Volume Heartbeat)
 * Agent 2: Intelligence Researcher (News, SEBI Filings, Social)
 * Agent 3: Graph Master (Knowledge Graph & Family Contagion)
 * Result: The Human-AI Bridge Case Report
 */
export function getAgentOutputs(symbol, riskScore, isDanger, reasons = []) {
  const sym = (symbol || 'RELIANCE').toUpperCase();

  // Stock-tailored agent output data
  const stockConfigs = {
    ADANIENT: {
      agent1: {
        status: 'HIGH ANOMALY',
        statusColor: '#e11d48',
        metrics: [
          { label: 'Volume Spike', value: '4.2x (30D Avg)', alert: true },
          { label: 'Order-Book Depth Imbalance', value: '78% Sell Pressure', alert: true },
          { label: 'Intraday Volatility Index', value: '38.4 (Elevated)', alert: true },
        ],
        finding: 'Abnormal sell-side order flow detected in first 15 minutes of session. Microstructure indicates rapid institutional unwinding.',
      },
      agent2: {
        status: 'CRITICAL DISCLOSURE',
        statusColor: '#e11d48',
        metrics: [
          { label: 'SEBI Filing Scan', value: 'Promoter Pledge Increase', alert: true },
          { label: 'News Sentiment Score', value: '-0.74 (Very Bearish)', alert: true },
          { label: 'Social Media Noise', value: 'Unverified Debt Rumor Spike', alert: true },
        ],
        finding: 'Scoured SEBI regulatory disclosures: 68% promoter stake pledged across offshore entities. Negative news sentiment spike detected.',
      },
      agent3: {
        status: 'CONTAGION RISK HIGH',
        statusColor: '#e11d48',
        metrics: [
          { label: 'Group Entities Linked', value: '7 Listed Companies', alert: true },
          { label: 'Parent-Subsidiary Exposure', value: 'High Cross-Holding', alert: true },
          { label: 'Credit Line Cascade Risk', value: '62% Probability', alert: true },
        ],
        finding: 'Knowledge Graph mapped 7 linked entities. Parent entity stress threatens lower circuit propagation to ADANIPORTS and ADANIPOWER.',
      },
    },
    RELIANCE: {
      agent1: {
        status: 'MODERATE ANOMALY',
        statusColor: '#e11d48',
        metrics: [
          { label: 'Volume Spike', value: '2.8x (30D Avg)', alert: true },
          { label: 'Order-Book Depth Imbalance', value: '62% Sell Pressure', alert: true },
          { label: 'Intraday Volatility Index', value: '24.1 (Above Normal)', alert: false },
        ],
        finding: 'Large block sell trades executed near support level ₹2,920. Bid liquidity thinning in key F&O contracts.',
      },
      agent2: {
        status: 'NEWS SENTIMENT CAUTION',
        statusColor: '#d97706',
        metrics: [
          { label: 'SEBI Filing Scan', value: 'Clear / Compliant', alert: false },
          { label: 'News Sentiment Score', value: '-0.38 (Bearish)', alert: true },
          { label: 'Social Media Noise', value: 'Retail Panic Trending', alert: true },
        ],
        finding: 'Telecom tariff adjustment chatter and retail expansion capex concerns raising short-term trader anxiety in social feeds.',
      },
      agent3: {
        status: 'FAMILY NETWORK STABLE',
        statusColor: '#15803d',
        metrics: [
          { label: 'Group Entities Linked', value: '3 Retail & Telecom Units', alert: false },
          { label: 'Parent-Subsidiary Exposure', value: 'Low Debt Linkage', alert: false },
          { label: 'Credit Line Cascade Risk', value: '12% Low', alert: false },
        ],
        finding: 'Knowledge Graph shows strong balance sheet isolation. Subsidiary capital structure remains shielded from parent volatility.',
      },
    },
    HDFCBANK: {
      agent1: {
        status: 'ELEVATED SLIPPAGE',
        statusColor: '#d97706',
        metrics: [
          { label: 'Volume Spike', value: '1.9x (30D Avg)', alert: false },
          { label: 'Order-Book Depth Imbalance', value: '56% Sell Pressure', alert: true },
          { label: 'Intraday Volatility Index', value: '18.9 (Normal)', alert: false },
        ],
        finding: 'Institutional FII sell-off detected following ADR price discount. Bid depth showing mild compression.',
      },
      agent2: {
        status: 'MARGIN COMPRESSION SCAN',
        statusColor: '#d97706',
        metrics: [
          { label: 'SEBI Filing Scan', value: 'Quarterly NIM Disclosure', alert: false },
          { label: 'News Sentiment Score', value: '-0.21 (Mild Caution)', alert: false },
          { label: 'Social Media Noise', value: 'Low Activity', alert: false },
        ],
        finding: 'Net Interest Margin (NIM) pressure highlighted in recent analyst notes following merger integration cycle.',
      },
      agent3: {
        status: 'FINANCIAL NETWORK WATCH',
        statusColor: '#d97706',
        metrics: [
          { label: 'Group Entities Linked', value: 'HDFC Life, HDFC AMC', alert: false },
          { label: 'Parent-Subsidiary Exposure', value: 'Shared Brand Risk', alert: false },
          { label: 'Credit Line Cascade Risk', value: '22% Moderate', alert: false },
        ],
        finding: 'Systemic banking network graph remains robust, but short-term contagion from NBFC sector stress is being monitored.',
      },
    },
    TCS: {
      agent1: {
        status: 'HEARTBEAT NORMAL',
        statusColor: '#15803d',
        metrics: [
          { label: 'Volume Spike', value: '1.05x (30D Avg)', alert: false },
          { label: 'Order-Book Depth Imbalance', value: '48% Neutral', alert: false },
          { label: 'Intraday Volatility Index', value: '12.4 (Low)', alert: false },
        ],
        finding: 'Trading pattern strictly aligned with benchmark index. No abnormal order book imbalance detected.',
      },
      agent2: {
        status: 'POSITIVE DISCLOSURES',
        statusColor: '#15803d',
        metrics: [
          { label: 'SEBI Filing Scan', value: 'Large Deal Win Disclosed', alert: false },
          { label: 'News Sentiment Score', value: '+0.45 (Bullish)', alert: false },
          { label: 'Social Media Noise', value: 'Neutral Sentiment', alert: false },
        ],
        finding: 'Recent multi-year IT deal announcements confirmed in exchange filings. High management commentary credibility.',
      },
      agent3: {
        status: 'NETWORK SHIELDED',
        statusColor: '#15803d',
        metrics: [
          { label: 'Group Entities Linked', value: 'Tata Group (AAA Rated)', alert: false },
          { label: 'Parent-Subsidiary Exposure', value: 'Zero Pledge Exposure', alert: false },
          { label: 'Credit Line Cascade Risk', value: '4% Minimal', alert: false },
        ],
        finding: 'Tata Group Knowledge Graph confirms zero promoter share pledges and stellar balance sheet independence.',
      },
    },
  };

  // Default fallback if stock is custom
  const defaultConfig = {
    agent1: {
      status: isDanger ? 'ANOMALY DETECTED' : 'HEARTBEAT NORMAL',
      statusColor: isDanger ? '#e11d48' : '#15803d',
      metrics: [
        { label: 'Volume Spike', value: isDanger ? '3.1x (High)' : '1.1x (Normal)', alert: isDanger },
        { label: 'Order-Book Imbalance', value: `${riskScore}% Sell Pressure`, alert: isDanger },
        { label: 'Volatility Metric', value: isDanger ? '29.2 (High)' : '14.1 (Low)', alert: isDanger },
      ],
      finding: isDanger
        ? `Abnormal volume and sell-side depth imbalance detected for ${sym}.`
        : `Trading metrics for ${sym} are within standard parameters.`,
    },
    agent2: {
      status: isDanger ? 'SEARCH WARNING' : 'DISCLOSURES CLEAN',
      statusColor: isDanger ? '#e11d48' : '#15803d',
      metrics: [
        { label: 'SEBI Filing Scan', value: isDanger ? 'Pledge/Audit Flag' : 'No Flags', alert: isDanger },
        { label: 'News Sentiment Score', value: isDanger ? '-0.52 (Bearish)' : '+0.25 (Positive)', alert: isDanger },
        { label: 'Social Sentiment', value: isDanger ? 'Panic Chatter' : 'Stable', alert: isDanger },
      ],
      finding: isDanger
        ? `Unusual regulatory disclosure or sentiment deterioration flagged for ${sym}.`
        : `No negative regulatory filings or sentiment anomalies discovered for ${sym}.`,
    },
    agent3: {
      status: isDanger ? 'CONTAGION ALERT' : 'GRAPH CLEAR',
      statusColor: isDanger ? '#e11d48' : '#15803d',
      metrics: [
        { label: 'Knowledge Graph Links', value: isDanger ? '4 Affiliated Entities' : 'Independent Structure', alert: isDanger },
        { label: 'Pledge Contagion', value: isDanger ? 'High Exposure' : 'Zero Pledge Risk', alert: isDanger },
        { label: 'Cascade Risk', value: isDanger ? '54% High' : '8% Low', alert: isDanger },
      ],
      finding: isDanger
        ? `Knowledge Graph indicates parent/subsidiary debt linkage risk.`
        : `Knowledge Graph confirms isolated corporate structure with low contagion risk.`,
    },
  };

  const cfg = stockConfigs[sym] || defaultConfig;

  // The 3 Agents array matching PPT slide 3
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
      role: 'Watches the "Heartbeat" of the stock. Detects abnormal volume and price patterns in milliseconds.',
      data: cfg.agent1,
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
      role: 'Scours News, SEBI filings, and Social Media to find the "Why" behind the numbers.',
      data: cfg.agent2,
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
      role: 'Navigates the Knowledge Graph to see if "family members" (parent/sister entities) are in trouble.',
      data: cfg.agent3,
    },
  ];

  // The Human-AI Bridge Synthesis Case Report
  const caseReport = isDanger
    ? `CASE REPORT: High crash risk flagged for ${sym} (Risk Score: ${riskScore}/100). Quantitative Analyst detected a ${cfg.agent1.metrics[0].value} volume spike with order-book imbalance. Intelligence Researcher confirmed negative news/filing sentiment. Graph Master mapped contagion links to affiliated entities. Recommendation: Exercise caution before lower circuits lock liquidity.`
    : `CASE REPORT: ${sym} cleared all three agent scans (Risk Score: ${riskScore}/100). Microstructure heartbeat, regulatory news filings, and corporate knowledge graph remain in safe operational zones.`;

  return { agents, caseReport };
}

export default function AgentAnalysisPanel({ symbol, riskScore = 0, isDanger = false, reasons = [] }) {
  const [activeTab, setActiveTab] = useState('all');
  const { agents, caseReport } = getAgentOutputs(symbol, riskScore, isDanger, reasons);

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
                3-AGENT CONSENSUS
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6b7a99', marginTop: '0.15rem' }}>
              Detailed outputs from the 3 specialized AI agents inspecting {symbol}
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

      {/* ── The Human-AI Bridge (The Result Case Report) ───── */}
      <div style={{
        background: isDanger ? 'linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #e8f0fc 100%)',
        border: `1.5px solid ${isDanger ? '#fecdd3' : '#bbf7d0'}`,
        borderRadius: 16, padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: isDanger ? '#ffe4e6' : '#dcfce7',
          border: `1px solid ${isDanger ? '#fecdd3' : '#bbf7d0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isDanger ? '#be123c' : '#15803d', marginTop: '0.1rem',
        }}>
          <Sparkles size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900,
              color: isDanger ? '#be123c' : '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em',
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
        </div>
      </div>

    </div>
  );
}
