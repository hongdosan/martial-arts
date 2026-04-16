interface CodexSearchProps {
  value: string;
  onChange: (next: string) => void;
}

export const CodexSearch = ({ value, onChange }: CodexSearchProps) => (
  <div style={{ padding: '10px 20px 0' }}>
    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '13px',
          color: 'var(--color-text-tertiary)',
          pointerEvents: 'none',
        }}
      >
        🔍
      </span>
      <input
        type="text"
        placeholder="검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '8px 36px 8px 34px',
          borderRadius: '8px',
          border: '1px solid var(--color-border-tertiary)',
          background: 'var(--color-background-secondary)',
          color: 'var(--color-text-primary)',
          fontSize: '13px',
          outline: 'none',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="검색 지우기"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            fontSize: '14px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  </div>
);
