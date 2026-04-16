import type { ReactNode } from 'react';
import { DefaultsButtons } from '../../../features/defaults-restore';

interface CodexToolbarProps {
  onAdd: () => void;
  onSaveAsDefault: () => void;
  onRestoreDefault: () => void;
  filters?: ReactNode;
}

export const CodexToolbar = ({
  onAdd,
  onSaveAsDefault,
  onRestoreDefault,
  filters,
}: CodexToolbarProps) => (
  <>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        onClick={onAdd}
        style={{
          padding: '7px 16px',
          borderRadius: '8px',
          border: '1px solid var(--color-border-secondary)',
          background: 'var(--color-background-secondary)',
          cursor: 'pointer',
          fontSize: '12px',
          color: 'var(--color-text-primary)',
          fontWeight: 500,
        }}
      >
        ＋ 새 항목
      </button>
      <DefaultsButtons onSaveAsDefault={onSaveAsDefault} onRestoreDefault={onRestoreDefault} />
    </div>
    {filters}
  </>
);
