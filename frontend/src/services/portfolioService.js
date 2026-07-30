/**
 * PORTFOLIO SERVICE (Mocked / Future Backend Integration)
 *
 * BACKEND TEAMMATE CONTRACT SPECIFICATION:
 * ----------------------------------------------------
 * When implementing a real backend service for user portfolio risk calculation:
 *
 * 1. GET /api/v1/portfolio
 *    - Method: GET
 *    - Headers: Authorization: Bearer <token>
 *    - Response: JSON array of user's saved holdings
 *      [ { symbol: "RELIANCE", qty: 50, avgPrice: 2850 }, { symbol: "TCS", qty: 20, avgPrice: 3800 } ]
 *
 * 2. POST /api/v1/portfolio/analyze
 *    - Method: POST
 *    - Request Body: JSON { holdings: [ "RELIANCE", "ADANIENT", "TCS" ] }
 *    - Response: JSON
 *      {
 *        totalHoldings: 3,
 *        summary: { safeCount: 1, cautionCount: 0, dangerCount: 2 },
 *        overallRiskScore: 68,
 *        holdings: [
 *          { symbol: "RELIANCE", risk_score: 72, is_danger: true, status: "danger" },
 *          { symbol: "ADANIENT", risk_score: 84, is_danger: true, status: "danger" },
 *          { symbol: "TCS", risk_score: 28, is_danger: false, status: "safe" }
 *        ]
 *      }
 */

import { WATCHLIST_STOCKS } from './api';

// Initial default portfolio symbols for demonstration
const DEFAULT_PORTFOLIO_SYMBOLS = ['RELIANCE', 'ADANIENT', 'TCS'];

/**
 * Fetch portfolio holdings risk analysis (Simulated client-side calculations)
 */
export async function fetchPortfolioAnalysis(symbols = DEFAULT_PORTFOLIO_SYMBOLS) {
  // Map provided symbols against known watchlist metadata and risk scores
  const holdings = symbols.map(sym => {
    const meta = WATCHLIST_STOCKS.find(s => s.symbol === sym) || {
      symbol: sym,
      name: `${sym} Ltd.`,
      sector: 'NSE Equity',
      price: '₹1,500',
      change: '0.0%',
      risk: 50,
      status: 'caution',
    };

    return {
      symbol: meta.symbol,
      name: meta.name,
      sector: meta.sector,
      price: meta.price,
      change: meta.change,
      risk_score: meta.risk,
      is_danger: meta.status === 'danger',
      status: meta.status,
    };
  });

  const safeCount = holdings.filter(h => h.status === 'safe').length;
  const cautionCount = holdings.filter(h => h.status === 'caution').length;
  const dangerCount = holdings.filter(h => h.status === 'danger').length;

  const total = holdings.length;
  const overallRiskScore = total > 0
    ? Math.round(holdings.reduce((sum, h) => sum + h.risk_score, 0) / total)
    : 0;

  return {
    totalHoldings: total,
    summary: {
      safeCount,
      cautionCount,
      dangerCount,
      elevatedCount: cautionCount + dangerCount,
    },
    overallRiskScore,
    holdings,
    isSimulated: true, // Tag for UI
  };
}
