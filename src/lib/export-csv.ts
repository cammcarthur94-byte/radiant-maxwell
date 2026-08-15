/**
 * Utility to convert tabular prompt & citation analytics data into CSV format and trigger browser download.
 */

export interface ExportablePromptData {
  query?: string;
  prompt?: string;
  rank?: string | number;
  brandRank?: string | number;
  mentionRank?: string | number;
  engine?: string;
  aiEngine?: string;
  ai_platform?: string;
  date?: string;
  lastTracked?: string;
  captured_at?: string;
  created_at?: string;
  category?: string;
  queryIntent?: 'Brand' | 'Product' | 'Competitor' | string;
  citationsCount?: number;
  citations?: number | string[];
  status?: string;
  [key: string]: any;
}

export interface CsvColumnMapping {
  key: string;
  label: string;
  format?: (value: any, row: ExportablePromptData) => string;
}

/**
 * Escapes a cell value conforming to RFC 4180 CSV standard
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // If the string contains comma, newline, or double-quotes, enclose in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

const DEFAULT_CSV_COLUMNS: CsvColumnMapping[] = [
  {
    key: 'query',
    label: 'Prompts',
    format: (val, row) => row.query || row.prompt || row.targetQuery || 'Untitled Prompt',
  },
  {
    key: 'queryIntent',
    label: 'Query Intent',
    format: (val, row) => row.queryIntent || row.category || 'Brand',
  },
  {
    key: 'rank',
    label: 'Rank',
    format: (val, row) => {
      const r = row.brandRank || row.mentionRank || row.rank;
      if (r === null || r === undefined) return 'N/A';
      return String(r).startsWith('#') ? String(r) : `#${r}`;
    },
  },
  {
    key: 'engine',
    label: 'AI Engine',
    format: (val, row) => {
      const eng = row.engine || row.aiEngine || row.ai_platform;
      if (!eng) return 'Google Gemini';
      if (eng === 'gemini') return 'Google Gemini';
      if (eng === 'chatgpt') return 'ChatGPT Search';
      if (eng === 'perplexity') return 'Perplexity Pro';
      if (eng === 'copilot') return 'Microsoft Copilot';
      return eng;
    },
  },
  {
    key: 'date',
    label: 'Date',
    format: (val, row) => {
      const rawDate = row.lastTracked || row.date || row.captured_at || row.created_at;
      if (!rawDate) return new Date().toISOString().split('T')[0];
      if (rawDate.includes('T')) {
        return rawDate.split('T')[0];
      }
      return rawDate;
    },
  },
  {
    key: 'citationsCount',
    label: 'Citations',
    format: (val, row) => {
      if (Array.isArray(row.citations)) return String(row.citations.length);
      return String(row.citationsCount ?? row.citations ?? 0);
    },
  },
];

/**
 * Converts array of prompt records into CSV string and triggers a browser download.
 *
 * @param data Array of prompt items / citation analytics records
 * @param filename Custom download filename (default: `brand-prompts-export-YYYY-MM-DD.csv`)
 * @param customColumns Optional custom column definitions
 */
export function exportToCsv(
  data: ExportablePromptData[],
  filename?: string,
  customColumns?: CsvColumnMapping[]
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const columns = customColumns && customColumns.length > 0 ? customColumns : DEFAULT_CSV_COLUMNS;

  // Build CSV Header line
  const headerLine = columns.map((col) => escapeCsvCell(col.label)).join(',');

  // Build CSV Data rows
  const rowLines = (data || []).map((row) => {
    return columns
      .map((col) => {
        const rawValue = col.format ? col.format(row[col.key], row) : row[col.key];
        return escapeCsvCell(rawValue);
      })
      .join(',');
  });

  const csvContent = [headerLine, ...rowLines].join('\r\n');

  // Create Blob with UTF-8 BOM for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const finalFilename =
    filename ||
    `prompts-export-${new Date().toISOString().split('T')[0]}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up Object URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
