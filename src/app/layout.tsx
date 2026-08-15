import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brand Visibility & AI Overview Optimization (AIO) SaaS',
  description: "Monitor your brand's AI visibility, citations, and competitive positioning across ChatGPT, Perplexity, Gemini, and Copilot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
