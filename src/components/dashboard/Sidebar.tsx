'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquareCode,
  Globe2,
  Link2,
  FileText,
  Search,
  Sparkles,
  Radio,
  BarChart3,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  LayoutGrid,
  Bot,
  Layers,
} from 'lucide-react';
import { TenantInfo } from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  activeTenant: TenantInfo;
  onTenantChange: (tenant: TenantInfo) => void;
  availableTenants?: TenantInfo[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenUpgradeModal: () => void;
}

export function Sidebar({
  activeTenant,
  onTenantChange,
  availableTenants = [],
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

  const navigationSections: SidebarSection[] = [
    {
      title: 'ANALYTICS',
      items: [
        {
          href: '/dashboard',
          label: 'Overview',
          icon: LayoutGrid,
        },
        {
          href: '/dashboard/engines',
          label: 'AEO Score',
          icon: Search,
        },
        {
          href: '/dashboard/geo',
          label: 'GEO Score',
          icon: Globe2,
        },
        {
          href: '/dashboard/aio',
          label: 'AIO Score',
          icon: Sparkles,
        },
        {
          href: '/dashboard/competitors',
          label: 'Model Comparison',
          icon: BarChart3,
        },
        {
          href: '/dashboard/sources',
          label: 'Citations',
          icon: FileText,
        },
        {
          href: '/dashboard/prompts',
          label: 'Prompts',
          icon: MessageSquareCode,
        },
      ],
    },
    {
      title: 'COMPETITIVE INTELLIGENCE',
      items: [
        {
          href: '/dashboard/share-of-voice',
          label: 'Share of Voice',
          icon: Radio,
        },
        {
          href: '/dashboard/competitors',
          label: 'Analysis and Benchmarks',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'SOURCE INTELLIGENCE',
      items: [
        {
          href: '/dashboard/sources',
          label: 'Top Domains',
          icon: Link2,
        },
        {
          href: '/dashboard/engines',
          label: 'Citation Analysis',
          icon: BookOpen,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          href: '/dashboard/settings',
          label: 'Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-100 transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-18' : 'w-60'
      }`}
    >
      {/* Workspace Brand Header */}
      <div className="p-4 border-b border-slate-100/80 flex items-center justify-between">
        {!collapsed ? (
          <div className="relative w-full">
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center space-x-3 truncate">
                {/* Brand Radiant Icon Box */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3a9 9 0 0 1 9 9" />
                    <path d="M12 7a5 5 0 0 1 5 5" />
                    <circle cx="12" cy="12" r="1.5" />
                  </svg>
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span className="truncate">{activeTenant.name || 'Acme Corp'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">AI Visibility</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 ml-1" />
            </button>

            {/* Tenant Dropdown */}
            {tenantDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Workspace
                </div>
                {availableTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => {
                      onTenantChange(tenant);
                      setTenantDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTenant.id === tenant.id
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${tenant.logoBg}`}
                      >
                        {tenant.logoText}
                      </div>
                      <span className="truncate">{tenant.name}</span>
                    </div>
                    {activeTenant.id === tenant.id && <Check className="w-3.5 h-3.5 text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 1 9 9" />
                <path d="M12 7a5 5 0 0 1 5 5" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Section List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-2 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </span>
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                
                // Determine active state cleanly
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : item.href === '/dashboard/aio'
                    ? pathname === '/dashboard/aio' || pathname === '/dashboard/overview'
                    : pathname === item.href;

                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#f0f3ff] text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate leading-none">{item.label}</span>
                      )}
                    </div>

                    {/* Right Active Accent Bar Pill */}
                    {isActive && !collapsed && (
                      <span className="w-1 h-5 rounded-full bg-indigo-600 absolute right-2.5 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5 truncate w-full">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              AC
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate">Alex Chen</div>
              <div className="text-[10px] text-slate-400 truncate">SEO Director</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center">
              AC
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
