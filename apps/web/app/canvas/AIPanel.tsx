'use client';

import { useState, useRef, useEffect } from 'react';
import { X, SendHorizontal, Sparkles, Zap, ArrowRight, GitBranch, CheckCircle2 } from 'lucide-react';
import type { FixPlan, FixPlanStep, FixPlanStepKind } from '@/types/navflow';

type HealthFilter = 'all' | 'critical' | 'leaking' | 'opportunity' | 'healthy';

interface Message {
  role: 'user' | 'assistant';
  text?: string;
  command?: { type: 'filter'; filter: HealthFilter };
  fixPlan?: FixPlan;
}

interface AIPanelProps {
  onClose: () => void;
  currentFilter: HealthFilter;
  onCommand: (cmd: { type: 'filter'; filter: HealthFilter }) => void;
}

const SUGGESTED = [
  "What's my biggest opportunity?",
  "Show me only critical pages",
  "Fix plan for the Ranking Opportunity",
  "Which pages have the most sessions at risk?",
];

const STEP_META: Record<FixPlanStepKind, { icon: React.ElementType; color: string; label: string }> = {
  trigger:   { icon: Zap,          color: '#dc2626', label: 'Issue' },
  action:    { icon: ArrowRight,   color: 'var(--accent)', label: 'Action' },
  condition: { icon: GitBranch,    color: '#ca8a04', label: 'Check' },
  verify:    { icon: CheckCircle2, color: '#16a34a', label: 'Verify' },
};

const FIX_PLANS: Record<string, FixPlan> = {
  ranking_opportunity: {
    pattern: 'RANKING_OPPORTUNITY',
    url: '/blog/what-is-hvac',
    steps: [
      {
        kind: 'trigger',
        title: 'Ranking Opportunity detected',
        detail: '510 clicks/mo, avg position 4.2 — transactional query, informational page. CTR 2.1% vs expected 8%+.',
      },
      {
        kind: 'action',
        title: 'Rewrite title tag',
        detail: 'Change from "What Is HVAC?" → "HVAC Installation Costs & Guide (2026)" to match transactional intent.',
      },
      {
        kind: 'action',
        title: 'Add cost/pricing section',
        detail: 'Insert an H2 section "How Much Does HVAC Cost?" with a price range table. This is the #1 missing element for the primary query.',
      },
      {
        kind: 'action',
        title: 'Add CTA above the fold',
        detail: 'Place a "Get a Free Estimate" button within the first scroll before the article body begins.',
      },
      {
        kind: 'condition',
        title: 'Monitor CTR after 2 weeks',
        detail: 'Check GSC for title tag + CTR change.',
        branch: { yes: 'Mark resolved — proceed to /services/hvac-installation', no: 'A/B test alternate title variant' },
      },
      {
        kind: 'verify',
        title: 'Rescan with Crawl4AI',
        detail: 'Confirm CTA detected, pricing section present, internal link to /services/hvac-installation exists.',
      },
    ],
  },
  buried_page: {
    pattern: 'BURIED_PAGE',
    url: '/services/hvac-installation',
    steps: [
      {
        kind: 'trigger',
        title: 'Buried Page detected',
        detail: '290 sessions/mo entering at /services/hvac-installation with 0 links to /contact. P0 priority.',
      },
      {
        kind: 'action',
        title: 'Add primary CTA above the fold',
        detail: '"Get a Free HVAC Estimate" button at the top of the page, before any scrolling required.',
      },
      {
        kind: 'action',
        title: 'Add secondary CTA at page bottom',
        detail: 'A sticky footer CTA or bottom-section card linking to /contact.',
      },
      {
        kind: 'action',
        title: 'Add internal link in body copy',
        detail: 'First mention of "contact us" or "schedule" links directly to /contact.',
      },
      {
        kind: 'condition',
        title: 'Check GA4 scroll depth + clicks',
        detail: 'Are users reaching the CTA location? If scroll depth < 40%, move CTA higher.',
        branch: { yes: 'Proceed to verify', no: 'Reposition CTA above visible fold' },
      },
      {
        kind: 'verify',
        title: 'Verify conversion improvement',
        detail: 'Check GA4 for /contact form submissions originating from /services/hvac-installation. Target: 15–25% lift.',
      },
    ],
  },
};

function getMockResponse(input: string): Message {
  const q = input.toLowerCase();

  if (q.includes('fix plan') || q.includes('how do i fix') || q.includes('how to fix')) {
    if (q.includes('ranking') || q.includes('serp') || q.includes('blog')) {
      return { role: 'assistant', fixPlan: FIX_PLANS.ranking_opportunity };
    }
    if (q.includes('buried') || q.includes('funnel') || q.includes('leaky') || q.includes('hvac-installation')) {
      return { role: 'assistant', fixPlan: FIX_PLANS.buried_page };
    }
    return { role: 'assistant', fixPlan: FIX_PLANS.ranking_opportunity };
  }
  if (q.includes('critical')) {
    return {
      role: 'assistant',
      text: "Filtering to 1 critical page. **/services/hvac-installation** is your highest-priority issue — 2 patterns detected (Buried Page + Ranking Opportunity), P0 priority, 340 clicks/month being lost. Try \"fix plan for buried page\" to see a step-by-step remediation.",
      command: { type: 'filter', filter: 'critical' },
    };
  }
  if (q.includes('leaking')) {
    return {
      role: 'assistant',
      text: "**/blog/what-is-hvac** is attracting 510 clicks/month but 68% of sessions exit without converting. The top-ranking query has transactional intent but the page is informational. Try \"fix plan for the ranking opportunity\" to see exactly how to fix it.",
      command: { type: 'filter', filter: 'leaking' },
    };
  }
  if (q.includes('opportunity')) {
    return {
      role: 'assistant',
      text: "Your biggest opportunity is **/contact** — highest conversion rate on the site but only 90 GSC clicks/month. Adding internal links from your 5 highest-traffic service pages could increase form submissions by 20–35%.",
      command: { type: 'filter', filter: 'opportunity' },
    };
  }
  if (q.includes('all') || q.includes('reset') || q.includes('show all')) {
    return {
      role: 'assistant',
      text: "Showing all 5 pages. 1 critical issue, 1 leaking page, 1 opportunity, 2 healthy pages. **770 sessions/month at risk.**",
      command: { type: 'filter', filter: 'all' },
    };
  }
  if (q.includes('sessions at risk') || q.includes('biggest')) {
    return {
      role: 'assistant',
      text: "**770 sessions/month at risk:**\n\n• **/services/hvac-installation** — 290 sessions/mo, P0\n• **/blog/what-is-hvac** — 480 sessions/mo, P1\n\nFixing the leaky funnel on /services/hvac-installation is highest-leverage — it already ranks at position 4.2.",
    };
  }
  if (q.includes('healthy')) {
    return {
      role: 'assistant',
      text: "Your 2 healthy pages — **/home** and **/services/ac-repair** — are performing as expected with no detected pattern issues.",
      command: { type: 'filter', filter: 'healthy' },
    };
  }
  return {
    role: 'assistant',
    text: "I can filter the canvas, explain issue patterns, or generate a step-by-step fix plan. Try: \"Show me critical pages\" · \"Fix plan for the SERP trap\" · \"What's my biggest opportunity?\"",
  };
}

// ── Fix Plan flow diagram ─────────────────────────────────────────────────────

function FixPlanCard({ plan }: { plan: FixPlan }) {
  const patternColor = plan.pattern === 'RANKING_OPPORTUNITY' ? '#f97316'
    : plan.pattern === 'BURIED_PAGE' ? '#eab308'
    : 'var(--accent)';

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 8,
      background: 'var(--bg-subtle)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid var(--border)',
        background: `color-mix(in srgb, ${patternColor} 6%, var(--surface))`,
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
            Fix Plan
          </span>
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            color: patternColor,
            background: `color-mix(in srgb, ${patternColor} 12%, transparent)`,
            padding: '1px 5px', borderRadius: 3,
          }}>
            {plan.pattern.replace(/_/g, ' ')}
          </span>
        </div>
        <code style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)' }}>
          {plan.url}
        </code>
      </div>

      {/* Flow node cards */}
      <div style={{ padding: '10px 10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {plan.steps.map((step, i) => (
          <FlowStepNode
            key={i}
            step={step}
            stepNum={i + 1}
            isLast={i === plan.steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function FlowStepNode({ step, stepNum, isLast }: { step: FixPlanStep; stepNum: number; isLast: boolean }) {
  const meta = STEP_META[step.kind];
  const Icon = meta.icon;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Node card */}
      <div style={{
        width: '100%',
        border: `1px solid color-mix(in srgb, ${meta.color} 28%, var(--border))`,
        borderRadius: 6, overflow: 'hidden', background: 'var(--surface)',
      }}>
        {/* Kind header */}
        <div style={{
          padding: '5px 8px',
          background: `color-mix(in srgb, ${meta.color} 8%, var(--surface))`,
          borderBottom: `1px solid color-mix(in srgb, ${meta.color} 18%, var(--border))`,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Icon size={10} strokeWidth={2.5} style={{ color: meta.color }} />
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase' as const, color: meta.color, flex: 1,
          }}>
            {meta.label}
          </span>
          <span style={{
            fontSize: 9, color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums',
          }}>
            {stepNum}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '6px 8px 7px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginBottom: 3, lineHeight: 1.3 }}>
            {step.title}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            {step.detail}
          </div>

          {/* Branch outcomes — 2-column grid */}
          {step.branch && (
            <div style={{
              marginTop: 7,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5,
              borderTop: '1px solid var(--border-subtle)', paddingTop: 7,
            }}>
              <div style={{
                padding: '4px 7px', borderRadius: 4, fontSize: 9.5, lineHeight: 1.4,
                background: 'color-mix(in srgb, #16a34a 8%, transparent)',
                border: '1px solid color-mix(in srgb, #16a34a 25%, transparent)',
                color: '#16a34a',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 1 }}>✓ Yes</div>
                {step.branch.yes}
              </div>
              <div style={{
                padding: '4px 7px', borderRadius: 4, fontSize: 9.5, lineHeight: 1.4,
                background: 'color-mix(in srgb, #ca8a04 8%, transparent)',
                border: '1px solid color-mix(in srgb, #ca8a04 25%, transparent)',
                color: '#ca8a04',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 1 }}>✗ No</div>
                {step.branch.no}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 14, flexShrink: 0 }}>
          <div style={{ width: 1, flex: 1, background: 'var(--border)' }} />
          <div style={{
            width: 0, height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '5px solid var(--border)',
          }} />
        </div>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function AIPanel({ onClose, currentFilter, onCommand }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    setMessages(prev => [...prev, { role: 'user', text: text.trim() }]);
    setInput('');
    setStreaming(true);

    setTimeout(() => {
      const response = getMockResponse(text);
      setMessages(prev => [...prev, response]);
      if (response.command) onCommand(response.command);
      setStreaming(false);
    }, 600);
  }

  return (
    <div
      className="animate-slide-in-right"
      style={{
        width: 360, flexShrink: 0,
        borderLeft: '1px solid var(--border)', background: 'var(--surface)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>
          AI Assistant
        </span>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: 6, border: 'none',
            background: 'transparent', color: 'var(--ink-dim)', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--ink)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-dim)'; }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--ink-dim)', marginBottom: 4 }}>
              Ask about your journey data, filter the canvas, or generate a fix plan.
            </p>
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  textAlign: 'left', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
                  color: 'var(--ink-muted)', fontSize: 12, cursor: 'pointer',
                  fontFamily: 'inherit', lineHeight: 1.4, transition: 'border-color 0.12s, color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-muted)'; }}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i}>
              {msg.fixPlan ? (
                <FixPlanCard plan={msg.fixPlan} />
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 2,
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '90%', padding: '8px 10px',
                    borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '2px 10px 10px 10px',
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-raised)',
                    color: msg.role === 'user' ? 'var(--accent-ink)' : 'var(--ink)',
                    fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text?.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </div>
                  {msg.command && (
                    <span style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>
                      ↳ Canvas updated
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {streaming && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 10px' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-dim)',
                animation: 'fade-in 0.6s ease infinite alternate',
                animationDelay: `${i * 150}ms`,
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
          placeholder="Filter, explain, or generate a fix plan…"
          style={{
            flex: 1, padding: '7px 10px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--bg-subtle)',
            color: 'var(--ink)', fontSize: 12, fontFamily: 'inherit',
            outline: 'none', transition: 'border-color 0.12s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6, border: 'none',
            background: input.trim() && !streaming ? 'var(--accent)' : 'var(--surface-raised)',
            color: input.trim() && !streaming ? 'var(--accent-ink)' : 'var(--ink-dim)',
            cursor: input.trim() && !streaming ? 'pointer' : 'default',
            transition: 'background 0.12s, color 0.12s', flexShrink: 0,
          }}
        >
          <SendHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
