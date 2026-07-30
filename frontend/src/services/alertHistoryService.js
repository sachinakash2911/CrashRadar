/**
 * ALERT HISTORY SERVICE (Mocked / Future Backend Integration)
 *
 * BACKEND TEAMMATE CONTRACT SPECIFICATION:
 * ----------------------------------------------------
 * When implementing a real backend service for past crash alert logs:
 *
 * GET /api/v1/alerts/history?limit=20&symbol=RELIANCE&status=elevated
 * - Method: GET
 * - Query Params:
 *     limit: number (default 20)
 *     symbol: string optional (e.g. "RELIANCE")
 *     status: string optional ("resolved" | "elevated")
 * - Response: JSON
 *   {
 *     total: 14,
 *     alerts: [
 *       {
 *         id: "ALT-2026-089",
 *         symbol: "ADANIENT",
 *         timestamp: "2026-07-28 09:18 IST",
 *         risk_score: 84,
 *         primaryReason: "Unusual volume spike & promoter pledge exposure flagged by AI Agents",
 *         status: "Still elevated", // or "Resolved"
 *         leadTimeMinutes: 15
 *       },
 *       ...
 *     ]
 *   }
 */

const MOCK_ALERT_LOGS = [
  {
    id: 'ALT-101',
    symbol: 'ADANIENT',
    timestamp: 'Today, 09:18 IST',
    dateObj: new Date('2026-07-28T09:18:00'),
    risk_score: 84,
    primaryReason: 'Order book imbalance: 78% sell pressure & promoter pledge disclosure spike.',
    status: 'Still elevated',
    statusType: 'danger',
  },
  {
    id: 'ALT-102',
    symbol: 'RELIANCE',
    timestamp: 'Today, 09:45 IST',
    dateObj: new Date('2026-07-28T09:45:00'),
    risk_score: 72,
    primaryReason: 'Unusual block sell trades executed near key support level ₹2,920.',
    status: 'Still elevated',
    statusType: 'danger',
  },
  {
    id: 'ALT-103',
    symbol: 'HDFCBANK',
    timestamp: 'Yesterday, 14:10 IST',
    dateObj: new Date('2026-07-27T14:10:00'),
    risk_score: 58,
    primaryReason: 'FII sell-off following ADR discount; net interest margin compression chatter.',
    status: 'Resolved',
    statusType: 'safe',
  },
  {
    id: 'ALT-104',
    symbol: 'INFY',
    timestamp: '25 Jul 2026, 11:30 IST',
    dateObj: new Date('2026-07-25T11:30:00'),
    risk_score: 42,
    primaryReason: 'Mild volume anomaly flagged prior to Q1 revenue guidance release.',
    status: 'Resolved',
    statusType: 'safe',
  },
  {
    id: 'ALT-105',
    symbol: 'ADANIENT',
    timestamp: '22 Jul 2026, 10:05 IST',
    dateObj: new Date('2026-07-22T10:05:00'),
    risk_score: 89,
    primaryReason: 'Knowledge Graph mapped parent debt stress triggering lower circuit warning.',
    status: 'Resolved',
    statusType: 'safe',
  },
  {
    id: 'ALT-106',
    symbol: 'TCS',
    timestamp: '20 Jul 2026, 15:15 IST',
    dateObj: new Date('2026-07-20T15:15:00'),
    risk_score: 33,
    primaryReason: 'Short-term sector index rebalancing liquidity shift.',
    status: 'Resolved',
    statusType: 'safe',
  },
  {
    id: 'ALT-107',
    symbol: 'RELIANCE',
    timestamp: '18 Jul 2026, 09:50 IST',
    dateObj: new Date('2026-07-18T09:50:00'),
    risk_score: 78,
    primaryReason: 'Rapid order book depletion flagged 15 minutes before 5% lower band trigger.',
    status: 'Resolved',
    statusType: 'safe',
  },
  {
    id: 'ALT-108',
    symbol: 'HDFCBANK',
    timestamp: '15 Jul 2026, 13:22 IST',
    dateObj: new Date('2026-07-15T13:22:00'),
    risk_score: 64,
    primaryReason: 'NBFC credit contagion rumor causing brief inter-bank liquidity freeze.',
    status: 'Resolved',
    statusType: 'safe',
  },
  {
    id: 'ALT-109',
    symbol: 'ADANIENT',
    timestamp: '11 Jul 2026, 10:40 IST',
    dateObj: new Date('2026-07-11T10:40:00'),
    risk_score: 81,
    primaryReason: 'Adani group cross-holding pledge margin call alert triggered.',
    status: 'Resolved',
    statusType: 'safe',
  },
  {
    id: 'ALT-110',
    symbol: 'INFY',
    timestamp: '08 Jul 2026, 14:55 IST',
    dateObj: new Date('2026-07-08T14:55:00'),
    risk_score: 51,
    primaryReason: 'US tech sector selloff sentiment spillover during afternoon session.',
    status: 'Resolved',
    statusType: 'safe',
  },
];

/**
 * Fetch alert history logs (supports client-side symbol & status filter)
 */
export async function fetchAlertHistory(filterSymbol = 'ALL', filterStatus = 'ALL') {
  let filtered = [...MOCK_ALERT_LOGS];

  if (filterSymbol !== 'ALL') {
    filtered = filtered.filter(a => a.symbol === filterSymbol);
  }

  if (filterStatus !== 'ALL') {
    if (filterStatus === 'elevated') {
      filtered = filtered.filter(a => a.status === 'Still elevated');
    } else if (filterStatus === 'resolved') {
      filtered = filtered.filter(a => a.status === 'Resolved');
    }
  }

  return {
    total: filtered.length,
    alerts: filtered,
    isSimulated: true, // Tag for UI
  };
}
