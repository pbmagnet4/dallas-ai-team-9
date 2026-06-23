'use client';

import type { DataSource } from '@/types/navflow';
import { SOURCE_META } from '@/types/navflow';

// ── Source error card (inline in PipelineStatus) ──────────────────────────────

interface SourceErrorCardProps {
  source: DataSource;
  message?: string;
  onRetry?: () => void;
}

export function SourceErrorCard({ source, message, onRetry }: SourceErrorCardProps) {
  const meta = SOURCE_META[source];
  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-red-950 border border-red-900 rounded-lg">
      <div>
        <p className="text-xs font-semibold text-red-400">{meta.label} failed</p>
        <p className="text-xs text-red-300/70 mt-0.5 leading-relaxed">
          {message ?? 'Connection error — check credentials and retry.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-xs px-2.5 py-1 rounded border border-red-800 text-red-400 hover:border-red-600 hover:text-red-300 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ── Auth expired overlay (full-canvas) ───────────────────────────────────────

interface AuthExpiredOverlayProps {
  source: DataSource;
  onReconnect?: () => void;
}

export function AuthExpiredOverlay({ source, onReconnect }: AuthExpiredOverlayProps) {
  const meta = SOURCE_META[source];
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-8 py-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-950 border border-red-900 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-lg">⚠</span>
        </div>
        <h2 className="text-sm font-semibold text-slate-200 mb-2">
          {meta.label} session expired
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Your {meta.label} authorization has expired. Reconnect to resume the audit — no data will be lost.
        </p>
        {onReconnect ? (
          <button
            onClick={onReconnect}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Reconnect {meta.label}
          </button>
        ) : (
          <a
            href="/"
            className="block w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Reconnect {meta.label}
          </a>
        )}
      </div>
    </div>
  );
}
