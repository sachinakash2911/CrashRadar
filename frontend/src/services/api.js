/**
 * CrashRadar API Service
 *
 * ASSUMPTIONS ABOUT BACKEND RESPONSE:
 * - Base URL: http://localhost:8000
 * - Endpoint: GET /predict/{stock}
 * - Response payload:
 *   {
 *     risk_score: number,   // 0–100
 *     is_danger: boolean,   // true if high crash probability
 *     reasons: string[]     // list of SHAP-style explanatory factors
 *   }
 * - Supported symbols: RELIANCE, TCS, INFY, HDFCBANK, ADANIENT (+ any custom)
 * - No dedicated price-history endpoint exists yet. fetchPriceHistory() uses
 *   realistic synthetic data. Swap the implementation below when backend adds
 *   GET /history/{stock}.
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetch AI crash prediction for a stock symbol.
 */
export async function predictStockCrash(symbol) {
  const s = symbol.trim().toUpperCase();
  if (!s) throw new Error('Please enter a valid stock symbol.');

  const response = await fetch(`${API_BASE_URL}/predict/${s}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    symbol: s,
    risk_score: data.risk_score ?? 0,
    is_danger: Boolean(data.is_danger),
    reasons: Array.isArray(data.reasons) ? data.reasons : [],
    scannedAt: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
  };
}

/**
 * Mock historical price data. Replace with real API call when backend
 * exposes GET /history/{stock}.
 * Returns array of { date, price, Crash_Signal, volume, change }
 */
export async function fetchPriceHistory(symbol) {
  const s = symbol.trim().toUpperCase();

  const basePrices = {
    RELIANCE: 2950, TCS: 3820, INFY: 1640,
    HDFCBANK: 1610, ADANIENT: 3120,
  };

  const start = basePrices[s] || 1500;
  const history = [];
  let price = start;
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    const drift = (Math.random() - 0.48) * 0.025;
    price = Math.round(price * (1 + drift) * 100) / 100;

    const signal = i === 4 || i === 15 || i === 25;
    const dayPrice = signal ? Math.round(price * 0.965 * 100) / 100 : price;

    history.push({
      date: dateStr,
      price: dayPrice,
      Crash_Signal: signal,
      volume: `${(Math.random() * 4 + 1.2).toFixed(1)}M`,
      change: signal ? '-3.5%' : `${(drift * 100).toFixed(2)}%`,
    });
  }

  return history;
}

/** Stock metadata used across the app */
export const WATCHLIST_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Retail',     price: '₹2,948', change: '-1.2%', risk: 72, status: 'danger',  marketCap: '₹19.97L Cr', pe: 28.4, volume: '8.2M',  high52: '₹3,217', low52: '₹2,220' },
  { symbol: 'TCS',      name: 'Tata Consultancy Services', sector: 'IT Services',         price: '₹3,820', change: '+0.4%', risk: 28, status: 'safe',    marketCap: '₹13.85L Cr', pe: 32.1, volume: '3.1M',  high52: '₹4,592', low52: '₹3,311' },
  { symbol: 'INFY',     name: 'Infosys Limited',           sector: 'IT Services',         price: '₹1,640', change: '+0.2%', risk: 33, status: 'safe',    marketCap: '₹6.82L Cr',  pe: 25.6, volume: '5.4M',  high52: '₹1,975', low52: '₹1,358' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.',             sector: 'Banking & Financials',price: '₹1,610', change: '-0.8%', risk: 58, status: 'caution', marketCap: '₹12.27L Cr', pe: 19.8, volume: '6.7M',  high52: '₹1,880', low52: '₹1,431' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.',     sector: 'Infrastructure',      price: '₹3,120', change: '-2.1%', risk: 84, status: 'danger',  marketCap: '₹3.55L Cr',  pe: 87.2, volume: '2.8M',  high52: '₹3,743', low52: '₹1,900' },
];
