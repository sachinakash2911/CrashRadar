/**
 * WHATSAPP PREVIEW SERVICE (Mocked / Future Backend Integration)
 *
 * BACKEND TEAMMATE CONTRACT SPECIFICATION:
 * ----------------------------------------------------
 * When integrating real Twilio / WhatsApp Voice Alert notification service:
 *
 * POST /api/v1/alerts/whatsapp/preview
 * - Method: POST
 * - Request Body: JSON
 *   {
 *     symbol: "RELIANCE",
 *     riskScore: 72,
 *     reasons: [ "Unusual block sell trades executed..." ],
 *     language: "en" | "hi" | "ta"
 *   }
 * - Response: JSON
 *   {
 *     phoneNumberMasked: "+91 98*** ***89",
 *     messageText: "⚠️ CrashRadar Alert: High risk detected for RELIANCE (72/100). 15-minute survival window active. Reasons: ...",
 *     audioUrl: "https://api.crashradar.in/voice/alert-rel-102.mp3",
 *     deliveredAt: "09:45 AM"
 *   }
 */

/**
 * Format automated WhatsApp voice note & transcript preview for a given stock
 */
export function generateWhatsAppPreview(symbol, riskScore, reasons = [], isDanger = false) {
  const sym = (symbol || 'RELIANCE').toUpperCase();
  const score = riskScore || (isDanger ? 78 : 45);
  const primaryReason = reasons[0] || 'Unusual order book depth imbalance & volume anomaly detected.';

  const messageText = `⚠️ *CrashRadar AI Alert — ${sym}*
Risk Score: *${score}/100* (${isDanger ? 'DANGER ZONE' : 'CAUTION'})

🚨 *Actionable Warning:*
A 15-minute survival window is currently active before lower circuit price bands freeze trading.

🔍 *Primary AI Reason:*
${primaryReason}

🎙️ *Voice Transcript:* "Attention investor, CrashRadar AI detects elevated lower circuit risk for ${sym}. Review your open positions immediately."`;

  return {
    recipientMasked: '+91 98765 *****',
    senderName: 'CrashRadar Financial Guardian',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    messageText,
    audioDuration: '0:14',
    isSimulated: true, // Tag for UI
  };
}
