export default function DemoBanner() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (!isDemo) return null;

  return (
    <div className="flex-shrink-0 bg-amber-950 border-b border-amber-800 px-5 py-1.5 flex items-center gap-3">
      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Demo</span>
      <span className="text-xs text-amber-300/70">
        Pre-cached audit data — Demo Site Co. · Jun 2026. No live API calls.
      </span>
      <a
        href="/"
        className="ml-auto text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
      >
        Connect your site →
      </a>
    </div>
  );
}
