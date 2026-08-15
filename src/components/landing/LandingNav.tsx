'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Sparkles, Bot, ShieldCheck } from 'lucide-react';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 transition-colors flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/20">
            V
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Brand Visibility
            </span>
            <span className="ml-1.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
              AIO SaaS
            </span>
          </div>
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">
            Features
          </a>
          <a href="#engines" className="hover:text-indigo-600 transition-colors">
            Supported Engines
          </a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">
            Pricing
          </a>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <span>Live Demo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </Link>
        </div>

        {/* Right: Auth Buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20 active:scale-98"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-5 space-y-4 animate-in fade-in">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#engines"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600"
            >
              Supported Engines
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600"
            >
              Pricing
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-indigo-600"
            >
              Live Demo App
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="w-full text-center py-2.5 rounded-xl bg-indigo-600 font-semibold text-xs text-white hover:bg-indigo-700 shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
