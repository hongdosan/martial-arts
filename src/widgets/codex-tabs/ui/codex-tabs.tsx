import { TABS, type TabId } from '../../../shared/config';

interface CodexTabsProps {
  value: TabId;
  onChange: (next: TabId) => void;
}

export const CodexTabs = ({ value, onChange }: CodexTabsProps) => (
  <>
    <div
      style={{
        display: 'flex',
        gap: '1px',
        padding: '10px 20px 0',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              padding: '7px 13px',
              borderRadius: '8px 8px 0 0',
              border: '1px solid',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: active ? 600 : 400,
              whiteSpace: 'nowrap',
              background: active ? 'var(--color-background-primary)' : 'transparent',
              borderColor: active ? 'var(--color-border-secondary)' : 'transparent',
              borderBottomColor: active ? 'var(--color-background-primary)' : 'transparent',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              marginBottom: active ? '-1px' : 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '12px', opacity: 0.7 }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
    <div style={{ borderTop: '1px solid var(--color-border-tertiary)' }} />
  </>
);
