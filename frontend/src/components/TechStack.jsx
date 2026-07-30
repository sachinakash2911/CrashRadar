import React from 'react';
import { Code2, Server, Brain, BarChart3, Database, MessageSquare, Workflow, Cpu, Layers } from 'lucide-react';

export default function TechStack() {
  const stack = [
    { name: 'React', category: 'Frontend', icon: Code2, desc: 'Responsive light fintech dashboard & Recharts data visualization', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'FastAPI', category: 'Backend API', icon: Server, desc: 'High-performance asynchronous Python REST server for real-time predictions', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'XGBoost', category: 'Machine Learning', icon: Brain, desc: 'Gradient boosted decision trees trained on intraday price & volume features', color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'SHAP', category: 'Explainability', icon: BarChart3, desc: 'Shapley Additive exPlanations for transparent human-readable risk drivers', color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Neo4j', category: 'Graph Database', icon: Layers, desc: 'Knowledge graph storing corporate ownership, share pledges & contagion links', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'PostgreSQL', category: 'Relational DB', icon: Database, desc: 'Transactional store for tick data, scan histories, and audit logging', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'spaCy', category: 'NLP Engine', icon: Cpu, desc: 'Natural language processing for news sentiment extraction & regulatory filing analysis', color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'LangGraph', category: 'Agent Orchestration', icon: Workflow, desc: 'Multi-agent state machine coordinating Quant, News & Graph agents', color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Twilio', category: 'Emergency Alerts', icon: MessageSquare, desc: 'Instant SMS & WhatsApp alert triggers when risk score crosses danger threshold', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <section id="techstack" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="content-wrapper">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="badge badge-brand">Production Stack</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Institutional-Grade Technology Stack
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Built using modern machine learning, graph database, and multi-agent AI frameworks.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid-3">
          {stack.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="card p-5 flex items-start gap-4 hover:border-blue-300 transition-all">
                <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
