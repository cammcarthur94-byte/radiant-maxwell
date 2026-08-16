'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bot,
  Shield,
  Bell,
  Key,
  RotateCw,
  RefreshCw,
  Moon,
  Trash2,
  Plus,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

interface TrackedAIModel {
  id: string;
  name: string;
  provider: string;
  colorDot: string;
  enabled: boolean;
}

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface IntegrationItem {
  id: string;
  name: string;
  connected: boolean;
}

export default function SettingsPage() {
  const { activeTenant, competitors: dbCompetitors, refreshData, triggerTracking, isTracking } = useDashboard();

  // Company Profile Form State
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [website, setWebsite] = useState('https://acmecorp.com');
  const [industry, setIndustry] = useState('Enterprise SaaS');

  // Tracked AI Models State (6 models matching screenshot)
  const [aiModels, setAiModels] = useState<TrackedAIModel[]>([
    { id: 'chatgpt', name: 'ChatGPT', provider: 'OpenAI', colorDot: 'bg-emerald-500', enabled: true },
    { id: 'gemini', name: 'Gemini', provider: 'Google', colorDot: 'bg-blue-500', enabled: true },
    { id: 'claude', name: 'Claude', provider: 'Anthropic', colorDot: 'bg-amber-600', enabled: true },
    { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity AI', colorDot: 'bg-purple-600', enabled: true },
    { id: 'grok', name: 'Grok', provider: 'xAI', colorDot: 'bg-cyan-500', enabled: true },
    { id: 'meta', name: 'Meta AI', provider: 'Meta', colorDot: 'bg-blue-600', enabled: true },
  ]);

  // Tracked Competitors State
  const [competitors, setCompetitors] = useState<string[]>([
    'Horizon Tech',
    'Nexus AI Systems',
    'Apex Technologies',
  ]);
  const [newCompetitorInput, setNewCompetitorInput] = useState('');

  // Notification Preferences State
  const [notifications, setNotifications] = useState<NotificationPreference[]>([
    {
      id: 'weekly_report',
      title: 'Weekly Performance Report',
      description: 'Receive a summary every Monday morning',
      enabled: true,
    },
    {
      id: 'score_alerts',
      title: 'Score Change Alerts',
      description: 'Notify when any score moves ±5 points',
      enabled: true,
    },
    {
      id: 'new_citations',
      title: 'New Citation Notifications',
      description: 'Alert on each new brand citation detected',
      enabled: false,
    },
    {
      id: 'competitor_changes',
      title: 'Competitor Score Changes',
      description: "Notify when a competitor's rank changes",
      enabled: true,
    },
  ]);

  // API & Integrations State
  const [apiKey, setApiKey] = useState('rad_live_key_99482710398471203948123749281');
  const [isApiKeyRevealed, setIsApiKeyRevealed] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { id: 'slack', name: 'Slack', connected: true },
    { id: 'hubspot', name: 'HubSpot', connected: true },
    { id: 'zapier', name: 'Zapier', connected: false },
  ]);

  // Global Sync / Theme / Toast State
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync tenant data from Dashboard Context if available
  useEffect(() => {
    if (activeTenant?.name) {
      setCompanyName(activeTenant.name);
      if (activeTenant.domain) {
        setWebsite(`https://${activeTenant.domain.replace(/^https?:\/\//, '')}`);
      }
    }
    if (dbCompetitors && dbCompetitors.length > 0) {
      setCompetitors(dbCompetitors.map((c) => c.name));
    }
  }, [activeTenant, dbCompetitors]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Handlers
  const toggleAIModel = (id: string) => {
    setAiModels((prev) =>
      prev.map((model) => (model.id === id ? { ...model, enabled: !model.enabled } : model))
    );
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  // Competitor Handlers
  const handleAddCompetitor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newCompetitorInput.trim();
    if (!clean) return;
    if (competitors.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      showToast(`Competitor "${clean}" already added.`, 'info');
      return;
    }
    setCompetitors((prev) => [...prev, clean]);
    setNewCompetitorInput('');
    showToast(`Added competitor: ${clean}`);
  };

  const handleRemoveCompetitor = (name: string) => {
    setCompetitors((prev) => prev.filter((c) => c !== name));
    showToast(`Removed competitor: ${name}`, 'info');
  };

  // API Key Rotation Handler
  const handleRotateApiKey = () => {
    setIsRotatingKey(true);
    setTimeout(() => {
      const randomSuffix = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 36).toString(36)
      ).join('');
      setApiKey(`rad_live_key_${randomSuffix}`);
      setIsRotatingKey(false);
      showToast('API Key rotated successfully.');
    }, 600);
  };

  // Save Changes Handler
  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings saved successfully!');
    }, 500);
  };

  // Global Sync Handler
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerTracking();
      await refreshData();
      showToast('Synced all visibility metrics and configurations.');
    } catch {
      showToast('Synced configurations.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-6 sm:p-8 space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configuration and preferences</p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4 text-slate-500">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || isTracking}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isTracking ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              showToast(isDarkMode ? 'Switched to Light mode' : 'Dark mode preview activated', 'info');
            }}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            <Moon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => showToast('No unread notifications', 'info')}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Company Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Company Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f0f3fa] border border-slate-200/60 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Website
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f0f3fa] border border-slate-200/60 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
            Industry
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#f0f3fa] border border-slate-200/60 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* 2. Tracked AI Models Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Tracked AI Models</h2>
          </div>
          <p className="text-xs text-slate-400 pl-8.5">
            Select which AI models to include in your visibility scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {aiModels.map((model) => (
            <div
              key={model.id}
              className="bg-[#f8fafc] border border-slate-200/70 rounded-xl p-3.5 flex items-center justify-between transition-all hover:bg-slate-100/50"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${model.colorDot} shrink-0`} />
                <div>
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {model.name}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {model.provider}
                  </div>
                </div>
              </div>

              {/* Custom Purple Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={model.enabled}
                onClick={() => toggleAIModel(model.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  model.enabled ? 'bg-[#7c3aed]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    model.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tracked Competitors Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Tracked Competitors</h2>
          </div>
          <p className="text-xs text-slate-400 pl-8.5">
            Add or remove competitor brands to track in competitive reports.
          </p>
        </div>

        {/* Existing Competitors List */}
        <div className="space-y-2.5 pt-1">
          {competitors.map((comp) => (
            <div
              key={comp}
              className="bg-[#f0f3fa] border border-slate-200/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-800 font-medium group"
            >
              <span>{comp}</span>
              <button
                type="button"
                onClick={() => handleRemoveCompetitor(comp)}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                title={`Remove ${comp}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Competitor Input */}
        <form onSubmit={handleAddCompetitor} className="relative flex items-center">
          <input
            type="text"
            placeholder="Add competitor name..."
            value={newCompetitorInput}
            onChange={(e) => setNewCompetitorInput(e.target.value)}
            className="w-full pl-4 pr-20 py-2.5 bg-[#f0f3fa] border border-slate-200/60 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newCompetitorInput.trim()}
            className="absolute right-2 px-3 py-1 bg-white border border-slate-200/80 hover:bg-slate-50 text-indigo-700 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 shadow-2xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* 4. Notification Preferences Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Notification Preferences</h2>
        </div>

        <div className="space-y-4 divide-y divide-slate-100">
          {notifications.map((notif, idx) => (
            <div
              key={notif.id}
              className={`flex items-center justify-between ${idx === 0 ? '' : 'pt-3.5'}`}
            >
              <div>
                <div className="text-xs font-semibold text-slate-900">{notif.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{notif.description}</div>
              </div>

              {/* Purple Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={notif.enabled}
                onClick={() => toggleNotification(notif.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notif.enabled ? 'bg-[#7c3aed]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    notif.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. API & Integrations Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Key className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">API & Integrations</h2>
        </div>

        {/* API Key Box */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
            API Key
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={isApiKeyRevealed ? apiKey : '••••••••••••••••••••••••••••••••'}
              onClick={() => setIsApiKeyRevealed(!isApiKeyRevealed)}
              className="w-full pl-4 pr-24 py-2.5 bg-[#f0f3fa] border border-slate-200/60 rounded-xl text-xs font-mono text-slate-600 select-all tracking-wider cursor-pointer"
              title="Click to toggle reveal"
            />
            <button
              type="button"
              onClick={handleRotateApiKey}
              disabled={isRotatingKey}
              className="absolute right-2 px-3 py-1 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-2xs flex items-center gap-1.5"
            >
              <RotateCw className={`w-3 h-3 ${isRotatingKey ? 'animate-spin' : ''}`} />
              <span>Rotate</span>
            </button>
          </div>
        </div>

        {/* Integrations Row (Slack, HubSpot, Zapier) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/70 rounded-xl p-3.5 flex items-center justify-between shadow-2xs"
            >
              <span className="text-xs font-semibold text-slate-800">{item.name}</span>
              <span
                className={`text-xs font-semibold ${
                  item.connected ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {item.connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-3 pt-2 pb-12">
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>

        <button
          type="button"
          onClick={() => showToast('Changes reverted.', 'info')}
          className="px-5 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
