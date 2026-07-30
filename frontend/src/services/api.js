/**
 * CrashRadar API Service
 *
 * Base URL: http://localhost:8000
 *
 * Actual backend response for GET /predict/{stock}:
 * {
 *   stock, final_risk_score, risk_level, is_danger, final_verdict,
 *   agent1: { risk_score, is_danger, shap_reasons, plain_english, historical_context, live_market, model_input },
 *   agent2: { sentiment, score, articles, risk_boost, risk_reduction, conclusion },
 *   agent3: { contagion_score, contagion_risk, sector, parent_company, affected_companies, conclusion },
 *   score_breakdown: { agent1_contribution, news_contribution, contagion_contribution, formula }
 * }
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetch full AI crash prediction for a stock symbol.
 * Returns the full backend payload — do not strip fields here.
 */
export async function predictStockCrash(symbol) {
  const s = symbol.trim().toUpperCase();
  if (!s) throw new Error('Please enter a valid stock symbol.');

  const response = await fetch(`${API_BASE_URL}/predict/${s}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail?.detail || `Server returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Normalise top-level fields and attach convenience aliases
  return {
    // Identity
    symbol: data.stock || s,

    // Top-level scores — use CORRECT backend field names
    final_risk_score: data.final_risk_score ?? 0,
    risk_score: data.final_risk_score ?? 0,          // alias kept for legacy components
    risk_level: data.risk_level ?? 'LOW',
    is_danger: Boolean(data.is_danger),
    final_verdict: data.final_verdict ?? '',

    // Agent sub-objects — pass through exactly as backend returns them
    agent1: data.agent1 ?? {},
    agent2: data.agent2 ?? {},
    agent3: data.agent3 ?? {},
    score_breakdown: data.score_breakdown ?? {},

    // Convenience alias: "reasons" = agent1.shap_reasons (legacy components use this)
    reasons: Array.isArray(data.agent1?.shap_reasons) ? data.agent1.shap_reasons : [],

    // Metadata
    scannedAt: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
  };
}

/**
 * Fetch risk scores for all 24 watchlist stocks in bulk via /watchlist.
 * Returns { stocks: [...], succeeded, failed } — each stock has the full predict shape.
 * NOTE: This endpoint can take 30+ seconds as it runs all agents for every stock.
 */
export async function fetchWatchlistScores() {
  const response = await fetch(`${API_BASE_URL}/watchlist`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Watchlist fetch failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch live intraday signal for a stock via /live/{stock}.
 * Returns { alert_level, price_change_pct, volume_ratio, as_of, last_price, ... }
 */
export async function fetchLiveSignal(symbol) {
  const s = symbol.trim().toUpperCase();
  const response = await fetch(`${API_BASE_URL}/live/${s}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Live signal fetch failed for ${s}: ${response.status}`);
  }

  return response.json();
}

/**
 * Mock historical price data — no real backend endpoint exists for this.
 * Returns array of { date, price, Crash_Signal, volume, change }
 * Replace when backend exposes GET /history/{stock}.
 */
export async function fetchPriceHistory(symbol) {
  const s = symbol.trim().toUpperCase();

  // Realistic base prices per stock
  const basePrices = {
    RELIANCE: 2950, TCS: 3820, INFY: 1640, HDFCBANK: 1610, ADANIENT: 3120,
    WIPRO: 540, TITAN: 3450, SBIN: 820, ICICIBANK: 1320, KOTAKBANK: 1890,
    AXISBANK: 1180, BAJFINANCE: 7200, HINDUNILVR: 2620, MARUTI: 12500,
    LT: 3680, NTPC: 375, ONGC: 295, POWERGRID: 355, SUNPHARMA: 1820,
    HCLTECH: 1720, ITC: 480, ULTRACEMCO: 11800, BHARTIARTL: 1650, ASIANPAINT: 2580,
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

/**
 * All 24 supported NSE stocks — metadata only (name, sector).
 * Prices and risk scores are NOT hardcoded here; they come from the backend.
 * This array is used for UI navigation chips, portfolio search, etc.
 */
export const WATCHLIST_STOCKS = [
  { symbol: 'RELIANCE',    name: 'Reliance Industries Ltd.',      sector: 'Energy & Retail'       },
  { symbol: 'TCS',         name: 'Tata Consultancy Services',     sector: 'IT Services'           },
  { symbol: 'INFY',        name: 'Infosys Limited',               sector: 'IT Services'           },
  { symbol: 'HDFCBANK',    name: 'HDFC Bank Ltd.',                sector: 'Banking & Financials'  },
  { symbol: 'ADANIENT',    name: 'Adani Enterprises Ltd.',        sector: 'Infrastructure'        },
  { symbol: 'WIPRO',       name: 'Wipro Limited',                 sector: 'IT Services'           },
  { symbol: 'TITAN',       name: 'Titan Company Ltd.',            sector: 'Consumer Goods'        },
  { symbol: 'SBIN',        name: 'State Bank of India',           sector: 'Banking & Financials'  },
  { symbol: 'ICICIBANK',   name: 'ICICI Bank Ltd.',               sector: 'Banking & Financials'  },
  { symbol: 'KOTAKBANK',   name: 'Kotak Mahindra Bank Ltd.',      sector: 'Banking & Financials'  },
  { symbol: 'AXISBANK',    name: 'Axis Bank Ltd.',                sector: 'Banking & Financials'  },
  { symbol: 'BAJFINANCE',  name: 'Bajaj Finance Ltd.',            sector: 'NBFC & Financials'     },
  { symbol: 'HINDUNILVR',  name: 'Hindustan Unilever Ltd.',       sector: 'FMCG'                  },
  { symbol: 'MARUTI',      name: 'Maruti Suzuki India Ltd.',      sector: 'Automobile'            },
  { symbol: 'LT',          name: 'Larsen & Toubro Ltd.',          sector: 'Infrastructure'        },
  { symbol: 'NTPC',        name: 'NTPC Ltd.',                     sector: 'Power & Energy'        },
  { symbol: 'ONGC',        name: 'Oil & Natural Gas Corp.',       sector: 'Energy & Oil'          },
  { symbol: 'POWERGRID',   name: 'Power Grid Corp. of India',     sector: 'Power & Energy'        },
  { symbol: 'SUNPHARMA',   name: 'Sun Pharmaceutical Ind.',       sector: 'Pharma & Healthcare'   },
  { symbol: 'HCLTECH',     name: 'HCL Technologies Ltd.',         sector: 'IT Services'           },
  { symbol: 'ITC',         name: 'ITC Limited',                   sector: 'FMCG'                  },
  { symbol: 'ULTRACEMCO',  name: 'UltraTech Cement Ltd.',         sector: 'Cement & Construction' },
  { symbol: 'BHARTIARTL',  name: 'Bharti Airtel Ltd.',            sector: 'Telecom'               },
  { symbol: 'ASIANPAINT',  name: 'Asian Paints Ltd.',             sector: 'Consumer Goods'        },
];
