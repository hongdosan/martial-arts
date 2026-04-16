import type { Faction } from '../model/types';
import {
  cardStyle,
  cardHeaderStyle,
  cardExpandStyle,
  memberItemStyle,
  Tag,
  EditIconButton,
} from '../../../shared/ui';
import { colorOfTag } from '../../../shared/config';

interface FactionCardProps {
  faction: Faction;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const FactionCard = ({ faction, expanded, onToggle, onEdit }: FactionCardProps) => {
  const color = colorOfTag(faction.tag);

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
            <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>{faction.name}</p>
            {faction.tag && <Tag color={color}>{faction.tag}</Tag>}
          </div>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {faction.desc}
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

      {expanded && (
        <div style={cardExpandStyle}>
          {faction.groups.map((g, gi) => (
            <div key={gi}>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {g.label}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: '6px',
                }}
              >
                {g.members.map((m, mi) => (
                  <div key={mi} style={memberItemStyle(color)}>
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
          ))}
          {faction.notes && (
            <div
              style={{
                borderTop: '1px solid var(--color-border-tertiary)',
                paddingTop: '8px',
              }}
            >
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
                {faction.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
