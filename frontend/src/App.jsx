import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TickerTape from './components/TickerTape';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import PortfolioPage from './pages/PortfolioPage';
import ComparePage from './pages/ComparePage';
import AlertHistoryPage from './pages/AlertHistoryPage';
import ContagionPage from './pages/ContagionPage';
import StockDetailPage from './pages/StockDetailPage';
import { LanguageProvider } from './i18n/LanguageContext';

export default function App() {
  const [page, setPage] = useState('home');

  // Router: 'home' | 'scanner' | 'portfolio' | 'compare' | 'alerts' | 'contagion' | 'stock-SYMBOL'
  const isStockDetail = page.startsWith('stock-');
  const stockSymbol = isStockDetail ? page.replace('stock-', '') : null;
  const activeTab = isStockDetail ? 'home' : page;

  const renderPage = () => {
    if (isStockDetail) {
      return (
        <StockDetailPage
          symbol={stockSymbol}
          onBack={() => setPage('home')}
        />
      );
    }
    switch (page) {
      case 'home':       return <HomePage setPage={setPage} />;
      case 'scanner':    return <ScannerPage setPage={setPage} />;
      case 'portfolio':  return <PortfolioPage setPage={setPage} />;
      case 'compare':    return <ComparePage setPage={setPage} />;
      case 'alerts':     return <AlertHistoryPage setPage={setPage} />;
      case 'contagion':  return <ContagionPage setPage={setPage} />;
      default:           return <HomePage setPage={setPage} />;
    }
  };

  return (
    <LanguageProvider>
      <div style={{
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        background: 'var(--bg-app)', color: 'var(--text-primary)',
      }}>
        <TickerTape setPage={setPage} />
        <Navbar activePage={activeTab} setPage={setPage} />
        <main style={{ flex: 1 }}>
          {renderPage()}
        </main>
        <Footer setPage={setPage} />
      </div>
    </LanguageProvider>
  );
}
