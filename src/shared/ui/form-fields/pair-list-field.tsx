import type { CSSProperties } from 'react';
import { fieldInputStyle, fieldLabelStyle, fieldWrapperStyle } from './styles';

interface PairListFieldProps<K1 extends string, K2 extends string> {
  label: string;
  keyLeft: K1;
  keyRight: K2;
  value: Array<Record<K1 | K2, string>> | undefined;
  onChange: (value: Array<Record<K1 | K2, string>>) => void;
  placeholderLeft: string;
  placeholderRight: string;
  leftFlex?: CSSProperties['flex'];
}

export const PairListField = <K1 extends string, K2 extends string>({
  label,
  keyLeft,
  keyRight,
  value,
  onChange,
  placeholderLeft,
  placeholderRight,
  leftFlex = '0 0 28%',
}: PairListFieldProps<K1, K2>) => {
  const entries = value ?? [];
  const update = (index: number, key: K1 | K2, next: string) => {
    const copy = entries.slice();
    copy[index] = { ...copy[index], [key]: next };
    onChange(copy);
  };
  const empty = { [keyLeft]: '', [keyRight]: '' } as Record<K1 | K2, string>;
  return (
    <div style={fieldWrapperStyle}>
      <label style={{ ...fieldLabelStyle, marginBottom: '6px' }}>{label}</label>
      {entries.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <input
            value={item[keyLeft] ?? ''}
            onChange={(e) => update(i, keyLeft, e.target.value)}
            placeholder={placeholderLeft}
            style={{ ...fieldInputStyle, flex: leftFlex }}
          />
          <input
            value={item[keyRight] ?? ''}
            onChange={(e) => update(i, keyRight, e.target.value)}
            placeholder={placeholderRight}
            style={{ ...fieldInputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => onChange(entries.filter((_, j) => j !== i))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#D85A30',
              fontSize: '16px',
              padding: '6px',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...entries, { ...empty }])}
        style={{
          padding: '5px 12px',
          borderRadius: '6px',
          border: '1px dashed #ccc',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '12px',
          color: '#666',
        }}
      >
        + 항목
      </button>
    </div>
  );
};
