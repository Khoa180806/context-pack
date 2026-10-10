import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Context Pack — Deterministic Context Slicing for AI Coding Agents',
  description:
    'Extract and pack the highest-value source code slices under a strict token budget. Cut inference costs by 75% with zero-WASM pure JS deterministic context packing.',
  keywords: [
    'AI agent context',
    'token budget',
    'codebase slicing',
    'tiktoken',
    'LLM prompt optimization',
    'context pack',
    'ai-context-pack',
    'Claude Code',
    'Cursor',
  ],
  authors: [{ name: 'Khoa180806' }],
  creator: 'Khoa180806',
  metadataBase: new URL('https://context-pack.vercel.app'),
  openGraph: {
    title: 'Context Pack — Deterministic Context Slicing for AI Coding Agents',
    description:
      'Extract and pack highest-value code slices under a token budget. 75% token reduction, zero WASM, 100% in-browser privacy.',
    url: 'https://context-pack.vercel.app',
    siteName: 'Context Pack',
    images: [
      {
        url: '/system-architecture.png',
        width: 1200,
        height: 630,
        alt: 'Context Pack Architecture & Visual Playground',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Context Pack — Deterministic Context Slicing for AI Coding Agents',
    description:
      'Extract and pack highest-value code slices under a token budget. 75% token reduction, zero WASM, 100% in-browser privacy.',
    images: ['/system-architecture.png'],
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090D16] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
