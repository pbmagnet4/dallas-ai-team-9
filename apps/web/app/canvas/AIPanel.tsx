'use client';

import { useState, useRef, useEffect } from 'react';
import { X, SendHorizontal, Sparkles } from 'lucide-react';

type HealthFilter = 'all' | 'critical' | 'leaking' | 'opportunity' | 'healthy';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  command?: { type: 'filter'; filter: HealthFilter };
}

interface AIPanelProps {
  onClose: () => void;
  currentFilter: HealthFilter;
  onCommand: (cmd: { type: 'filter'; filter: HealthFilter }) => void;
}

const SUGGESTED = [
  "What's my biggest opportunity?",
  "Show me only critical pages",
  "Explain the SERP Trap pattern",
  "Which pages have the most sessions at risk?",
];

function getMockResponse(input: string): { text: string; command?: { type: 'filter'; filter: HealthFilter } } {
  const q = input.toLowerCase();

  if (q.includes('critical') || q.includes('show me critical')) {
    return {
      text: "Filtering to 1 critical page. **/services/hvac-installation** is your highest-priority issue — 2 patterns detected (Leaky Funnel Entry + SERP Trap), P0 priority, 340 clicks/month being lost. Click the node to see the full action brief.",
      command: { type: 'filter', filter: 'critical' },
    };
  }
  if (q.includes('leaking')) {
    return {
      text: "Showing 1 leaking page. **/blog/what-is-hvac** is attracting 510 clicks/month but 68% of sessions exit without converting. The top-ranking query has transactional intent — the page is informational. Add a cost-section and CTA to bridge the gap.",
      command: { type: 'filter', filter: 'leaking' },
    };
  }
  if (q.includes('opportunity')) {
    return {
      text: "Your biggest opportunity is **/contact** — it has the highest conversion rate on the site but only 90 GSC clicks/month. It's essentially invisible to organic search. Adding internal links from your 5 highest-traffic service pages could increase form submissions by 20–35%.",
      command: { type: 'filter', filter: 'opportunity' },
    };
  }
  if (q.includes('all') || q.includes('reset') || q.includes('show all')) {
    return {
      text: "Showing all 5 pages across your audit. You have 1 critical issue, 1 leaking page, 1 opportunity, and 2 healthy pages. Total sessions at risk: 770/month.",
      command: { type: 'filter', filter: 'all' },
    };
  }
  if (q.includes('serp trap') || q.includes('serp_trap') || q.includes('explain')) {
    return {
      text: "**SERP Trap** — A page that ranks well and gets impressions, but the title/meta doesn't match what the searcher actually wants. Result: high impressions, low CTR, and when people do click, they bounce immediately.\n\nFix: Rewrite the title + meta to match the dominant search intent for that query. For informational content ranking on transactional queries, you may need a new page entirely.",
    };
  }
  if (q.includes('sessions at risk') || q.includes('biggest')) {
    return {
      text: "**770 sessions/month** are at risk from pages with detected issues:\n\n• **/services/hvac-installation** — 290 sessions/mo, P0 (critical)\n• **/blog/what-is-hvac** — 480 sessions/mo, P1 (leaking)\n\nFixing the leaky funnel on /services/hvac-installation is the highest-leverage action — it already has strong traffic and ranks at position 4.2.",
    };
  }
  if (q.includes('healthy')) {
    return {
      text: "Showing your 2 healthy pages — **/home** and **/services/ac-repair**. These are performing as expected with no detected pattern issues.",
      command: { type: 'filter', filter: 'healthy' },
    };
  }
  return {
    text: "I can help you analyze your customer journey data. Try asking about specific patterns, filtering by page health, or explaining what an issue means. For example: \"Show me critical pages\" or \"What's my biggest opportunity?\"",
  };
}

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
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    setTimeout(() => {
      const { text: responseText, command } = getMockResponse(text);
      const assistantMsg: Message = { role: 'assistant', text: responseText, command };
      setMessages(prev => [...prev, assistantMsg]);
      if (command) onCommand(command);
      setStreaming(false);
    }, 600);
  }

  return (
    <div
      className="animate-slide-in-right"
      style={{
        width: 360,
        flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
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
              Ask about your journey data or run a command.
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
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2,
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '90%',
                  padding: '8px 10px',
                  borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '2px 10px 10px 10px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-raised)',
                  color: msg.role === 'user' ? 'var(--accent-ink)' : 'var(--ink)',
                  fontSize: 12,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
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
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask about your journey data…"
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
