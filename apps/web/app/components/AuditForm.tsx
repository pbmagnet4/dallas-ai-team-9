'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditForm() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Redirects to demo canvas — real audit creation wired in Week 2
    setTimeout(() => router.push('/canvas'), 600);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Domain input */}
      <div className="space-y-2">
        <label htmlFor="domain" className="block text-xs text-slate-500 font-mono">
          Website domain
        </label>
        <input
          id="domain"
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="yourdomain.com"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-slate-500 focus:bg-slate-800 font-mono transition-colors"
        />
      </div>

      {/* Connect sources (pending) */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 mt-1" />
        <div>
          <p className="text-xs text-slate-400">OAuth verification pending</p>
          <p className="text-xs text-slate-600 mt-0.5">
            GSC and GA4 connect buttons live once Nithin's OAuth app clears verification.
            The demo below uses real behavioral data.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
      >
        {loading
          ? <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-slate-950 animate-spin" />
              Loading audit…
            </span>
          : 'Run Demo Audit →'}
      </button>

      <p className="text-xs text-center text-slate-700">
        Opens a pre-built audit of Demo Site Co.
      </p>
    </form>
  );
}
