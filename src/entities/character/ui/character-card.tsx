import type { Character } from '../model/types';
import {
  cardStyle,
  cardHeaderStyle,
  cardExpandStyle,
  memberItemStyle,
  Tag,
  EditIconButton,
} from '../../../shared/ui';
import { colorOfTag } from '../../../shared/config';

interface CharacterCardProps {
  character: Character;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

const SUB_COLOR: Record<string, string> = {
  주역: '#378ADD',
  조연: '#1D9E75',
  반동: '#D85A30',
  기타: '#888780',
};

export const CharacterCard = ({ character, expanded, onToggle, onEdit }: CharacterCardProps) => {
  const color = SUB_COLOR[character.sub] ?? '#888780';
  const originColor = colorOfTag(character.origin);
  const hasTraits = character.traits.length > 0;
  const hasRelations = character.relations.length > 0;
  const showExpand =
    expanded &&
    (character.source ||
      character.sex ||
      character.age ||
      character.origin ||
      hasTraits ||
      hasRelations ||
      character.notes);

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
              {character.name}
            </p>
            <Tag color={color}>{character.sub}</Tag>
            {character.aliases.map((a, i) => (
              <Tag key={i} color={color} shape="pill">
                {a}
              </Tag>
            ))}
            {character.source && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                {character.source}
              </span>
            )}
          </div>
          {character.desc && (
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {character.desc}
            </p>
          )}
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
          {(character.sex || character.age || character.origin) && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {character.sex && (
                <MetaPair label="성별" value={character.sex} />
              )}
              {character.age && <MetaPair label="나이" value={character.age} />}
              {character.origin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    출신
                  </span>
                  <Tag color={originColor}>{character.origin}</Tag>
                </div>
              )}
            </div>
          )}
          {hasTraits && (
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                특징
              </p>
              {character.traits.map((t, j) => (
                <div
                  key={j}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start',
                    marginBottom: '3px',
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: color,
                      marginTop: 8,
                      flexShrink: 0,
                    }}
                  />
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7 }}>{t}</p>
                </div>
              ))}
            </div>
          )}
          {hasRelations && (
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                관계
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: '6px',
                }}
              >
                {character.relations.map((r, i) => (
                  <div key={i} style={memberItemStyle(color)}>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '13px' }}>{r.n}</p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {r.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {character.notes && (
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
                {character.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MetaPair = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
      {label}
    </span>
    <span style={{ fontSize: '13px' }}>{value}</span>
  </div>
);
