import React from 'react';
import { ShieldCheck, Eye, Zap, AlertTriangle, BellRing, Sparkles } from 'lucide-react';

export default function FeatureHighlights() {
  const highlights = [
    {
      icon: Zap,
      title: '15-Min Survival Window',
      description: 'Detect micro-structural breakdowns before price hits daily lower circuits, allowing clean exit execution.',
    },
    {
      icon: Eye,
      title: '100% SHAP Explainability',
      description: 'Every risk score comes with natural language reasons detailing exact feature impacts (e.g. order imbalance + sentiment drop).',
    },
    {
      icon: AlertTriangle,
      title: 'Contagion Graph Mapping',
      description: 'Cross-analyzes sister companies, supplier chains, and share pledge defaults using Neo4j graph algorithms.',
    },
    {
      icon: BellRing,
      title: 'Multi-Channel Push Alerts',
      description: 'Automated Twilio SMS and WhatsApp notifications when watched stocks cross the Caution or Danger threshold.',
    },
  ];

  return (
    <section className="py-12 bg-slate-100/60 border-b border-slate-200">
      <div className="content-wrapper">
        <div className="grid-4">
          {highlights.map((h, idx) => {
            const Icon = h.icon;
            return (
              <div key={idx} className="card p-5 bg-white space-y-2 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{h.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {h.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
