'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, LayoutGrid, AlertTriangle, Database, Settings, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const NAV = [
  { href: '/canvas',   icon: Map,           label: 'Canvas' },
  { href: '/pages',    icon: LayoutGrid,    label: 'Pages' },
  { href: '/issues',   icon: AlertTriangle, label: 'Issues' },
  { href: '/sources',  icon: Database,      label: 'Sources' },
  { href: '/settings', icon: Settings,      label: 'Settings' },
];

interface AppShellProps {
  children: React.ReactNode;
  canvasControls?: React.ReactNode;
}

export default function AppShell({ children, canvasControls }: AppShellProps) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* Topbar */}
      <header style={{
        height: 48,
        flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
          NavFlow
        </span>
        <span style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
          Demo Site Co.
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>·</span>
        <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>Jun 2026</span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {canvasControls}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--ink-dim)',
              cursor: 'pointer',
              transition: 'color 0.12s, background 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--ink)';
              e.currentTarget.style.background = 'var(--surface-raised)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--ink-dim)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {theme === 'light'
              ? <Moon size={14} strokeWidth={1.75} />
              : <Sun  size={14} strokeWidth={1.75} />
            }
          </button>

          <button
            title="AI Assistant"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface-raised)',
              color: 'var(--ink-muted)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Sparkles size={13} strokeWidth={1.5} />
            <span>Ask AI</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <nav
          style={{
            width: 52,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 0',
            gap: 2,
          }}
        >
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  color: active ? 'var(--accent)' : 'var(--ink-dim)',
                  background: active ? 'var(--accent-subtle)' : 'transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--ink-muted)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-raised)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = 'var(--ink-dim)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <Icon size={17} strokeWidth={1.75} />
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </main>

      </div>
    </div>
  );
}
