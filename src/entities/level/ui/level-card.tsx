import type {Level} from '../model/types';
import {DEFAULT_LEVELS} from '../model/default-data';
import {
  cardStyle,
  cardHeaderStyle,
  cardBodyStyle,
  cardExpandStyle,
  rankBadgeStyle,
  Tag,
  EditIconButton,
} from '../../../shared/ui';
import {colorOfTag, RANK_COLORS} from '../../../shared/config';

interface LevelCardProps {
  level: Level;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

const pickColor = (level: Level): string => {
  if (level.sub === '검도') return '#534AB7';
  if (level.sub === '경지') {
    const idx = DEFAULT_LEVELS.findIndex((x) => x.id === level.id);
    return RANK_COLORS[idx] ?? colorOfTag(level.sub);
  }
  return colorOfTag(level.sub);
};

export const LevelCard = ({level, expanded, onToggle, onEdit}: LevelCardProps) => {
  const hasRank = level.sub === '경지' || level.sub === '검도';
  const color = pickColor(level);
  const showDetails = expanded && (level.conditions || level.notes);

  return (
    <div style={cardStyle}>
      <div onClick={onToggle} style={cardHeaderStyle}>
        {hasRank && level.rank ? (
          <div style={rankBadgeStyle(color)}>
            <p style={{margin: 0, fontSize: '13px', fontWeight: 600, color}}>{level.rank}</p>
          </div>
        ) : (
          <div style={{...rankBadgeStyle(color), width: '6px', padding: 0}}/>
        )}
        <div style={cardBodyStyle}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
            <p style={{margin: 0, fontWeight: 600, fontSize: '14px'}}>{level.name}</p>
            <Tag color={color}>{level.sub}</Tag>
            {level.aliases.map((alias, i) => (
              <Tag key={i} color={color} shape="pill">
                {alias}
              </Tag>
            ))}
          </div>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {level.desc}
          </p>
        </div>
        <EditIconButton onClick={onEdit}/>
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
      {showDetails && (
        <div style={cardExpandStyle}>
          {level.conditions && (
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                조건 / 특이사항
              </p>
              <p style={{margin: 0, fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap'}}>
                {level.conditions}
              </p>
            </div>
          )}
          {level.notes && (
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
                {level.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
