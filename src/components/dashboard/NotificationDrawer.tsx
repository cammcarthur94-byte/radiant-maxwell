'use client';

import React from 'react';
import { X, Bell, CheckCheck, Sparkles, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: '1',
      title: 'Prompt Limit Warning',
      message: 'You have utilized 94% of your tracked prompts quota for this billing cycle.',
      time: '10m ago',
      type: 'warning',
    },
    {
      id: '2',
      title: 'New AIO Engine Detected',
      message: 'Perplexity Sonar 3.0 model benchmarks were added to your dashboard.',
      time: '1h ago',
      type: 'info',
    },
    {
      id: '3',
      title: 'Citation Opportunity Alert',
      message: '3 top high-authority domain gaps discovered for "enterprise visual CMS".',
      time: '4h ago',
      type: 'success',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
                <p className="text-[11px] text-slate-400">System alerts & AIO monitoring events</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 text-indigo-600 font-semibold hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
          <span className="text-slate-400 text-[11px]">3 unread</span>
        </div>
      </div>
    </div>
  );
}
