import AuditForm from './components/AuditForm';
import { PATTERN_META } from '@/types/navflow';
import type { IssuePattern } from '@/types/navflow';

const PATTERN_ORDER: IssuePattern[] = [
  'SERP_TRAP',
  'INTENT_COLLISION',
  'INVISIBLE_CONVERTER',
  'LEAKY_FUNNEL_ENTRY',
  'KEYWORD_CANNIBALIZATION_DRAIN',
];

const SOURCES = [
  { label: 'Search Console', color: '#4ade80' },
  { label: 'GA4',            color: '#60a5fa' },
  { label: 'DataForSEO',     color: '#f59e0b' },
  { label: 'Crawl4AI',       color: '#a78bfa' },
];

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-950 dot-grid">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800/60 animate-fade-in">
        <span className="text-sm font-bold text-white tracking-tight font-mono">NavFlow</span>
        <div className="flex items-center gap-5">
          <span className="text-xs text-slate-600">Dallas AI Group · #9</span>
          <a
            href="/canvas"
            className="text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
          >
            View demo →
          </a>
        </div>
      </nav>

      {/* Hero: two-column split */}
      <div className="flex flex-1 flex-col lg:flex-row">

        {/* Left — Hero */}
        <div className="flex flex-col justify-center px-10 py-20 lg:px-16 lg:py-0 lg:w-[55%] xl:pl-24">

          {/* Alpha badge */}
          <div className="inline-flex items-center gap-2 mb-10 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-slate-500 font-mono">ALPHA · Live demo available</span>
          </div>

          {/* Headline */}
          <h1
            className="font-black text-white leading-[0.92] tracking-tight animate-fade-up stagger-1 text-wrap-balance"
            style={{ fontSize: 'clamp(52px, 7vw, 88px)' }}
          >
            Find every leak
            <br />
            <span className="text-slate-500">in your customer</span>
            <br />
            journey.
          </h1>

          {/* Sub */}
          <p className="mt-8 text-base text-slate-400 leading-relaxed max-w-md animate-fade-up stagger-2">
            NavFlow cross-references Search Console, GA4, and keyword rankings at the URL
            level — then generates AI fix briefs for every broken path.
          </p>

          {/* Sources row */}
          <div className="flex flex-wrap items-center gap-3 mt-10 animate-fade-up stagger-3">
            <span className="text-xs text-slate-600 mr-1">Data from</span>
            {SOURCES.map(s => (
              <span
                key={s.label}
                className="text-xs font-mono px-2.5 py-1 rounded border"
                style={{ color: s.color, borderColor: s.color + '40', background: s.color + '10' }}
              >
                {s.label}
              </span>
            ))}
          </div>

          {/* Issue pattern strip */}
          <div className="flex flex-wrap gap-2 mt-12 animate-fade-up stagger-4">
            {PATTERN_ORDER.map(p => {
              const meta = PATTERN_META[p];
              return (
                <span
                  key={p}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded"
                  style={{ color: meta.color, background: meta.bg }}
                >
                  <span
                    style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }}
                  />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Divider (desktop) */}
        <div className="hidden lg:block w-px bg-slate-800 self-stretch my-8" />

        {/* Right — Form */}
        <div className="flex flex-col justify-center px-10 py-20 lg:px-16 lg:py-0 lg:w-[45%] xl:pr-24 animate-fade-up stagger-2">
          <p className="text-xs text-slate-600 font-mono uppercase tracking-widest mb-6">Run an audit</p>
          <AuditForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 px-8 text-xs text-slate-700 border-t border-slate-800/60 flex items-center justify-between">
        <span>NavFlow — Customer Journey Intelligence</span>
        <span>Next.js · React Flow · FastAPI · Supabase</span>
      </footer>
    </main>
  );
}
