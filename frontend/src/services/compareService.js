/**
 * COMPARE SERVICE (Mocked / Future Backend Integration)
 *
 * BACKEND TEAMMATE CONTRACT SPECIFICATION:
 * ----------------------------------------------------
 * When implementing a real backend endpoint for stock pair risk comparison:
 *
 * GET /api/v1/compare?stock1=RELIANCE&stock2=TCS
 * - Method: GET
 * - Query Params:
 *     stock1: string (e.g. "RELIANCE")
 *     stock2: string (e.g. "TCS")
 * - Response: JSON
 *   {
 *     stock1: { symbol: "RELIANCE", risk_score: 72, is_danger: true, reasons: [...] },
 *     stock2: { symbol: "TCS", risk_score: 28, is_danger: false, reasons: [...] },
 *     comparison: {
 *       riskDelta: 44,
 *       riskierStock: "RELIANCE",
 *       saferStock: "TCS",
 *       summaryText: "RELIANCE is 44 points riskier than TCS right now"
 *     }
 *   }
 */

import { predictStockCrash, WATCHLIST_STOCKS } from './api';

/**
 * Compare two stock symbols and return side-by-side risk telemetries & delta sentence
 */
export async function compareStocks(sym1, sym2) {
  const s1 = (sym1 || 'RELIANCE').toUpperCase();
  const s2 = (sym2 || 'TCS').toUpperCase();

  // Fetch or mock predictions for both stocks
  let data1, data2;
  try {
    data1 = await predictStockCrash(s1);
  } catch {
    const meta1 = WATCHLIST_STOCKS.find(s => s.symbol === s1) || { risk: 50, status: 'caution' };
    data1 = { symbol: s1, risk_score: meta1.risk, is_danger: meta1.status === 'danger', reasons: ['Order book depth imbalance detected.'] };
  }

  try {
    data2 = await predictStockCrash(s2);
  } catch {
    const meta2 = WATCHLIST_STOCKS.find(s => s.symbol === s2) || { risk: 30, status: 'safe' };
    data2 = { symbol: s2, risk_score: meta2.risk, is_danger: meta2.status === 'danger', reasons: ['Trading metrics within standard parameters.'] };
  }

  const delta = Math.abs(data1.risk_score - data2.risk_score);
  let summaryText = '';

  if (data1.risk_score > data2.risk_score) {
    summaryText = `${s1} is ${delta} points riskier than ${s2} right now`;
  } else if (data2.risk_score > data1.risk_score) {
    summaryText = `${s2} is ${delta} points riskier than ${s1} right now`;
  } else {
    summaryText = `${s1} and ${s2} currently share identical crash risk scores (${data1.risk_score}/100)`;
  }

  return {
    stock1: data1,
    stock2: data2,
    comparison: {
      riskDelta: delta,
      riskierStock: data1.risk_score >= data2.risk_score ? s1 : s2,
      saferStock: data1.risk_score < data2.risk_score ? s1 : s2,
      summaryText,
    },
    isSimulated: true, // Tag for UI
  };
}
