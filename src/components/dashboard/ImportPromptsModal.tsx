'use client';

import React, { useState, useRef, useId } from 'react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export interface ImportedPromptItem {
  id: string;
  query: string;
  category: string;
  engine: string;
  frequency: string;
  brandRank?: string;
  citationsCount?: number;
  lastTracked?: string;
  status?: string;
}

interface ImportPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: ImportedPromptItem[]) => void;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Commercial Intent': ['best', 'top', 'buy', 'pricing', 'cost', 'review', 'vendor', 'platform', 'tool', 'software'],
  'Enterprise SaaS': ['enterprise', 'compliance', 'soc2', 'security', 'scale', 'architecture', 'crm', 'erp'],
  'Competitor Benchmark': ['vs', 'versus', 'alternative', 'compared to', 'difference between'],
  'How-To / Informational': ['how to', 'guide', 'tutorial', 'steps', 'integrate', 'implement', 'what is'],
  'Product Evaluation': ['features', 'pros and cons', 'capabilities', 'benchmark', 'testing'],
};

function autoDetectCategory(query: string): string {
  const lower = query.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return 'General Discovery';
}

export function ImportPromptsModal({
  isOpen,
  onClose,
  onImport,
}: ImportPromptsModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ImportedPromptItem[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [defaultEngine, setDefaultEngine] = useState('Google Gemini & Perplexity');
  const [defaultFrequency, setDefaultFrequency] = useState('Daily');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseCsvText = (text: string): ImportedPromptItem[] => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Check if line 1 is header
    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes('query') ||
      firstLine.includes('prompt') ||
      firstLine.includes('keyword') ||
      firstLine.includes('topic');

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const items: ImportedPromptItem[] = [];

    dataLines.forEach((line, index) => {
      // Split by comma or tab, taking quotes into account
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const matches: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index === regex.lastIndex) regex.lastIndex++;
        let val = match[1] || '';
        val = val.replace(/^"|"$/g, '').trim();
        if (val) matches.push(val);
      }

      const query = (matches[0] || line).trim();
      if (!query) return;

      const category = matches[1] || autoDetectCategory(query);
      const engine = matches[2] || defaultEngine;
      const frequency = matches[3] || defaultFrequency;

      items.push({
        id: `import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        query,
        category,
        engine,
        frequency,
        brandRank: '#1',
        citationsCount: Math.floor(Math.random() * 5) + 2,
        lastTracked: 'Pending Audit',
        status: 'Active',
      });
    });

    return items;
  };

  const parseJsonText = (text: string): ImportedPromptItem[] => {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data.prompts || data.queries || [];
    if (!Array.isArray(list)) throw new Error('Expected JSON array of prompts or queries');

    return list.map((entry, index) => {
      const query = typeof entry === 'string' ? entry : entry.query || entry.prompt || entry.keyword;
      if (!query || typeof query !== 'string') return null;

      const category = (typeof entry === 'object' && entry.category) || autoDetectCategory(query);
      const engine = (typeof entry === 'object' && entry.engine) || defaultEngine;
      const frequency = (typeof entry === 'object' && entry.frequency) || defaultFrequency;

      return {
        id: `import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        query: query.trim(),
        category,
        engine,
        frequency,
        brandRank: '#1',
        citationsCount: Math.floor(Math.random() * 5) + 2,
        lastTracked: 'Pending Audit',
        status: 'Active',
      };
    }).filter(Boolean) as ImportedPromptItem[];
  };

  const parseRawLines = (text: string): ImportedPromptItem[] => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return lines.map((line, index) => ({
      id: `import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      query: line.replace(/^[\d\.\-\*\+]\s*/, '').trim(),
      category: autoDetectCategory(line),
      engine: defaultEngine,
      frequency: defaultFrequency,
      brandRank: '#1',
      citationsCount: Math.floor(Math.random() * 5) + 2,
      lastTracked: 'Pending Audit',
      status: 'Active',
    })).filter((item) => item.query.length > 0);
  };

  const processFileContent = (content: string, name: string) => {
    setParsingError(null);
    try {
      let items: ImportedPromptItem[] = [];
      const lowerName = name.toLowerCase();

      if (lowerName.endsWith('.json')) {
        items = parseJsonText(content);
      } else if (lowerName.endsWith('.csv')) {
        items = parseCsvText(content);
      } else {
        // Plain text or CSV-like
        if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
          try {
            items = parseJsonText(content);
          } catch {
            items = parseCsvText(content);
          }
        } else if (content.includes(',')) {
          items = parseCsvText(content);
        } else {
          items = parseRawLines(content);
        }
      }

      if (items.length === 0) {
        setParsingError('No valid search prompts found in the imported file.');
      } else {
        setFileName(name);
        setParsedItems(items);
      }
    } catch (err: any) {
      setParsingError(`File parsing failed: ${err.message || 'Invalid format'}`);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessPaste = () => {
    if (!pasteText.trim()) return;
    setParsingError(null);
    try {
      let items: ImportedPromptItem[] = [];
      const text = pasteText.trim();
      if (text.startsWith('[') || text.startsWith('{')) {
        items = parseJsonText(text);
      } else if (text.includes(',') || text.includes('\t')) {
        items = parseCsvText(text);
      } else {
        items = parseRawLines(text);
      }

      if (items.length === 0) {
        setParsingError('No valid prompts detected from pasted text.');
      } else {
        setFileName(`pasted-queries-${items.length}.txt`);
        setParsedItems(items);
      }
    } catch (err: any) {
      setParsingError(`Parsing error: ${err.message}`);
    }
  };

  const handleRemoveItem = (id: string) => {
    setParsedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItemCategory = (id: string, newCat: string) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category: newCat } : item))
    );
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;
    onImport(parsedItems);
    onClose();
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'query,category,engine,frequency\n' +
      '"best brand visibility intelligence platforms","Commercial Intent","Google Gemini & Perplexity","Daily"\n' +
      '"top enterprise AI overview tracking tools","Enterprise SaaS","Google Gemini & ChatGPT","Daily"\n' +
      '"how to monitor conversational AI citations","How-To / Informational","Google Gemini & Copilot","Weekly"\n' +
      '"top enterprise CRM solution benchmark","Competitor Benchmark","ChatGPT & Perplexity","Daily"';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-target-prompts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleJson = () => {
    const jsonContent = JSON.stringify(
      [
        {
          query: 'best brand visibility intelligence platforms',
          category: 'Commercial Intent',
          engine: 'Google Gemini & Perplexity',
          frequency: 'Daily',
        },
        {
          query: 'top enterprise AI overview tracking tools',
          category: 'Enterprise SaaS',
          engine: 'Google Gemini & ChatGPT',
          frequency: 'Daily',
        },
        {
          query: 'top enterprise CRM solution benchmark',
          category: 'Competitor Benchmark',
          engine: 'ChatGPT & Perplexity',
          frequency: 'Weekly',
        },
      ],
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-target-prompts.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Import Target Search Prompts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk upload conversational queries via CSV, TXT, JSON, or direct paste.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Step 1: Input method tabs if not parsed yet */}
          {parsedItems.length === 0 ? (
            <>
              {/* Tab selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Upload File (.csv, .txt, .json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'paste'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Direct Paste (One per line)</span>
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    dragOver
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Click to browse or drop your file here
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Supports <span className="font-semibold text-slate-700">.CSV</span> with query & category columns, <span className="font-semibold text-slate-700">.TXT</span> line-by-line, or <span className="font-semibold text-slate-700">.JSON</span> arrays.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    placeholder="Paste queries here (one per line):&#10;best enterprise CRM with SOC2&#10;top AI search visibility software&#10;top brand vs competitor comparison"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!pasteText.trim()}
                      onClick={handleProcessPaste}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Process Pasted Queries</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sample format downloads */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Need an example file format?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadSampleCsv}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Sample CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadSampleJson}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Sample JSON</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Step 2: Preview & Validation Table */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Successfully parsed <strong className="font-bold">{parsedItems.length}</strong> target queries from <span className="font-mono text-emerald-900">{fileName}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedItems([]);
                    setFileName(null);
                    setPasteText('');
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Search Query</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-slate-900 max-w-xs truncate">
                            {item.query}
                          </td>
                          <td className="px-4 py-2.5">
                            <select
                              value={item.category}
                              onChange={(e) => handleUpdateItemCategory(item.id, e.target.value)}
                              className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="Commercial Intent">Commercial Intent</option>
                              <option value="Enterprise SaaS">Enterprise SaaS</option>
                              <option value="Competitor Benchmark">Competitor Benchmark</option>
                              <option value="How-To / Informational">How-To / Informational</option>
                              <option value="Product Evaluation">Product Evaluation</option>
                              <option value="General Discovery">General Discovery</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Discard from import"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {parsingError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{parsingError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Cancel
          </button>

          {parsedItems.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {parsedItems.length} Prompts to Library</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
