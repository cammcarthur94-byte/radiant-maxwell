'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutGrid,
  Globe2,
  Sparkles,
  BarChart3,
  FileText,
  MessageSquareCode,
  Radio,
  Link2,
  BookOpen,
  Settings,
  RefreshCw,
  Moon,
  Sun,
  Shield,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Competitors' | 'Quick Actions';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { triggerTracking, refreshData } = useDashboard();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    // Navigation
    {
      id: 'nav-overview',
      label: 'Overview / Benchmarks',
      category: 'Navigation',
      icon: LayoutGrid,
      action: () => {
        router.push('/dashboard');
        onClose();
      },
      keywords: ['home', 'dashboard', 'radar', 'overview'],
    },
    {
      id: 'nav-aeo',
      label: 'AEO Score (Answer Engine Optimization)',
      category: 'Navigation',
      icon: Search,
      action: () => {
        router.push('/dashboard/aeo');
        onClose();
      },
      keywords: ['aeo', 'queries', 'chatgpt', 'perplexity', 'gemini'],
    },
    {
      id: 'nav-geo',
      label: 'GEO Score (Generative Engine Optimization)',
      category: 'Navigation',
      icon: Globe2,
      action: () => {
        router.push('/dashboard/geo');
        onClose();
      },
      keywords: ['geo', 'schema', 'json-ld', 'content'],
    },
    {
      id: 'nav-aio',
      label: 'AIO Score (Google AI Overviews)',
      category: 'Navigation',
      icon: Sparkles,
      action: () => {
        router.push('/dashboard/aio');
        onClose();
      },
      keywords: ['aio', 'google', 'overviews', 'serp'],
    },
    {
      id: 'nav-models',
      label: 'Model Comparison',
      category: 'Navigation',
      icon: BarChart3,
      action: () => {
        router.push('/dashboard/models');
        onClose();
      },
      keywords: ['models', 'chatgpt', 'claude', 'gemini', 'perplexity', 'grok', 'meta'],
    },
    {
      id: 'nav-citations',
      label: 'Citation Analysis & Examples',
      category: 'Navigation',
      icon: FileText,
      action: () => {
        router.push('/dashboard/citations');
        onClose();
      },
      keywords: ['citations', 'direct', 'paraphrase', 'implied', 'quotes'],
    },
    {
      id: 'nav-prompts',
      label: 'Prompts Library & Intent Tracker',
      category: 'Navigation',
      icon: MessageSquareCode,
      action: () => {
        router.push('/dashboard/prompts');
        onClose();
      },
      keywords: ['prompts', 'queries', 'add prompt', 'categories'],
    },
    {
      id: 'nav-sov',
      label: 'Share of Voice',
      category: 'Navigation',
      icon: Radio,
      action: () => {
        router.push('/dashboard/share-of-voice');
        onClose();
      },
      keywords: ['sov', 'share of voice', 'market share', 'distribution'],
    },
    {
      id: 'nav-sources',
      label: 'Top Domains & Authority Sources',
      category: 'Navigation',
      icon: Link2,
      action: () => {
        router.push('/dashboard/sources');
        onClose();
      },
      keywords: ['domains', 'links', 'sources', 'authority'],
    },
    {
      id: 'nav-settings',
      label: 'Settings & Workspace Preferences',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        router.push('/dashboard/settings');
        onClose();
      },
      keywords: ['settings', 'api key', 'profile', 'competitors', 'integrations'],
    },

    // Competitors
    {
      id: 'comp-horizon',
      label: 'Competitor: Horizon Tech',
      category: 'Competitors',
      icon: Shield,
      action: () => {
        router.push('/dashboard/models');
        onClose();
      },
      keywords: ['horizon tech', 'competitor'],
    },
    {
      id: 'comp-nexus',
      label: 'Competitor: Nexus AI Systems',
      category: 'Competitors',
      icon: Shield,
      action: () => {
        router.push('/dashboard/models');
        onClose();
      },
      keywords: ['nexus', 'competitor'],
    },
    {
      id: 'comp-vertex',
      label: 'Competitor: Vertex Solutions',
      category: 'Competitors',
      icon: Shield,
      action: () => {
        router.push('/dashboard/models');
        onClose();
      },
      keywords: ['vertex', 'top performer', 'leader'],
    },

    // Quick Actions
    {
      id: 'action-sync',
      label: 'Trigger Live Tracking & Metric Sync',
      category: 'Quick Actions',
      icon: RefreshCw,
      action: async () => {
        onClose();
        await triggerTracking();
        await refreshData();
      },
      keywords: ['sync', 'refresh', 'recalculate', 'track'],
    },
  ];

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.some((k) => k.includes(q)))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Search Input Header */}
        <div className="flex items-center px-4 border-b border-slate-100 bg-white">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search anything... (Esc to exit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full py-4 text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded-md border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="truncate">{item.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; Navigate</span>
            <span>&crarr; Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-sans font-semibold text-slate-500">AI Visibility Engine</span>
        </div>
      </div>
    </div>
  );
}
