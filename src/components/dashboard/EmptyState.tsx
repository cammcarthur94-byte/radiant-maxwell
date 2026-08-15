'use client';

import React from 'react';
import { Sparkles, Clock, RefreshCw, Bot, Radar, Layers } from 'lucide-react';

export interface EmptyStateProps {
  /**
   * Optional custom soft icon. Defaults to a glowing radar/AI discovery icon.
   */
  icon?: React.ReactNode;
  /**
   * Primary headline message. Defaults to "Gathering your first AI Overview analytics..."
   */
  message?: string;
  /**
   * Secondary supporting description explaining background processing.
   */
  description?: string;
  /**
   * Button label for the disabled state indicator. Defaults to "Check back soon"
   */
  buttonText?: string;
  /**
   * Whether the primary button is disabled. Defaults to true.
   */
  disabledButton?: boolean;
  /**
   * Optional action callback (e.g., if triggered manually or in interactive testing)
   */
  onAction?: () => void;
  /**
   * Optional secondary action button (e.g. manual refresh)
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
  };
  /**
   * Extra container class styling
   */
  className?: string;
}

export function EmptyState({
  icon,
  message = 'Gathering your first AI Overview analytics...',
  description = 'Your automated citation tracking schedule is being provisioned. AI engines (Gemini, ChatGPT, Perplexity) are scheduled to crawl and evaluate your brand visibility.',
  buttonText = 'Check back soon',
  disabledButton = true,
  onAction,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <section
      aria-label="Empty State: AI Overview Analytics"
      className={`bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-14 text-center shadow-xs my-6 flex flex-col items-center justify-center max-w-2xl mx-auto transition-all ${className}`}
    >
      {/* Soft Icon with gentle pulsing aura */}
      <div className="relative mb-6">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-md"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 flex items-center justify-center text-indigo-600 shadow-2xs">
          {icon || (
            <div className="relative flex items-center justify-center">
              <Radar className="w-9 h-9 text-indigo-500 animate-pulse stroke-[1.75]" />
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
            </div>
          )}
        </div>
      </div>

      {/* Main Headline */}
      <h3 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
        {message}
      </h3>

      {/* Subtitle / Explanation */}
      {description && (
        <p className="text-sm text-slate-500 max-w-md mt-2.5 leading-relaxed">
          {description}
        </p>
      )}

      {/* Status Pill Badge */}
      <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/60 text-slate-600 text-xs font-medium">
        <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        <span>First cron cycle in progress</span>
      </div>

      {/* Action Area with Disabled Button */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={disabledButton}
          onClick={onAction}
          className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
            disabledButton
              ? 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed select-none shadow-none opacity-90'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md shadow-indigo-200 active:scale-98'
          }`}
        >
          <Clock className="w-3.5 h-3.5 opacity-60" />
          <span>{buttonText}</span>
        </button>

        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.isLoading}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {secondaryAction.isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{secondaryAction.label}</span>
          </button>
        )}
      </div>
    </section>
  );
}
export default EmptyState;
