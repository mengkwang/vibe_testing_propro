import React from 'react';
import { ThemeMode } from '../types';

interface FooterProps {
  theme: ThemeMode;
  onOpenTalkToUs?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ theme, onOpenTalkToUs }) => {
  return (
    <footer
      className={`border-t mt-16 text-xs transition-colors duration-200 ${
        theme === 'dark'
          ? 'border-[#2a2e39] bg-[#131722] text-[#787b86]'
          : 'border-[#e0e3eb] bg-white text-[#787b86]'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
          <span
            className={`font-bold text-sm ${
              theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
            }`}
          >
            © 2025 TradingView
          </span>
          {onOpenTalkToUs && (
            <button
              type="button"
              onClick={onOpenTalkToUs}
              className={`transition-colors font-medium text-[#2962ff] cursor-pointer ${
                theme === 'dark' ? 'hover:text-white' : 'hover:text-[#1e53e5]'
              }`}
            >
              Talk to Us (Community)
            </button>
          )}
          <a
            href="#"
            className={`transition-colors ${
              theme === 'dark' ? 'hover:text-[#f0f3fa]' : 'hover:text-[#131722]'
            }`}
          >
            Terms of use
          </a>
          <a
            href="#"
            className={`transition-colors ${
              theme === 'dark' ? 'hover:text-[#f0f3fa]' : 'hover:text-[#131722]'
            }`}
          >
            Privacy policy
          </a>
          <a
            href="#"
            className={`transition-colors ${
              theme === 'dark' ? 'hover:text-[#f0f3fa]' : 'hover:text-[#131722]'
            }`}
          >
            Disclaimer
          </a>
        </div>

        <div className="flex items-center gap-2 text-center md:text-right">
          <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
          <span>
            Select market data provided by ICE Data Services • Real-time quote feed
          </span>
        </div>
      </div>
    </footer>
  );
};
