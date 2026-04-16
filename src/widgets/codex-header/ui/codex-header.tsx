interface CodexHeaderProps {
  onExport: () => void;
}

export const CodexHeader = ({ onExport }: CodexHeaderProps) => (
  <div
    style={{
      padding: '20px 20px 14px',
      borderBottom: '1px solid var(--color-border-tertiary)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    }}
  >
    <div>
      <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>武林典籍</h1>
      <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        무협 세계관 레퍼런스
      </p>
    </div>
    <button
      type="button"
      onClick={onExport}
      style={{
        padding: '5px 12px',
        borderRadius: '6px',
        border: '1px solid var(--color-border-tertiary)',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '11px',
        color: 'var(--color-text-tertiary)',
        whiteSpace: 'nowrap',
        marginTop: '4px',
      }}
    >
      📋 전체 내보내기
    </button>
  </div>
);
