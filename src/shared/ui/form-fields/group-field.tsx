import { fieldInputStyle, fieldLabelStyle, fieldWrapperStyle } from './styles';

export interface GroupMember {
  n: string;
  d: string;
}

export interface Group {
  label: string;
  members: GroupMember[];
}

interface GroupFieldProps {
  label: string;
  value: Group[] | undefined;
  onChange: (value: Group[]) => void;
}

export const GroupField = ({ label, value, onChange }: GroupFieldProps) => {
  const groups = value ?? [];

  const updateGroup = (gi: number, patch: Partial<Group>) => {
    const copy = groups.slice();
    copy[gi] = { ...copy[gi], ...patch };
    onChange(copy);
  };

  const updateMember = (gi: number, mi: number, patch: Partial<GroupMember>) => {
    const copy = groups.slice();
    const members = copy[gi].members.slice();
    members[mi] = { ...members[mi], ...patch };
    copy[gi] = { ...copy[gi], members };
    onChange(copy);
  };

  return (
    <div style={fieldWrapperStyle}>
      <label style={{ ...fieldLabelStyle, marginBottom: '6px' }}>{label}</label>
      {groups.map((g, gi) => (
        <div
          key={gi}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '8px',
            background: '#f0f0f0',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input
              value={g.label}
              onChange={(e) => updateGroup(gi, { label: e.target.value })}
              placeholder="그룹명"
              style={{ ...fieldInputStyle, fontWeight: 600, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => onChange(groups.filter((_, j) => j !== gi))}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#D85A30',
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          </div>
          {g.members.map((m, mi) => (
            <div key={mi} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <input
                value={m.n}
                onChange={(e) => updateMember(gi, mi, { n: e.target.value })}
                placeholder="이름"
                style={{ ...fieldInputStyle, flex: '0 0 28%' }}
              />
              <input
                value={m.d}
                onChange={(e) => updateMember(gi, mi, { d: e.target.value })}
                placeholder="설명"
                style={{ ...fieldInputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  const copy = groups.slice();
                  copy[gi] = {
                    ...copy[gi],
                    members: copy[gi].members.filter((_, j) => j !== mi),
                  };
                  onChange(copy);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#D85A30',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const copy = groups.slice();
              copy[gi] = { ...copy[gi], members: [...copy[gi].members, { n: '', d: '' }] };
              onChange(copy);
            }}
            style={{
              padding: '3px 10px',
              borderRadius: '4px',
              border: '1px dashed #ccc',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '11px',
              color: '#666',
              marginTop: '4px',
            }}
          >
            + 구성원
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...groups, { label: '', members: [{ n: '', d: '' }] }])}
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
        + 그룹
      </button>
    </div>
  );
};
