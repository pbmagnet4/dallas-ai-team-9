import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NavFlow — Customer Journey Intelligence',
  description: 'See where customers get stuck. NavFlow correlates GSC, GA4, and keyword data into an interactive journey map with AI action briefs.',
};

// Runs synchronously before first paint — prevents flash of wrong theme
const themeScript = `(function(){try{var t=localStorage.getItem('navflow-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
        {children}
      </body>
    </html>
  );
}
