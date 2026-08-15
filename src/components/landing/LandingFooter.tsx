'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            V
          </div>
          <span className="font-semibold text-slate-800">Brand Visibility</span>
          <span className="text-slate-400">&bull;</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-slate-600 font-medium">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            App Dashboard
          </Link>
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Security & Compliance
          </a>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px]">All Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}
