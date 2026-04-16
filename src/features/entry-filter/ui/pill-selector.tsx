interface PillSelectorProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  labelOf?: (option: T) => string;
}

export const PillSelector = <T extends string>({
  options,
  value,
  onChange,
  labelOf = (v) => v,
}: PillSelectorProps<T>) => (
  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
    {options.map((option) => {
      const active = value === option;
      return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          style={{
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: active ? 600 : 400,
            background: active ? 'var(--color-text-primary)' : 'transparent',
            borderColor: active ? 'var(--color-text-primary)' : 'var(--color-border-tertiary)',
            color: active ? 'var(--color-background-primary)' : 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          {labelOf(option)}
        </button>
      );
    })}
  </div>
);
