import React, { useState, useEffect } from 'react';
import { Search, Sparkles, AlertCircle, RefreshCw, LineChart, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { predictStockCrash, WATCHLIST_STOCKS } from '../services/api';
import RiskGauge from './RiskGauge';
import ReasonCards from './ReasonCards';

export default function StockScanner({ onOpenChart }) {
  const [inputSymbol, setInputSymbol] = useState('RELIANCE');
  const [activeSymbol, setActiveSymbol] = useState('RELIANCE');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Perform scanner lookup
  const handleScan = async (symbolToScan) => {
    const targetSymbol = (symbolToScan || inputSymbol).trim().toUpperCase();
    if (!targetSymbol) return;

    setActiveSymbol(targetSymbol);
    setInputSymbol(targetSymbol);
    setLoading(true);
    setError(null);

    try {
      const data = await predictStockCrash(targetSymbol);
      setResult(data);
    } catch (err) {
      console.warn(`[CrashRadar] Backend request failed for ${targetSymbol}.`, err);
      setError({
        message: err.message || 'Could not connect to FastAPI server.',
        symbol: targetSymbol,
      });
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial scan on mount
  useEffect(() => {
    handleScan('RELIANCE');
  }, []);

  return (
    <section id="scanner" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="content-wrapper">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <span className="badge badge-brand">Real-Time Risk Scanner</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Stock Crash Telemetry & Anomaly Detector
          </h2>
          <p className="text-slate-600 text-base">
            Select a watchlist stock or type any ticker to analyze crash risk scores and SHAP feature drivers.
          </p>
        </div>

        {/* Scanner Card */}
        <div className="max-w-4xl mx-auto">
          <div className="card p-6 md:p-8 bg-white border border-slate-200 shadow-md mb-8">
            
            {/* Search Bar Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleScan(inputSymbol);
              }}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={inputSymbol}
                  onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter Stock Symbol (e.g. RELIANCE, TCS, INFY)"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-base placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg flex items-center justify-center gap-2 shrink-0 shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Run AI Scan</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Watchlist Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Quick Watchlist</span>
                <span>5 Major Indian Stocks</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {WATCHLIST_STOCKS.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleScan(item.symbol)}
                    className={`chip ${activeSymbol === item.symbol ? 'active' : ''}`}
                  >
                    <span>{item.symbol}</span>
                    <span className="text-[10px] opacity-75 hidden sm:inline">({item.sector})</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Results State */}
          {loading && (
            <div className="card p-12 bg-white text-center space-y-4 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Evaluating Micro-Structural Risk Telemetry...</h3>
                <p className="text-xs text-slate-500 mt-1">Calling http://localhost:8000/predict/{activeSymbol}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="card p-6 bg-red-50/70 border border-red-200 text-slate-800 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 text-red-700 shrink-0">
                  <AlertCircle className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-red-900">
                    Backend Connection Issue for {error.symbol}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    CrashRadar frontend expects FastAPI server running at <code className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-bold">http://localhost:8000/predict/{error.symbol}</code>.
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-2">
                    Message: {error.message}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-red-200/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Ensure Python backend is running locally.</span>
                <button
                  onClick={() => handleScan(error.symbol)}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5 bg-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Result Card */}
          {result && !loading && (
            <div className="card p-6 md:p-8 bg-white border border-slate-200 shadow-lg space-y-8 animate-fade-in">
              
              {/* Header Info Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {result.symbol}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      NSE Listed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Last AI Risk Telemetry Scan: <span className="font-semibold text-slate-700">{result.scannedAt}</span>
                  </p>
                </div>

                <button
                  onClick={() => onOpenChart(result.symbol)}
                  className="btn btn-secondary btn-sm flex items-center gap-2 border-blue-200 hover:border-blue-400 text-blue-700 font-bold"
                >
                  <LineChart className="w-4 h-4 text-blue-600" />
                  <span>View Stock Price & Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left Col: Risk Gauge */}
                <div className="md:col-span-5 flex flex-col items-center justify-center space-y-4">
                  <RiskGauge score={result.risk_score} isDanger={result.is_danger} />

                  <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-center">
                    <p className="font-bold text-slate-700">15-Minute Survival Lead Window</p>
                    <p className="text-slate-500">
                      {result.is_danger ? '⚡ High crash risk detected. Order flow indicates impending circuit limit.' : '✅ Market structure normal. No lower circuit freeze risk.'}
                    </p>
                  </div>
                </div>

                {/* Right Col: SHAP Reasons */}
                <div className="md:col-span-7 space-y-4">
                  <ReasonCards reasons={result.reasons} />
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
