export const metadata = { title: 'NavFlow — Settings' };

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 11, color: 'var(--ink-dim)', marginBottom: 6 }}>{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, placeholder, type = 'text' }: { value?: string; placeholder?: string; type?: string }) {
  return (
    <input
      defaultValue={value}
      placeholder={placeholder}
      type={type}
      style={{
        width: '100%', padding: '7px 10px', borderRadius: 6, fontSize: 13,
        border: '1px solid var(--border)', background: 'var(--bg-subtle)',
        color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 28, padding: '20px 20px 4px',
      border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: 640, overflowY: 'auto', height: '100%' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 12, color: 'var(--ink-dim)' }}>Manage your NavFlow workspace.</p>
      </div>

      <Section title="Workspace">
        <FieldGroup label="Property Name">
          <TextInput value="Demo Site Co." />
        </FieldGroup>
        <FieldGroup label="Domain" hint="The root domain for this audit.">
          <TextInput value="demo-site-co.com" />
        </FieldGroup>
        <FieldGroup label="Audit Frequency" hint="How often NavFlow re-crawls and re-syncs data.">
          <select
            defaultValue="weekly"
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 6, fontSize: 13,
              border: '1px solid var(--border)', background: 'var(--bg-subtle)',
              color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
            }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="manual">Manual only</option>
          </select>
        </FieldGroup>
        <div style={{ marginBottom: 20 }}>
          <button
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
              border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)',
              fontFamily: 'inherit', fontWeight: 500,
            }}
          >
            Save changes
          </button>
        </div>
      </Section>

      <Section title="Team">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
          }}>
            E
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Edward Chalupa</p>
            <p style={{ fontSize: 11, color: 'var(--ink-dim)' }}>echalupa@whtnxt.io · Owner</p>
          </div>
        </div>
        <button
          style={{
            padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--ink-muted)', fontFamily: 'inherit', marginBottom: 16,
          }}
        >
          + Invite teammate
        </button>
      </Section>

      <Section title="API Keys">
        <FieldGroup label="NavFlow API Key" hint="Use this to query NavFlow data from external tools.">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              defaultValue="nvf_live_••••••••••••••••••••••••"
              readOnly
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 6, fontSize: 13,
                border: '1px solid var(--border)', background: 'var(--bg-subtle)',
                color: 'var(--ink)', fontFamily: 'var(--font-mono)',
              }}
            />
            <button
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--ink-muted)', fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              Reveal
            </button>
          </div>
        </FieldGroup>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--ink-dim)' }}>
            Keys never expire. Rotate if compromised.
          </p>
        </div>
      </Section>

      <Section title="Plan">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 0', marginBottom: 16,
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>NavFlow Alpha</p>
            <p style={{ fontSize: 11, color: 'var(--ink-dim)' }}>Unlimited audits · 1 property · 1 seat</p>
          </div>
          <span style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 4,
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            color: 'var(--accent)', fontWeight: 500,
          }}>
            Alpha access
          </span>
        </div>
      </Section>

    </div>
  );
}
