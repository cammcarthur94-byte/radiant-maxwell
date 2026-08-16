'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Search,
  Globe2,
  Sparkles,
  BarChart3,
  FileText,
  MessageSquareCode,
  Radio,
  Link2,
  BookOpen,
  Settings,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TenantInfo } from '@/types/dashboard';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  aliases?: string[];
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
          aliases: ['/dashboard/overview'],
        },
        {
          href: '/dashboard/aeo',
          label: 'AEO Score',
          icon: Search,
          aliases: ['/dashboard/engines'],
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
          href: '/dashboard/models',
          label: 'Model Comparison',
          icon: BarChart3,
          aliases: ['/dashboard/competitors'],
        },
        {
          href: '/dashboard/citations',
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
          href: '/dashboard/benchmarks',
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
          href: '/dashboard/citation-analysis',
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

  const isItemActive = (item: SidebarItem) => {
    if (pathname === item.href) return true;
    if (item.href === '/dashboard' && pathname === '/dashboard/overview') return true;
    if (item.aliases && item.aliases.some((a) => pathname.startsWith(a))) return true;
    if (item.href !== '/dashboard' && pathname.startsWith(item.href)) return true;
    return false;
  };

  return (
    <aside
      className={`h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-18' : 'w-60'
      }`}
    >
      {/* Top Header: Brand & Company Selector */}
      <div className="p-4 border-b border-slate-100 flex-shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group ${
              collapsed ? 'justify-center p-1' : ''
            }`}
          >
            {/* Logo Badge */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              ⚡
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                  <span>{activeTenant?.name || 'Acme Corp'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  AI Visibility
                </div>
              </div>
            )}
          </button>

          {/* Tenant Dropdown */}
          {tenantDropdownOpen && !collapsed && availableTenants.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase font-mono">
                Switch Workspace
              </div>
              {availableTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => {
                    onTenantChange(tenant);
                    setTenantDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTenant?.id === tenant.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{tenant.name}</span>
                  {activeTenant?.id === tenant.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {navigationSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      active
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    {/* Active Accent Bar on the right edge if matching Figma */}
                    {active && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-l-full" />
                    )}

                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />

                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer: Alex Chen Profile Pill & Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0 space-y-2">
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-200/60 ${
            collapsed ? 'justify-center p-1.5' : ''
          }`}
        >
          {/* Avatar Initials */}
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
            AC
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">Alex Chen</div>
              <div className="text-[10px] text-slate-400 font-medium truncate">SEO Director</div>
            </div>
          )}
        </div>

        {/* Collapse Sidebar Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-xs"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
