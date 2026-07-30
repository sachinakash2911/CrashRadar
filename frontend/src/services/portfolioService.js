/**
 * PORTFOLIO SERVICE — Live Backend Integration
 *
 * Calls /predict/{stock} for each holding to get real risk scores.
 * Falls back gracefully if the backend is unavailable for a particular stock.
 */

import { predictStockCrash, WATCHLIST_STOCKS } from './api';

const DEFAULT_PORTFOLIO_SYMBOLS = ['RELIANCE', 'ADANIENT', 'TCS'];

/**
 * Fetch portfolio holdings risk analysis.
 * Makes real parallel /predict/ calls for each symbol.
 * @param {string[]} symbols - Array of stock ticker strings
 */
export async function fetchPortfolioAnalysis(symbols = DEFAULT_PORTFOLIO_SYMBOLS) {
  // Fetch all in parallel, with individual error handling
  const results = await Promise.all(
    symbols.map(async (sym) => {
      const meta = WATCHLIST_STOCKS.find(s => s.symbol === sym) || {
        symbol: sym,
        name: `${sym} Ltd.`,
        sector: 'NSE Equity',
      };

      try {
        const data = await predictStockCrash(sym);
        const riskScore = data.final_risk_score ?? 0;
        const level = data.risk_level?.toUpperCase() ?? 'LOW';
        const status =
          level === 'HIGH' || level === 'ELEVATED' ? 'danger' :
          level === 'MODERATE' ? 'caution' : 'safe';

        return {
          symbol: sym,
          name: meta.name,
          sector: meta.sector,
          risk_score: riskScore,
          is_danger: data.is_danger ?? false,
          status,
          final_verdict: data.final_verdict ?? '',
          error: null,
        };
      } catch {
        // Graceful degradation — show the stock card with unknown status
        return {
          symbol: sym,
          name: meta.name,
          sector: meta.sector,
          risk_score: null,
          is_danger: false,
          status: 'unknown',
          final_verdict: 'Unable to fetch risk data — backend may be unavailable.',
          error: true,
        };
      }
    })
  );

  const valid = results.filter(h => h.risk_score !== null);
  const safeCount    = results.filter(h => h.status === 'safe').length;
  const cautionCount = results.filter(h => h.status === 'caution').length;
  const dangerCount  = results.filter(h => h.status === 'danger').length;

  const total = results.length;
  const overallRiskScore = valid.length > 0
    ? Math.round(valid.reduce((sum, h) => sum + h.risk_score, 0) / valid.length)
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
    holdings: results,
    isSimulated: false, // Now using real backend data
  };
}
