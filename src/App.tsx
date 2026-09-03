import React, { useState } from 'react';
import { Header } from './components/Header';
import { LiveTickerBar } from './components/LiveTickerBar';
import { HeroSection } from './components/HeroSection';
import { IndexCards } from './components/IndexCards';
import { MarketMoversTable } from './components/MarketMoversTable';
import { StockDetailModal } from './components/StockDetailModal';
import { SearchModal } from './components/SearchModal';
import { ProRightDock } from './components/ProRightDock';
import { Footer } from './components/Footer';
import { CategoryType, ThemeMode, StockMover, MarketIndex, ProDockTab } from './types';
import { INITIAL_TICKERS, MARKET_INDICES, STOCK_MOVERS_DATA } from './data/marketData';
import { PRO_CATEGORIES_DATA } from './data/proMarketData';
import { playTickSound } from './utils/soundEffects';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('US stocks');
  const [selectedRegion, setSelectedRegion] = useState<string>('us');
  const [selectedItem, setSelectedItem] = useState<StockMover | MarketIndex | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<ProDockTab>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const toggleTheme = () => {
    playTickSound(soundEnabled);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const toggleDock = () => {
    playTickSound(soundEnabled);
    setActiveDockTab((prev) => (prev ? null : 'watchlist'));
  };

  // Find stock or index by symbol
  const handleSelectSymbol = (symbol: string) => {
    playTickSound(soundEnabled);
    const cleanSym = symbol.toUpperCase().trim();

    // Check indices first
    const foundIndex = MARKET_INDICES.find((i) => i.symbol === cleanSym || i.id === cleanSym.toLowerCase());
    if (foundIndex) {
      setSelectedItem(foundIndex);
      return;
    }

    // Check all stock movers data
    for (const tab of Object.keys(STOCK_MOVERS_DATA)) {
      const found = STOCK_MOVERS_DATA[tab as keyof typeof STOCK_MOVERS_DATA]?.find(
        (s) => s.symbol.toUpperCase() === cleanSym
      );
      if (found) {
        setSelectedItem(found);
        return;
      }
    }

    // Fallback synthetic stock for items clicked in news or watchlist
    const syntheticStock: StockMover = {
      symbol: cleanSym,
      name: `${cleanSym} Asset Group`,
      badgeBg: '#2962ff',
      badgeTextColor: '#ffffff',
      last: cleanSym.includes('BTC') ? 67490.5 : 175.4,
      changePct: 2.85,
      change: 4.88,
      trendPoints: '0,12 10,10 20,13 30,8 40,6 50,4 60,2',
      trendDirection: 'up',
      high: cleanSym.includes('BTC') ? 68200.0 : 178.5,
      low: cleanSym.includes('BTC') ? 66100.0 : 172.1,
      volume: '14.2M',
      avgVolume: '18.5M',
      rating: 'Strong Buy',
      sector: cleanSym.includes('BTC') ? 'Digital Currency' : 'Global Tech',
      marketCap: '$1.4T',
      peRatio: 28.4,
      yearHigh: cleanSym.includes('BTC') ? 73750.0 : 190.0,
      yearLow: cleanSym.includes('BTC') ? 48200.0 : 120.5,
    };
    setSelectedItem(syntheticStock);
  };

  // Switch category data
  const displayedIndices = React.useMemo(() => {
    if (selectedCategory in PRO_CATEGORIES_DATA) {
      return PRO_CATEGORIES_DATA[selectedCategory as keyof typeof PRO_CATEGORIES_DATA];
    }
    return MARKET_INDICES;
  }, [selectedCategory]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 relative ${
        theme === 'dark' ? 'bg-[#131722] text-[#d1d4dc]' : 'bg-white text-[#131722]'
      }`}
    >
      {/* Top Professional Header Navigation */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        activeDockTab={activeDockTab}
        onToggleDock={toggleDock}
      />

      {/* Real-time Streaming Ticker Bar */}
      <LiveTickerBar
        theme={theme}
        initialTickers={INITIAL_TICKERS}
        onSelectTicker={handleSelectSymbol}
      />

      {/* Main Trading Terminal Dashboard Container (Right padding for Pro dock strip) */}
      <main className="flex-grow max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 pr-14 sm:pr-16">
        {/* Markets Everywhere Category Selector */}
        <HeroSection
          theme={theme}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            playTickSound(soundEnabled);
            setSelectedCategory(cat);
          }}
          selectedRegion={selectedRegion}
          onSelectRegion={(reg) => {
            playTickSound(soundEnabled);
            setSelectedRegion(reg);
          }}
        />

        {/* Real-time Indices & Asset Cards Grid */}
        <IndexCards
          theme={theme}
          indices={displayedIndices}
          onSelectIndex={(index) => {
            playTickSound(soundEnabled);
            setSelectedItem(index);
          }}
        />

        {/* Pro Market Movers & Screener Suite (Table / Heatmap / Grid) */}
        <MarketMoversTable
          theme={theme}
          onSelectStock={(stock) => {
            playTickSound(soundEnabled);
            setSelectedItem(stock);
          }}
          soundEnabled={soundEnabled}
        />
      </main>

      {/* TradingView Iconic Right Pro Dock (Watchlist, Alerts, News Wire, Technical Gauge, Paper Trading) */}
      <ProRightDock
        theme={theme}
        activeDockTab={activeDockTab}
        onSelectDockTab={(tab) => setActiveDockTab(tab)}
        soundEnabled={soundEnabled}
        onSelectSymbol={handleSelectSymbol}
      />

      {/* Professional Terminal Footer */}
      <Footer theme={theme} />

      {/* Pro Technical Charting & Analysis Modal (Candlesticks, SMA, OHLC, Paper Trade) */}
      <StockDetailModal
        theme={theme}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        soundEnabled={soundEnabled}
      />

      {/* Global Symbol & Market Search Modal (⌘K / Ctrl+K) */}
      <SearchModal
        theme={theme}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectItem={(item) => setSelectedItem(item)}
      />
    </div>
  );
}
