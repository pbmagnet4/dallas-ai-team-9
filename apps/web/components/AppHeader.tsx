interface AppHeaderProps {
  auditName?: string;
  auditDate?: string;
}

export default function AppHeader({
  auditName = 'Demo Site Co.',
  auditDate = 'Jun 2026',
}: AppHeaderProps) {
  return (
    <header className="flex-shrink-0 h-12 bg-slate-950 border-b border-slate-800 flex items-center px-5 gap-4">
      <span className="text-sm font-bold text-white tracking-tight">NavFlow</span>
      <span className="text-slate-700 text-xs">|</span>
      <span className="text-xs text-slate-400 font-mono">{auditName}</span>
      <span className="text-slate-700 text-xs">·</span>
      <span className="text-xs text-slate-600">{auditDate}</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-slate-600">v0.1.0-alpha</span>
      </div>
    </header>
  );
}
