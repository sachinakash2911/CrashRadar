import React from 'react';
import { Clock, LineChart, FileText, Share2, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Solution() {
  const agents = [
    {
      icon: LineChart,
      name: 'Agent 1: Quantitative Analyst',
      badge: 'Price & Volume Anomalies',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Continuously monitors order-book imbalances, bid-ask spread anomalies, sudden volume surges, and intraday volatility signals using XGBoost machine learning.'
    },
    {
      icon: FileText,
      name: 'Agent 2: Intelligence Researcher',
      badge: 'NLP & News Scraper',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Scans exchange filings (NSE/BSE disclosures), financial news feeds, and sentiment trends via spaCy NLP & LLMs to extract exact contextual reasons for sudden price drops.'
    },
    {
      icon: Share2,
      name: 'Agent 3: Graph Master',
      badge: 'Neo4j Contagion Mapper',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      description: 'Traverses corporate ownership graphs, pledged promoter share linkages, and inter-company loans in Neo4j to flag systemic contagion before it affects sister stocks.'
    }
  ];

  return (
    <section id="solution" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="content-wrapper">
        
        {/* 15-Minute Survival Window Banner */}
        <div className="card bg-white border-2 border-blue-200 p-8 md:p-10 mb-16 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-600 text-white shrink-0 shadow-lg shadow-blue-500/30">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Core Innovation
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  The 15-Minute Survival Window
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base max-w-2xl">
                  By detecting early micro-structural breakdown before lower circuits freeze liquidity, CrashRadar gives retail investors an actionable 15-minute lead window to review transparent SHAP reasons and exit safely.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center shrink-0 w-full md:w-auto">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600">15 MIN</span>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Lead Time Advantage</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 py-1 px-3 rounded-md border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> Retail Capital Preserved
              </div>
            </div>
          </div>
        </div>

        {/* 3-Agent AI Architecture Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="badge badge-brand">Autonomous Multi-Agent System</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Powered by 3 Specialized AI Agents
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Instead of a single black-box model, CrashRadar deploys 3 collaborative intelligence agents orchestrated via LangGraph.
          </p>
        </div>

        {/* 3 Agents Cards */}
        <div className="grid-3">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <div key={idx} className="card card-interactive p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`p-3 rounded-xl ${agent.bgColor} ${agent.color}`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {agent.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{agent.name}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Engine Type</span>
                  <span className="text-slate-900 font-bold">Autonomous Agent</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
