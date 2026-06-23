import AuditForm from './components/AuditForm';

export default function HomePage() {
  const patterns = [
    { name: 'SERP Trap',            color: '#f97316', desc: 'High impressions, low CTR' },
    { name: 'Intent Collision',     color: '#a855f7', desc: 'Wrong intent match' },
    { name: 'Invisible Converter',  color: '#3b82f6', desc: 'Converting page, no visibility' },
    { name: 'Leaky Funnel Entry',   color: '#eab308', desc: 'Traffic that never converts' },
    { name: 'Cannibalization',      color: '#ef4444', desc: 'Pages splitting keyword authority' },
  ];

  return (
    <main className="flex flex-col min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-900">
        <span className="text-sm font-bold text-white tracking-tight">NavFlow</span>
        <a href="/canvas" className="text-xs text-slate-500 hover:text-slate-300">
          View demo →
        </a>
      </nav>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs text-slate-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Now in alpha — Dallas AI Group #9
        </div>

        <h1 className="text-4xl font-bold text-white tracking-tight leading-tight max-w-2xl mb-4">
          See exactly where your customers get stuck
        </h1>

        <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-12">
          NavFlow correlates Search Console, GA4, and keyword data at the URL level — then maps
          your entire customer journey as an interactive canvas with AI-generated fix briefs.
        </p>

        <AuditForm />

        {/* Pattern strip */}
        <div className="flex flex-wrap justify-center gap-2 mt-16">
          {patterns.map(p => (
            <span
              key={p.name}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
              style={{ color: p.color, borderColor: p.color + '44', background: p.color + '12' }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: p.color }}
              />
              {p.name}
              <span className="text-slate-600 ml-1">— {p.desc}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-700 border-t border-slate-900">
        NavFlow · Dallas AI Group #9 · Built with Next.js, React Flow, FastAPI, Supabase
      </footer>
    </main>
  );
}
