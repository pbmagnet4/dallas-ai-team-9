'use client';

export type SourceStatus = 'idle' | 'running' | 'done' | 'error';

export interface PipelineState {
  gsc: SourceStatus;
  ga4: SourceStatus;
  dataforseo: SourceStatus;
  crawl4ai: SourceStatus;
}

const SOURCE_LABELS: Record<keyof PipelineState, string> = {
  gsc: 'Search Console',
  ga4: 'GA4 / BigQuery',
  dataforseo: 'DataForSEO',
  crawl4ai: 'Crawl4AI',
};

const STATUS_STYLES: Record<SourceStatus, { dot: string; text: string; label: string }> = {
  idle:    { dot: 'bg-slate-600',  text: 'text-slate-400', label: 'Waiting' },
  running: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-300', label: 'Running' },
  done:    { dot: 'bg-green-500',  text: 'text-green-400', label: 'Done' },
  error:   { dot: 'bg-red-500',    text: 'text-red-400',   label: 'Error' },
};

interface PipelineStatusProps {
  state: PipelineState;
  className?: string;
}

export default function PipelineStatus({ state, className = '' }: PipelineStatusProps) {
  const sources = Object.entries(state) as [keyof PipelineState, SourceStatus][];
  const allDone = sources.every(([, s]) => s === 'done');
  const hasError = sources.some(([, s]) => s === 'error');
  const anyRunning = sources.some(([, s]) => s === 'running');

  const headerLabel = allDone
    ? 'Data ready'
    : hasError
    ? 'Pipeline error'
    : anyRunning
    ? 'Ingesting data…'
    : 'Connecting sources';

  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Data Pipeline</span>
        <span className={`text-xs ${allDone ? 'text-green-400' : hasError ? 'text-red-400' : 'text-slate-400'}`}>
          {headerLabel}
        </span>
      </div>
      <div className="space-y-2">
        {sources.map(([key, status]) => {
          const styles = STATUS_STYLES[status];
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">{SOURCE_LABELS[key]}</span>
              <span className={`flex items-center gap-1.5 text-xs ${styles.text}`}>
                <span className={`inline-block w-2 h-2 rounded-full ${styles.dot}`} />
                {styles.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
