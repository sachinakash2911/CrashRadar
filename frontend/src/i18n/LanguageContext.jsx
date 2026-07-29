import React, { createContext, useContext, useState } from 'react';

export const translations = {
  en: {
    // Brand & Header
    brandTitle: 'CrashRadar',
    brandSub: 'AI Market Intelligence',
    marketOpen: 'Market Open',
    
    // Navbar
    navHome: 'Market Overview',
    navScanner: 'Risk Scanner',
    navPortfolio: 'My Portfolio',
    navCompare: 'Compare View',
    navContagion: 'Contagion Map',
    scanBtn: 'Scan Stock Risk',

    // Hero Section
    heroBadge: 'AI-POWERED CRASH PREDICTION · INDIA EQUITIES',
    heroTitle: 'Every Crash Leaves Clues.',
    heroSub: 'Can you spot them before it\'s too late?',
    scanRiskBtn: 'Scan Stock Risk',
    viewContagionBtn: 'View Contagion Map',

    // Home Stats
    statStocksWatch: 'Stocks Under Watch',
    statAlertsToday: 'High-Risk Alerts Today',
    statProtected: 'Investors Protected',
    statLeadTime: 'Avg. Lead Time',

    // Home Innovation Section
    coreInnovation: 'Core Innovation',
    survivalTitle: 'The 15-Minute Survival Window',
    survivalSub: "When institutional algorithms begin unwinding positions, CrashRadar's AI detects the micro-structural breakdown 15 minutes before lower circuits activate.",
    feature1: 'Early detection of order-book liquidity collapse',
    feature2: 'Explainable AI reasons — not just a score',
    feature3: 'Parent-subsidiary contagion mapped in real time',
    feature4: 'Multi-channel alerts before circuits trigger',

    // CTA Panel
    ctaTitle: 'Ready to Protect Your Portfolio?',
    ctaSub: 'Scan any NSE/BSE listed stock and get an AI risk score with transparent explanations in seconds.',
    startScanBtn: 'Start Free Risk Scan',

    // Scanner Page
    scannerLabel: 'AI Risk Intelligence',
    scannerTitle: 'Stock Crash Risk Scanner',
    scannerSub: 'Enter any NSE-listed stock symbol to receive an AI-generated risk score with transparent explanations.',
    searchPlaceholder: 'Enter stock symbol (e.g. RELIANCE, TCS, INFY…)',
    runScanBtn: 'Run Scan',
    quickWatchlist: 'Quick Watchlist — NSE F&O Stocks',
    analyzing: 'Evaluating Risk Telemetry…',
    priceChartBtn: 'Price Chart',
    viewStockDetailsBtn: 'View Stock Details',

    // Portfolio Page
    portfolioTitle: 'My Investment Portfolio',
    portfolioSub: 'Track custom stock holdings and monitor combined crash risk exposure.',
    addStock: 'Add Stock to Portfolio',
    removeStock: 'Remove',
    holdingsSummary: 'Holdings Risk Exposure Summary',
    safeHoldings: 'Safe Holdings',
    cautionHoldings: 'Caution Holdings',
    dangerHoldings: 'Danger Holdings',
    emptyPortfolio: 'Your portfolio is currently empty. Add stocks from the watchlist above!',

    // Compare Page
    compareTitle: 'Stock Risk Comparison',
    compareSub: 'Select any two NSE equities to compare their AI crash risk gauges and key metrics side-by-side.',
    selectStock1: 'Select First Stock',
    selectStock2: 'Select Second Stock',
    compareDelta: 'Risk Differential',

    // Alert History Page
    alertHistoryTitle: 'Historical Crash Alert Log',
    alertHistorySub: 'Chronological timeline of past flagged crash-risk events across monitored NSE equities.',
    filterAll: 'All Stocks',
    filterStatus: 'All Statuses',
    colTimestamp: 'Timestamp',
    colStock: 'Stock',
    colRiskScore: 'Risk Score',
    colReason: 'Primary AI Factor',
    colStatus: 'Status',
    colAction: 'Action',

    // Contagion Page
    contagionLabel: 'Network Risk Intelligence',
    contagionTitle: 'Contagion Map & Sector Heatmap',
    contagionSub: 'Visualize how ownership structures, pledged shares, and credit linkages create cascading crash risk across related companies.',
    contagionAlertTitle: 'Active Contagion Alert:',
    contagionAlertText: 'ADANIENT and affiliated entities show elevated cross-holding risk. Promoter pledge levels in 4 group companies exceed 65%.',
    howContagionWorks: 'How Contagion Risk Spreads',

    // Stock Detail Page
    backOverview: 'Back to Market Overview',
    todayChange: 'today',
    priceMovement30d: '30-Day Price Movement',
    hoverChartHint: 'Hover chart for price & date details',
    keyMetrics: 'Key Metrics',
    marketCap: 'Market Cap',
    peRatio: 'P/E Ratio',
    volume: 'Volume',
    high52: '52W High',
    low52: '52W Low',
    aiRiskScore: 'AI Risk Score',
    highCrashRiskTitle: 'High Crash Risk Detected',
    highCrashRiskDesc: 'CrashRadar AI signals elevated lower-circuit risk. Use the 15-min timer on the home page to act.',
    aiRiskFactors: 'AI Risk Factors',

    // Common Tags & Footers
    simulatedTag: 'Simulated Data',
    sampleTag: 'Sample Data',
    viewDetails: 'View Details',
    footerDesc: "India's first explainable AI stock crash prediction platform for retail investors.",
    footerRights: 'All rights reserved.',
  },

  hi: {
    // Brand & Header
    brandTitle: 'क्रैशराडार',
    brandSub: 'एआई मार्केट इंटेलिजेंस',
    marketOpen: 'बाजार खुला है',
    
    // Navbar
    navHome: 'बाजार अवलोकन',
    navScanner: 'जोखिम स्कैनर',
    navPortfolio: 'मेरा पोर्टफोलियो',
    navCompare: 'तुलना दृश्य',
    navContagion: 'संक्रमण मानचित्र',
    scanBtn: 'जोखिम स्कैन करें',

    // Hero Section
    heroBadge: 'एआई क्रैश भविष्यवाणी · भारत इक्विटी',
    heroTitle: 'हर क्रैश में संकेत छुपे होते हैं।',
    heroSub: 'क्या आप उन्हें बहुत देर होने से पहले पहचान सकते हैं?',
    scanRiskBtn: 'जोखिम स्कैन करें',
    howItProtectsBtn: 'यह कैसे सुरक्षा करता है',
    viewContagionBtn: 'संक्रमण मानचित्र देखें',

    // Home Stats
    statStocksWatch: 'निगरानी में स्टॉक',
    statAlertsToday: 'आज के उच्च-जोखिम अलर्ट',
    statProtected: 'सुरक्षित निवेशक',
    statLeadTime: 'औसत लीड टाइम',

    // Home Innovation Section
    coreInnovation: 'मुख्य नवाचार',
    survivalTitle: '15-मिनट का उत्तरजीविता विंडो',
    survivalSub: 'जब संस्थागत एल्गोरिदम पोजीशन अनवाइंड करना शुरू करते हैं, तो क्रैशराडार का एआई लोअर सर्किट सक्रिय होने से 15 मिनट पहले विफलता का पता लगाता है।',
    feature1: 'ऑर्डर-बुक तरलता पतन का शीघ्र पता लगाना',
    feature2: 'स्पष्टीकरण-योग्य एआई कारण — केवल एक स्कोर नहीं',
    feature3: 'वास्तविक समय में मूल-सहायक कंपनी संक्रमण का नक्शा',
    feature4: 'सर्किट ट्रिगर होने से पहले बहु-चैनल अलर्ट',

    // CTA Panel
    ctaTitle: 'अपने पोर्टफोलियो की सुरक्षा के लिए तैयार हैं?',
    ctaSub: 'किसी भी एनएसई/बीएसई सूचीबद्ध स्टॉक को स्कैन करें और सेकंडों में पारदर्शी स्पष्टीकरण के साथ एआई जोखिम स्कोर प्राप्त करें।',
    startScanBtn: 'मुफ्त जोखिम स्कैन शुरू करें',

    // Scanner Page
    scannerLabel: 'एआई जोखिम खुफिया',
    scannerTitle: 'स्टॉक क्रैश जोखिम स्कैनर',
    scannerSub: 'पारदर्शी स्पष्टीकरण के साथ एआई-जनरेटेड जोखिम स्कोर प्राप्त करने के लिए कोई भी एनएसई-सूचीबद्ध स्टॉक सिंबल दर्ज करें।',
    searchPlaceholder: 'स्टॉक सिंबल दर्ज करें (उदा. RELIANCE, TCS, INFY…)',
    runScanBtn: 'स्कैन चलाएं',
    quickWatchlist: 'त्वरित वॉचलिस्ट — एनएसई एफएंडओ स्टॉक',
    analyzing: 'जोखिम टेलीमेट्री का मूल्यांकन किया जा रहा है…',
    priceChartBtn: 'मूल्य चार्ट',
    viewStockDetailsBtn: 'स्टॉक विवरण देखें',

    // Portfolio Page
    portfolioTitle: 'मेरा निवेश पोर्टफोलियो',
    portfolioSub: 'कस्टम स्टॉक होल्डिंग्स को ट्रैक करें और संयुक्त क्रैश जोखिम जोखिम की निगरानी करें।',
    addStock: 'पोर्टफोलियो में स्टॉक जोड़ें',
    removeStock: 'हटाएं',
    holdingsSummary: 'होल्डिंग्स जोखिम एक्सपोजर सारांश',
    safeHoldings: 'सुरक्षित होल्डिंग्स',
    cautionHoldings: 'सावधानी होल्डिंग्स',
    dangerHoldings: 'खतरा होल्डिंग्स',
    emptyPortfolio: 'आपका पोर्टफोलियो वर्तमान में खाली है। ऊपर दी गई वॉचलिस्ट से स्टॉक जोड़ें!',

    // Compare Page
    compareTitle: 'स्टॉक जोखिम तुलना',
    compareSub: 'उनके एआई क्रैश जोखिम गेज और प्रमुख मेट्रिक्स की साथ-साथ तुलना करने के लिए किन्हीं दो एनएसई शेयरों का चयन करें।',
    selectStock1: 'पहला स्टॉक चुनें',
    selectStock2: 'दूसरा स्टॉक चुनें',
    compareDelta: 'जोखिम अंतर',

    // Alert History Page
    alertHistoryTitle: 'ऐतिहासिक क्रैश अलर्ट लॉग',
    alertHistorySub: 'निगरानी किए गए एनएसई शेयरों में पिछले फ्लैग किए गए क्रैश-जोखिम घटनाओं का कालानुक्रमिक समयरेखा।',
    filterAll: 'सभी स्टॉक',
    filterStatus: 'सभी स्थितियां',
    colTimestamp: 'समय-छाप',
    colStock: 'स्टॉक',
    colRiskScore: 'जोखिम स्कोर',
    colReason: 'प्राथमिक एआई कारक',
    colStatus: 'स्थिति',
    colAction: 'कार्रवाई',

    // Contagion Page
    contagionLabel: 'नेटवर्क जोखिम खुफिया',
    contagionTitle: 'संक्रमण मानचित्र और सेक्टर हीटमैप',
    contagionSub: 'कल्पना करें कि कैसे स्वामित्व संरचनाएं, गिरवी शेयर और क्रेडिट लिंक संबंधित कंपनियों में कैस्केडिंग क्रैश जोखिम पैदा करते हैं।',
    contagionAlertTitle: 'सक्रिय संक्रमण अलर्ट:',
    contagionAlertText: 'ADANIENT और संबद्ध संस्थाएं उच्च क्रॉस-होल्डिंग जोखिम दिखाती हैं।',
    howContagionWorks: 'संक्रमण जोखिम कैसे फैलता है',

    // Stock Detail Page
    backOverview: 'बाजार अवलोकन पर वापस जाएं',
    todayChange: 'आज',
    priceMovement30d: '30-दिवसीय मूल्य आंदोलन',
    hoverChartHint: 'मूल्य और दिनांक विवरण के लिए चार्ट पर होवर करें',
    keyMetrics: 'प्रमुख मेट्रिक्स',
    marketCap: 'मार्केट कैप',
    peRatio: 'पी/ई अनुपात',
    volume: 'वॉल्यूम',
    high52: '52-सप्ताह का उच्चतम',
    low52: '52-सप्ताह का न्यूनतम',
    aiRiskScore: 'एआई जोखिम स्कोर',
    highCrashRiskTitle: 'उच्च क्रैश जोखिम का पता चला',
    highCrashRiskDesc: 'क्रैशराडार एआई लोअर-सर्किट जोखिम का संकेत देता है। कार्य करने के लिए मुख्य पृष्ठ पर 15-मिनट के टाइमर का उपयोग करें।',
    aiRiskFactors: 'एआई जोखिम कारक',

    // Common Tags & Footers
    simulatedTag: 'सिम्युलेटेड डेटा',
    sampleTag: 'सैंपल डेटा',
    viewDetails: 'विवरण देखें',
    footerDesc: 'खुदरा निवेशकों के लिए भारत का पहला स्पष्टीकरण-योग्य एआई स्टॉक क्रैश भविष्यवाणी प्लेटफॉर्म।',
    footerRights: 'सर्वाधिकार सुरक्षित।',
  },

  ta: {
    // Brand & Header
    brandTitle: 'கிராஷ்ரேடார்',
    brandSub: 'AI சந்தை நுண்ணறிவு',
    marketOpen: 'சந்தை திறக்கப்பட்டுள்ளது',
    
    // Navbar
    navHome: 'சந்தை மேலோட்டம்',
    navScanner: 'ஆபத்து ஸ்கேனர்',
    navPortfolio: 'என் போர்ட்ஃபோலியோ',
    navCompare: 'ஒப்பீட்டுப் பார்வை',
    navContagion: 'தொற்று வரைபடம்',
    scanBtn: 'ஆபத்தை ஸ்கேன் செய்',

    // Hero Section
    heroBadge: 'AI விபத்து கணிப்பு · இந்திய பங்குகள்',
    heroTitle: 'ஒவ்வொரு விபத்திலும் சுவடுகள் உள்ளன.',
    heroSub: 'நீங்கள் அவற்றை காலம் கடப்பதற்கு முன்பு கண்டறிய முடியுமா?',
    scanRiskBtn: 'ஆபத்தை ஸ்கேன் செய்',
    howItProtectsBtn: 'இது எவ்வாறு பாதுகாக்கிறது',
    viewContagionBtn: 'தொற்று வரைபடத்தைப் பார்',

    // Home Stats
    statStocksWatch: 'கண்காணிப்பில் உள்ள பங்குகள்',
    statAlertsToday: 'இன்றைய அதிக ஆபத்து எச்சரிக்கைகள்',
    statProtected: 'பாதுகாக்கப்பட்ட முதலீட்டாளர்கள்',
    statLeadTime: 'சராசரி நேர இடைவெளி',

    // Home Innovation Section
    coreInnovation: 'முக்கிய கண்டுபிடிப்பு',
    survivalTitle: '15 நிமிட தப்பிக்கும் சாளரம்',
    survivalSub: 'நிறுவன வழிமுறைகள் நிலைகளை விற்கத் தொடங்கும்போது, சர்க்யூட் முடக்கத்திற்கு 15 நிமிடங்களுக்கு முன்பே CrashRadar AI ஆபத்தைக் கண்டறிகிறது.',
    feature1: 'ஆர்டர்-புக் சரிவை ஆரம்பத்திலேயே கண்டறிதல்',
    feature2: 'விளக்கமளிக்கக்கூடிய AI காரணங்கள் — வெறும் மதிப்பெண் மட்டுமல்ல',
    feature3: 'நிறுவன தொடர்பு ஆபத்து வரைபடம்',
    feature4: 'சர்க்யூட் முடக்கத்திற்கு முன் எச்சரிக்கைகள்',

    // CTA Panel
    ctaTitle: 'உங்கள் முதலீட்டைப் பாதுகாக்கத் தயாரா?',
    ctaSub: 'எந்தவொரு NSE/BSE பங்கையும் ஸ்கேன் செய்து நொடிகளில் வெளிப்படையான AI ஆபத்து மதிப்பெண்ணைப் பெறுங்கள்.',
    startScanBtn: 'இலவச ஸ்கேன் தொடங்கு',

    // Scanner Page
    scannerLabel: 'AI ஆபத்து நுண்ணறிவு',
    scannerTitle: 'பங்கு விபத்து ஆபத்து ஸ்கேனர்',
    scannerSub: 'வெளிப்படையான விளக்கங்களுடன் AI ஆபத்து மதிப்பெண்ணைப் பெற எந்தவொரு NSE பங்கு குறியீட்டையும் உள்ளிடவும்.',
    searchPlaceholder: 'பங்கு குறியீட்டை உள்ளிடவும் (எ.கா. RELIANCE, TCS, INFY…)',
    runScanBtn: 'ஸ்கேன் இயக்கு',
    quickWatchlist: 'விரைவு கண்காணிப்புப் பட்டியல் — NSE F&O பங்குகள்',
    analyzing: 'ஆபத்து அளவீடுகள் மதிப்பிடப்படுகின்றன…',
    priceChartBtn: 'விலை வரைபடம்',
    viewStockDetailsBtn: 'பங்கு விவரங்களைப் பார்',

    // Portfolio Page
    portfolioTitle: 'எனது முதலீட்டு போர்ட்ஃபோலியோ',
    portfolioSub: 'தனிப்பயன் பங்கு உடைமைகளைக் கண்காணித்து, ஒருங்கிணைந்த விபத்து ஆபத்து வெளிப்பாட்டைக் கண்காணிக்கவும்.',
    addStock: 'போர்ட்ஃபோலியோவில் பங்கு சேர்க்கவும்',
    removeStock: 'அகற்று',
    holdingsSummary: 'பங்கு ஆபத்து வெளிப்பாட்டின் சுருக்கம்',
    safeHoldings: 'பாதுகாப்பான பங்குகள்',
    cautionHoldings: 'எச்சரிக்கை பங்குகள்',
    dangerHoldings: 'ஆபத்தான பங்குகள்',
    emptyPortfolio: 'உங்கள் போர்ட்ஃபோலியோ தற்போது காலியாக உள்ளது. மேலே உள்ள கண்காணிப்புப் பட்டியலிலிருந்து பங்குகளைச் சேர்க்கவும்!',

    // Compare Page
    compareTitle: 'பங்கு ஆபத்து ஒப்பீடு',
    compareSub: 'இரண்டு NSE பங்குகளைத் தேர்ந்தெடுத்து அவற்றின் AI விபத்து ஆபத்து அளவீடுகளையும் முக்கிய அளவீடுகளையும் அருகருகே ஒப்பிடவும்.',
    selectStock1: 'முதல் பங்கைத் தேர்ந்தெடுக்கவும்',
    selectStock2: 'இரண்டாவது பங்கைத் தேர்ந்தெடுக்கவும்',
    compareDelta: 'ஆபத்து வித்தியாசம்',

    // Alert History Page
    alertHistoryTitle: 'வரலாற்று விபத்து எச்சரிக்கைப் பதிவு',
    alertHistorySub: 'கண்காணிக்கப்பட்ட NSE பங்குகளில் கடந்த காலத்தில் கொடியிடப்பட்ட விபத்து-ஆபத்து நிகழ்வுகளின் காலவரிசை.',
    filterAll: 'எல்லா பங்குகளும்',
    filterStatus: 'எல்லா நிலைகளும்',
    colTimestamp: 'நேரம்',
    colStock: 'பங்கு',
    colRiskScore: 'ஆபத்து மதிப்பெண்',
    colReason: 'முக்கிய AI காரணம்',
    colStatus: 'நிலை',
    colAction: 'நடவடிக்கை',

    // Contagion Page
    contagionLabel: 'வலைப்பின்னல் ஆபத்து நுண்ணறிவு',
    contagionTitle: 'தொற்று வரைபடம் & துறை வெப்ப வரைபடம்',
    contagionSub: 'உரிமை கட்டமைப்புகள் மற்றும் கடன் தொடர்புகள் தொடர்புடைய நிறுவனங்களில் எவ்வாறு ஆபத்தை உருவாக்குகின்றன என்பதைக் காட்சிப்படுத்துங்கள்.',
    contagionAlertTitle: 'செயலில் உள்ள தொற்று எச்சரிக்கை:',
    contagionAlertText: 'ADANIENT மற்றும் தொடர்புடைய நிறுவனங்கள் அதிக ஆபத்தைக் காட்டுகின்றன.',
    howContagionWorks: 'தொற்று ஆபத்து எவ்வாறு பரவுகிறது',

    // Stock Detail Page
    backOverview: 'சந்தை மேலோட்டத்திற்குத் திரும்பு',
    todayChange: 'இன்று',
    priceMovement30d: '30 நாள் விலை இயக்கம்',
    hoverChartHint: 'விலை மற்றும் தேதி விவரங்களுக்கு வரைபடத்தில் கர்சரைக் கொண்டு செல்லவும்',
    keyMetrics: 'முக்கிய அளவீடுகள்',
    marketCap: 'சந்தை மதிப்பு',
    peRatio: 'P/E விகிதம்',
    volume: 'வர்த்தக அளவு',
    high52: '52 வார அதிகபட்சம்',
    low52: '52 வார குறைந்தபட்சம்',
    aiRiskScore: 'AI ஆபத்து மதிப்பெண்',
    highCrashRiskTitle: 'அதிக விபத்து ஆபத்து கண்டறியப்பட்டது',
    highCrashRiskDesc: 'CrashRadar AI ஆபத்தைக் குறிக்கிறது. நடவடிக்கை எடுக்க முகப்புப் பக்கத்தில் உள்ள 15 நிமிட டைமரைப் பயன்படுத்தவும்.',
    aiRiskFactors: 'AI ஆபத்து காரணங்கள்',

    // Common Tags & Footers
    simulatedTag: 'சிமுலேட்டட் தரவு',
    sampleTag: 'மாதிரி தரவு',
    viewDetails: 'விவரங்களைப் பார்',
    footerDesc: 'சில்லறை முதலீட்டாளர்களுக்கான இந்தியாவின் முதல் விளக்கமளிக்கக்கூடிய AI பங்கு விபத்து கணிப்பு தளம்.',
    footerRights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (key) => translations['en']?.[key] || key,
    };
  }
  return context;
}
