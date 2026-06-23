'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SOURCES = [
  {
    key: 'gsc',
    label: 'Search Console',
    icon: '⬡',
    description: 'Impressions, clicks, position per URL',
    ready: false,
  },
  {
    key: 'ga4',
    label: 'GA4 Analytics',
    icon: '◈',
    description: 'Sessions, conversions, page flows',
    ready: false,
  },
  {
    key: 'dataforseo',
    label: 'DataForSEO',
    icon: '⬗',
    description: 'Keyword rankings and intent signals',
    ready: false,
  },
] as const;

export default function AuditForm() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Navigate to demo canvas — real audit trigger wired in Week 2
    setTimeout(() => router.push('/canvas'), 800);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
      {/* Domain input */}
      <div>
        <label htmlFor="domain" className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">
          Website domain
        </label>
        <div className="flex gap-2">
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Connect sources */}
      <div>
        <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Connect data sources</p>
        <div className="space-y-2">
          {SOURCES.map(src => (
            <div
              key={src.key}
              className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-600 text-sm">{src.icon}</span>
                <div>
                  <p className="text-sm text-slate-300">{src.label}</p>
                  <p className="text-xs text-slate-600">{src.description}</p>
                </div>
              </div>
              <button
                type="button"
                disabled
                title="OAuth verification pending — available soon"
                className="text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-600 cursor-not-allowed"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-2">
          OAuth verification in progress — connect buttons live soon.
        </p>
      </div>

      {/* CTA */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading audit…' : 'View Demo Audit →'}
      </button>

      <p className="text-xs text-center text-slate-600">
        Demo mode — opens a pre-built audit of Demo Site Co. with real behavioral data.
      </p>
    </form>
  );
}
