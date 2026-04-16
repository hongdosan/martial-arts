import type { DetailEntry, MemberEntry } from '../../lib';
import { cardStyle, cardHeaderStyle, cardExpandStyle, memberItemStyle } from '../card';
import { Tag } from '../tag';
import { EditIconButton } from '../icon-button';
import { colorOfTag } from '../../config';

export interface DetailCardData {
  id: string;
  name: string;
  tag: string;
  desc: string;
  details?: DetailEntry[];
  members?: MemberEntry[];
  notes: string;
}

interface DetailCardProps {
  data: DetailCardData;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const DetailCard = ({ data, expanded, onToggle, onEdit }: DetailCardProps) => {
  const color = colorOfTag(data.tag);
  const details = data.details ?? [];
  const members = data.members ?? [];
  const hasDetails = details.length > 0;
  const hasMembers = members.length > 0;
  const showExpand = expanded && (hasDetails || hasMembers || data.notes);

  return (
    <div style={cardStyle}>
      <div
        onClick={onToggle}
        style={{ ...cardHeaderStyle, padding: '12px 16px', gap: '8px', alignItems: 'flex-start' }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '3px',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{data.name}</p>
            {data.tag && <Tag color={color}>{data.tag}</Tag>}
          </div>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {data.desc}
          </p>
        </div>
        <EditIconButton onClick={onEdit} />
        <div
          style={{
            padding: '0 12px',
            color: 'var(--color-text-tertiary)',
            fontSize: '10px',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {showExpand && (
        <div style={cardExpandStyle}>
          {hasDetails && (
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                상세
              </p>
              {details.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '4px',
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ flexShrink: 0, marginTop: '2px' }}>
                    <Tag color={color}>{d.l}</Tag>
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>{d.t}</p>
                </div>
              ))}
            </div>
          )}
          {hasMembers && (
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                구성
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
                  gap: '6px',
                }}
              >
                {members.map((m, i) => (
                  <div key={i} style={memberItemStyle(color)}>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '13px' }}>{m.n}</p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {m.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.notes && (
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                메모
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                  fontStyle: 'italic',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {data.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
