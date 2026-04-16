import type { Title } from '../model/types';
import {
  cardStyle,
  cardHeaderStyle,
  cardExpandStyle,
  memberItemStyle,
  Tag,
  EditIconButton,
} from '../../../shared/ui';
import { colorOfTag } from '../../../shared/config';

interface TitleCardProps {
  title: Title;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const TitleCard = ({ title, expanded, onToggle, onEdit }: TitleCardProps) => {
  const color = colorOfTag(title.tag);
  const hasMembers = title.members.length > 0;

  return (
    <div style={cardStyle}>
      <div
        onClick={onToggle}
        style={{ ...cardHeaderStyle, padding: '14px 16px', gap: '8px', alignItems: 'flex-start' }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '4px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '-0.3px',
              }}
            >
              {title.name}
            </p>
            <Tag color={color}>{title.tag}</Tag>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {title.desc}
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

      {expanded && (hasMembers || title.notes) && (
        <div style={cardExpandStyle}>
          {hasMembers && (
            <div>
              <p
                style={{
                  margin: '0 0 8px',
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
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: '6px',
                }}
              >
                {title.members.map((m, i) => (
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
          {title.notes && (
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
                {title.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
