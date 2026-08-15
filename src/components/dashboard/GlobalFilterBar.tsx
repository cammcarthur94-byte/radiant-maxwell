'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Filter,
  Layers,
  Check,
  ChevronDown,
  RefreshCw,
  Share2,
  CheckCheck,
  Sparkles,
  Zap,
  SlidersHorizontal,
  RotateCcw,
  Bot,
  Search,
} from 'lucide-react';
import { PlatformOption } from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';

export interface GlobalFilterBarProps {
  className?: string;
}

export function GlobalFilterBar({ className = '' }: GlobalFilterBarProps) {
  const {
    selectedPlatform,
    setSelectedPlatform,
    selectedCampaign,
    setSelectedCampaign,
    availableCampaigns,
    refreshData,
    isLoading,
    activeTenant,
  } = useDashboard();

  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const campaignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (campaignRef.current && !campaignRef.current.contains(event.target as Node)) {
        setCampaignDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const platforms: {
    id: PlatformOption;
    label: string;
    badge: string;
    icon: string;
  }[] = [
    {
      id: 'all',
      label: 'All AI Engines',
      badge: 'Unified',
      icon: '🌐',
    },
    {
      id: 'chatgpt',
      label: 'ChatGPT',
      badge: 'GPT-4o',
      icon: '🟢',
    },
    {
      id: 'perplexity',
      label: 'Perplexity',
      badge: 'Sonar',
      icon: '🔵',
    },
    {
      id: 'gemini',
      label: 'Google Gemini',
      badge: 'AIO & SGE',
      icon: '🟣',
    },
    {
      id: 'copilot',
      label: 'MS Copilot',
      badge: 'Bing',
      icon: '🔷',
    },
  ];

  const activeCampaign =
    availableCampaigns.find((c) => c.id === selectedCampaign) || {
      id: 'all',
      name: 'All Tracked Queries',
      targetQuery: 'Aggregated across all generative search topics',
    };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl shadow-2xs p-2 sm:p-2.5 transition-all ${className}`}
      role="region"
      aria-label="Platform and Query Filter Bar"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
        {/* Left: Multi-Platform Breakdown Segmented Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1 pr-1.5 flex items-center gap-1">
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            <span>Engine:</span>
          </span>

          <div className="flex items-center p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/80 gap-0.5 flex-wrap">
            {platforms.map((p) => {
              const isSelected = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-xs">{p.icon}</span>
                  <span>{p.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Target Query / Campaign Selector & Actions */}
        <div className="flex items-center gap-2">
          {/* Target Query Selector */}
          <div className="relative flex-1 sm:flex-initial" ref={campaignRef}>
            <button
              onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">Query:</span>
                <span className="font-semibold text-slate-900 truncate">
                  {activeCampaign.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {campaignDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in slide-in-from-top-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Search Query / Campaign
                </div>
                {availableCampaigns.map((camp) => (
                  <button
                    key={camp.id}
                    onClick={() => {
                      setSelectedCampaign(camp.id);
                      setCampaignDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedCampaign === camp.id
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-semibold">{camp.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          selectedCampaign === camp.id ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {camp.targetQuery}
                      </div>
                    </div>
                    {selectedCampaign === camp.id && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Share / Link Button */}
          <button
            onClick={handleCopyShareLink}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Copy snapshot URL with current filters"
          >
            {copiedLink ? (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
