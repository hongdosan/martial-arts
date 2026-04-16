import { useState } from 'react';
import { Tag } from '../tag';
import { fieldInputStyle, fieldLabelStyle, fieldWrapperStyle } from './styles';

interface TagFieldProps {
  label: string;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const TagField = ({
  label,
  value,
  onChange,
  placeholder = '입력 후 Enter',
}: TagFieldProps) => {
  const [draft, setDraft] = useState('');
  const tags = value ?? [];
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...tags, t]);
    setDraft('');
  };
  return (
    <div style={fieldWrapperStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
        {tags.map((t, i) => (
          <span
            key={i}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Tag color="#534AB7" shape="pill">
              {t}
              <span
                onClick={() => onChange(tags.filter((_, j) => j !== i))}
                style={{ cursor: 'pointer', opacity: 0.6, fontSize: '12px', marginLeft: '4px' }}
              >
                ✕
              </span>
            </Tag>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          style={{ ...fieldInputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={add}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: '#e8e8e8',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#111',
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
};
