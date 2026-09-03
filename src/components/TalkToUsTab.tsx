import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { playTickSound } from '../utils/soundEffects';

interface TalkToUsTabProps {
  theme: ThemeMode;
  onBackToMarkets: () => void;
  soundEnabled: boolean;
}

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: {
          page: {
            url?: string;
            identifier?: string;
            title?: string;
          };
        }) => void;
      }) => void;
    };
    disqus_config?: (this: {
      page: {
        url?: string;
        identifier?: string;
        title?: string;
      };
    }) => void;
  }
}

// Real fixed canonical configuration values (replacing PAGE_URL and PAGE_IDENTIFIER placeholders)
const CANONICAL_BASE_URL = 'https://ais-pre-4yozgxpne6cqxi2x34du7u-410677365512.asia-southeast1.run.app/talk-to-us';
const FIXED_PAGE_IDENTIFIER = 'talk-to-us';

export const TalkToUsTab: React.FC<TalkToUsTabProps> = ({
  theme,
  onBackToMarkets,
  soundEnabled,
}) => {
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'reloaded'>('loading');
  const threadRef = useRef<HTMLDivElement>(null);

  // Compute canonical URL with origin fallback
  const getPageUrl = () => {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return `${window.location.origin}/talk-to-us`;
    }
    return CANONICAL_BASE_URL;
  };

  const loadOrResetDisqus = (isManualReload = false) => {
    const pageUrl = getPageUrl();
    const pageIdentifier = FIXED_PAGE_IDENTIFIER;
    const pageTitle = 'Talk to Us - TradingView Markets Community';

    if (isManualReload) {
      setIsReloading(true);
      playTickSound(soundEnabled);
    }

    // Official Disqus SPA Configuration Function
    const configureDisqus = function (this: any) {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
      this.page.title = pageTitle;
    };

    // Check if DISQUS is already initialized in window (handling SPA tab switches)
    if (typeof window !== 'undefined' && typeof window.DISQUS !== 'undefined') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: configureDisqus,
        });
        setLoadStatus(isManualReload ? 'reloaded' : 'ready');
      } catch (err) {
        console.warn('Disqus reset warning:', err);
        setLoadStatus('ready');
      } finally {
        if (isManualReload) {
          setTimeout(() => setIsReloading(false), 600);
        }
      }
    } else {
      // First-time load: Assign disqus_config and inject embed.js script
      window.disqus_config = configureDisqus;

      const existingScript = document.getElementById('dsq-embed-scr') as HTMLScriptElement | null;
      if (!existingScript) {
        const s = document.createElement('script');
        s.id = 'dsq-embed-scr';
        s.src = 'https://meng-kwang-1.disqus.com/embed.js';
        s.setAttribute('data-timestamp', String(+new Date()));
        s.async = true;
        s.onload = () => {
          setLoadStatus('ready');
          if (isManualReload) setIsReloading(false);
        };
        s.onerror = () => {
          setLoadStatus('ready');
          if (isManualReload) setIsReloading(false);
        };
        (document.head || document.body).appendChild(s);
      } else {
        // If script element exists but DISQUS isn't ready yet, poll briefly
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (typeof window.DISQUS !== 'undefined') {
            clearInterval(interval);
            try {
              window.DISQUS.reset({
                reload: true,
                config: configureDisqus,
              });
            } catch (e) {
              console.warn('Error resetting after poll:', e);
            }
            setLoadStatus('ready');
            if (isManualReload) setIsReloading(false);
          } else if (attempts > 30) {
            clearInterval(interval);
            setLoadStatus('ready');
            if (isManualReload) setIsReloading(false);
          }
        }, 100);
      }
    }

    // Ensure count.js is loaded
    if (!document.getElementById('dsq-count-scr')) {
      const countScript = document.createElement('script');
      countScript.id = 'dsq-count-scr';
      countScript.src = '//meng-kwang-1.disqus.com/count.js';
      countScript.async = true;
      (document.head || document.body).appendChild(countScript);
    }
  };

  // Trigger Disqus load or SPA reset when component mounts or theme changes
  useEffect(() => {
    // Delay slightly to ensure #disqus_thread container is rendered in DOM
    const timer = setTimeout(() => {
      loadOrResetDisqus(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <section className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-inherit">
        <div className="flex items-center gap-3">
          <button
            id="back-to-markets-btn"
            type="button"
            onClick={() => {
              playTickSound(soundEnabled);
              onBackToMarkets();
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] hover:text-white hover:bg-[#2a2e39]'
                : 'bg-[#f0f3fa] border-[#e0e3eb] text-[#131722] hover:bg-[#e0e3eb]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Markets Terminal</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#787b86]">
            <span>Markets</span>
            <span>/</span>
            <span className={theme === 'dark' ? 'text-[#f0f3fa] font-medium' : 'text-[#131722] font-medium'}>
              Talk to Us
            </span>
          </div>
        </div>

        {/* Real-time Status Badge & Manual Reload Control */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${
              theme === 'dark'
                ? 'bg-[#1e222d] border-[#2a2e39] text-[#787b86]'
                : 'bg-[#f0f3fa] border-[#e0e3eb] text-[#787b86]'
            }`}
          >
            <Radio className="w-3 h-3 text-[#089981] animate-pulse" />
            <span className="text-[#089981] font-semibold">Disqus Live</span>
            <span className="hidden md:inline">• ID: {FIXED_PAGE_IDENTIFIER}</span>
          </div>

          <button
            id="reload-disqus-btn"
            type="button"
            onClick={() => loadOrResetDisqus(true)}
            disabled={isReloading}
            title="Reload comments thread"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-[#2962ff]'
                : 'bg-white border-[#e0e3eb] text-[#131722] hover:bg-[#f0f3fa] hover:text-[#2962ff]'
            } ${isReloading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-[#2962ff]' : ''}`} />
            <span className="hidden sm:inline">Reload Thread</span>
          </button>
        </div>
      </div>

      {/* Main Title & Hero Banner */}
      <div className="text-center sm:text-left max-w-3xl space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#2962ff]/10 text-[#2962ff]">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Community & Support Forum</span>
        </div>
        <h1
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            theme === 'dark' ? 'text-[#f0f3fa]' : 'text-[#131722]'
          }`}
        >
          Talk to Us
        </h1>
        <p className="text-sm sm:text-base text-[#787b86] leading-relaxed">
          Have questions about market setups, feature suggestions, or feedback on our real-time screener?
          Join our open community discussion powered by Disqus below.
        </p>
      </div>

      {/* Topic Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            theme === 'dark'
              ? 'bg-[#1e222d]/60 border-[#2a2e39]'
              : 'bg-[#f8f9fd] border-[#e0e3eb]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#089981] mb-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>Market Analysis</span>
          </div>
          <p className="text-xs text-[#787b86]">
            Share technical indicators, chart patterns, and macro opinions on US stocks, crypto, and forex.
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            theme === 'dark'
              ? 'bg-[#1e222d]/60 border-[#2a2e39]'
              : 'bg-[#f8f9fd] border-[#e0e3eb]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#2962ff] mb-1.5">
            <Lightbulb className="w-4 h-4" />
            <span>Feature Wishlist</span>
          </div>
          <p className="text-xs text-[#787b86]">
            Request new indicators, exchange feeds, or screener filters you’d like built into TradingView.
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            theme === 'dark'
              ? 'bg-[#1e222d]/60 border-[#2a2e39]'
              : 'bg-[#f8f9fd] border-[#e0e3eb]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#f23645] mb-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </div>
          <p className="text-xs text-[#787b86]">
            Report feed issues, calculation questions, or inquire about Pro terminal features.
          </p>
        </div>
      </div>

      {/* Primary Disqus Thread Embed Container */}
      <div
        id="disqus-container-card"
        className={`rounded-2xl border p-4 sm:p-7 min-h-[460px] shadow-sm relative transition-colors ${
          theme === 'dark'
            ? 'bg-[#1e222d] border-[#2a2e39]'
            : 'bg-white border-[#e0e3eb]'
        }`}
      >
        {/* Disqus Embed Container Target */}
        <div ref={threadRef} id="disqus_thread" className="w-full min-h-[360px]" />

        {/* Fallback for disabled JavaScript as per universal code specification */}
        <noscript>
          Please enable JavaScript to view the{' '}
          <a
            href="https://disqus.com/?ref_noscript"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2962ff] underline"
          >
            comments powered by Disqus.
          </a>
        </noscript>
      </div>

      {/* Canonical Metadata Info Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#787b86] px-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#089981]" />
          <span>Moderated discussion channel • Disqus Shortname: <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-black/10">meng-kwang-1</code></span>
        </div>
        <div className="flex items-center gap-3">
          <span>SPA Reset Enabled</span>
          <span>•</span>
          <a
            href="https://disqus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#2962ff] flex items-center gap-1"
          >
            <span>Powered by Disqus</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
};
