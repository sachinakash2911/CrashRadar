import React from 'react';
import { Lock, Gauge, Network, HelpCircle } from 'lucide-react';

export default function ProblemStatement() {
  const problems = [
    {
      icon: Lock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: '1. The Liquidity Death-Trap',
      highlight: 'Lower Circuits Freeze Retail Capital',
      description: 'When bad news hits, stock prices plunge into lower circuits (5%, 10%, 20% limit bands). Buy orders drop to zero instantly, trapping retail investors while institutional sell orders get executed first.'
    },
    {
      icon: Gauge,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      title: '2. The Speed Gap',
      highlight: 'Milliseconds vs. Delayed Retail News',
      description: 'HFT desks and institutional algorithms detect order-book imbalances and exit positions in milliseconds. Retail investors only discover the crash hours later through TV broadcasts or Twitter panics.'
    },
    {
      icon: Network,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      title: '3. The Shadow Network',
      highlight: 'Cross-Holding & Contagion Blindspots',
      description: 'A crisis in a parent entity or sister firm spills over into subsidiary stocks through pledged shares and credit linkages. Retail investors rarely hold complex ownership graphs to spot this domino effect.'
    },
    {
      icon: HelpCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      title: '4. The Logic Deficit',
      highlight: 'Black-Box AI Scores Nobody Trusts',
      description: 'Existing fintech tools provide vague risk ratings (e.g. "Risk Level 7") without explaining why. Without clear feature attributions (like SHAP reasons), investors dismiss alerts as false alarms until it is too late.'
    }
  ];

  return (
    <section id="problems" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="content-wrapper">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="badge badge-brand">Retail Market Vulnerabilities</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Why Indian Retail Investors Lose Capital in Market Crashes
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Traditional retail dashboards fail during extreme market volatility due to four structural systemic bottlenecks.
          </p>
        </div>

        {/* 4 Problems Grid */}
        <div className="grid-2">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className={`card card-interactive p-6 md:p-8 flex flex-col justify-between border ${p.borderColor}`}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${p.bgColor} ${p.color} border ${p.borderColor}`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{p.highlight}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Impacted Market: NSE & BSE Retail Traders</span>
                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-bold">HIGH RISK</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
