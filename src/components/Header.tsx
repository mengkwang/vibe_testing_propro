import React, { useState, useEffect } from 'react';
import { Search, Globe, User, Sun, Moon, Check, ChevronDown, Volume2, VolumeX, Shield, PanelRight, Activity, MessageSquare, TrendingUp } from 'lucide-react';
import { ThemeMode, ProDockTab, MainNavTab } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeDockTab: ProDockTab;
  onToggleDock: () => void;
  activeNavTab: MainNavTab;
  onSelectNavTab: (tab: MainNavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSearch,
  soundEnabled,
  onToggleSound,
  activeDockTab,
  onToggleDock,
  activeNavTab,
  onSelectNavTab,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState('2h 44m');

  // Simulated session countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const closeHour = 16; // 4:00 PM
      const hoursLeft = Math.max(0, closeHour - now.getHours() - 1);
      const minsLeft = Math.max(0, 60 - now.getMinutes());
      const secsLeft = Math.max(0, 60 - now.getSeconds());
      setSessionTime(`${hoursLeft}h ${minsLeft}m ${secsLeft}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const languages = [
    { code: 'EN', label: 'English (US)' },
    { code: 'ES', label: 'Español' },
    { code: 'DE', label: 'Deutsch' },
    { code: 'FR', label: 'Français' },
    { code: 'JA', label: '日本語' },
    { code: 'ZH', label: '简体中文' },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-[#131722] border-[#2a2e39]' 
        : 'bg-white border-[#e0e3eb]'
    }`}>
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo, Search Bar, & Feed status */}
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          <a
            href="#"
            id="tradingview-logo"
            aria-label="TradingView Home"
            className={`flex items-center gap-2 transition-opacity hover:opacity-90 ${
              theme === 'dark' ? 'text-white' : 'text-[#131722]'
            }`}
          >
            {/* TradingView Brand Logo Glyphs */}
            <svg
              className="w-8 h-6 fill-current"
              viewBox="0 0 36 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.5 0H0V28H5.5V0Z" />
              <path d="M16 0H10.5V28H16V0Z" />
              <path d="M26.5 0H21V19H26.5V0Z" />
              <path d="M36 9H30.5V28H36V9Z" />
            </svg>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">TRADINGVIEW</span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm">
                PRO+
              </span>
            </div>
          </a>

          {/* Quick Search Pill Bar */}
          <button
            id="global-search-trigger"
            type="button"
            onClick={onOpenSearch}
            className={`group relative w-48 sm:w-64 md:w-72 h-9 px-3.5 pl-9 flex items-center justify-between rounded-full border text-xs transition-all duration-150 cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1e222d] border-[#2a2e39] text-[#787b86] hover:bg-[#2a2e39] hover:border-[#363a45]'
                : 'bg-[#f0f3fa] border-transparent text-[#787b86] hover:bg-[#e0e3eb] hover:border-[#d1d4dc]'
            }`}
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#787b86]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-normal">Search symbols, indices, news...</span>
            <kbd
              className={`hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded border ${
                theme === 'dark'
                  ? 'bg-[#131722] border-[#2a2e39] text-[#787b86]'
                  : 'bg-white border-[#d1d4dc] text-[#787b86]'
              }`}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Primary Navigation Tabs: Markets & Talk to Us */}
        <nav
          aria-label="Main Navigation"
          className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
            theme === 'dark'
              ? 'bg-[#1e222d] border-[#2a2e39]'
              : 'bg-[#f0f3fa] border-[#e0e3eb]'
          }`}
        >
          <button
            id="nav-tab-markets"
            type="button"
            onClick={() => onSelectNavTab('markets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNavTab === 'markets'
                ? theme === 'dark'
                  ? 'bg-[#2a2e39] text-[#f0f3fa] shadow-sm'
                  : 'bg-white text-[#131722] shadow-sm'
                : 'text-[#787b86] hover:text-[#2962ff]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Markets</span>
          </button>
          <button
            id="nav-tab-talk-to-us"
            type="button"
            onClick={() => onSelectNavTab('talk-to-us')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNavTab === 'talk-to-us'
                ? 'bg-[#2962ff] text-white shadow-sm'
                : 'text-[#787b86] hover:text-[#2962ff]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Talk to Us</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
          </button>
        </nav>

        {/* Center: Live Terminal Ticker Feed Status & Session Clock */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#089981]/10 text-[#089981] font-semibold border border-[#089981]/20">
            <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
            <span>NYSE OPEN</span>
            <span className="text-[#787b86] font-normal">• Closes {sessionTime}</span>
          </div>

          <div className="flex items-center gap-1 text-[#787b86]">
            <Activity className="w-3.5 h-3.5 text-[#2962ff]" />
            <span className="text-[11px]">FEED: 14ms (CME Direct)</span>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label="Toggle Sound FX"
            title={soundEnabled ? 'Audio Feedback: ON' : 'Audio Feedback: OFF'}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              soundEnabled
                ? 'text-[#2962ff] bg-[#2962ff]/10'
                : theme === 'dark'
                ? 'text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#1e222d]'
                : 'text-[#787b86] hover:text-[#131722] hover:bg-[#f0f3fa]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              theme === 'dark'
                ? 'text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#1e222d]'
                : 'text-[#787b86] hover:text-[#131722] hover:bg-[#f0f3fa]'
            }`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#f0f3fa]" />
            ) : (
              <Moon className="w-4 h-4 text-[#131722]" />
            )}
          </button>

          {/* Pro Dock Launcher Button */}
          <button
            type="button"
            onClick={onToggleDock}
            aria-label="Toggle Pro Tools Drawer"
            title="Toggle Pro Dock (Watchlist, Alerts, News, Technicals, Paper Trade)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              activeDockTab
                ? 'bg-[#2962ff] border-[#2962ff] text-white shadow-sm'
                : theme === 'dark'
                ? 'border-[#2a2e39] text-[#d1d4dc] hover:bg-[#1e222d]'
                : 'border-[#e0e3eb] text-[#131722] hover:bg-[#f0f3fa]'
            }`}
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PRO TOOLS</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              id="lang-switcher-trigger"
              type="button"
              onClick={() => {
                setLangOpen(!langOpen);
                setProfileOpen(false);
              }}
              className={`flex items-center gap-1 text-xs font-semibold p-2 rounded-lg transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'text-[#f0f3fa] hover:text-[#2962ff] hover:bg-[#1e222d]'
                  : 'text-[#131722] hover:text-[#2962ff] hover:bg-[#f0f3fa]'
              }`}
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#787b86]" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-[#787b86]" />
            </button>

            {langOpen && (
              <div
                className={`absolute right-0 mt-2 w-40 rounded-xl shadow-xl border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                  theme === 'dark'
                    ? 'bg-[#1e222d] border-[#2a2e39] text-[#f0f3fa]'
                    : 'bg-white border-[#e0e3eb] text-[#131722]'
                }`}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                      currentLang === lang.code
                        ? 'text-[#2962ff] font-semibold'
                        : theme === 'dark'
                        ? 'hover:bg-[#2a2e39]'
                        : 'hover:bg-[#f0f3fa]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Status */}
          <div className="relative">
            <button
              id="user-profile-trigger"
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setLangOpen(false);
              }}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#2a2e39] text-[#f0f3fa] hover:border-[#2962ff] bg-[#1e222d]'
                  : 'border-[#e0e3eb] text-[#131722] hover:border-[#2962ff] bg-[#f0f3fa]'
              }`}
              title="Trader Profile (Pro+)"
            >
              <User className="w-4 h-4 text-[#2962ff]" />
            </button>

            {profileOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border p-2 z-50 ${
                  theme === 'dark'
                    ? 'bg-[#1e222d] border-[#2a2e39] text-[#f0f3fa]'
                    : 'bg-white border-[#e0e3eb] text-[#131722]'
                }`}
              >
                <div className="px-3 py-2 border-b border-inherit">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">Pro Trader</p>
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500 text-black rounded">PRO+</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#787b86]">ID: TR-8942-NY</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleDock();
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-[#2a2e39]' : 'hover:bg-[#f0f3fa]'
                    }`}
                  >
                    Open Watchlist & Screener
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleDock();
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-[#2a2e39]' : 'hover:bg-[#f0f3fa]'
                    }`}
                  >
                    Paper Trading Portfolio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
