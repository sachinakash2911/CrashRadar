import React from 'react';
import { ShieldAlert, Zap, Cpu, Network, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';

export default function Hero({ onScrollToScanner }) {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30">
      <div className="content-wrapper">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs md:text-sm font-semibold shadow-xs">
            <Zap className="w-4 h-4 text-blue-600 fill-blue-600/20" />
            <span>Built for Retail Investors in India • 15-Minute Survival Window</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Protect Retail Wealth Before <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800">
              Lower Circuits Freeze Your Cash
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            CrashRadar is an explainable AI financial guardian. By synthesizing quantitative price anomalies, financial news sentiment, and parent-subsidiary contagion networks, we give retail traders the 15-minute window needed to exit safely.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onScrollToScanner}
              className="btn btn-primary btn-lg w-full sm:w-auto shadow-md"
            >
              <span>Scan Any Stock Risk Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <a 
              href="#problems" 
              className="btn btn-secondary btn-lg w-full sm:w-auto"
            >
              <span>How CrashRadar Works</span>
            </a>
          </div>

          {/* Feature Highlights Banner */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="card p-4 flex items-start gap-3 bg-white/80">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 font-semibold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">15-Min Lead</p>
                <p className="text-xs text-slate-500 font-medium">Early crash alert window</p>
              </div>
            </div>

            <div className="card p-4 flex items-start gap-3 bg-white/80">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-semibold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">3-Agent AI</p>
                <p className="text-xs text-slate-500 font-medium">Quant, News & Graph</p>
              </div>
            </div>

            <div className="card p-4 flex items-start gap-3 bg-white/80">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">SHAP Explainable</p>
                <p className="text-xs text-slate-500 font-medium">Zero black-box scores</p>
              </div>
            </div>

            <div className="card p-4 flex items-start gap-3 bg-white/80">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 font-semibold">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Contagion Map</p>
                <p className="text-xs text-slate-500 font-medium">Neo4j shadow tracking</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
