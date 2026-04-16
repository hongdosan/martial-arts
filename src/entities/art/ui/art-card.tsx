import type { Art } from '../model/types';
import {
  cardStyle,
  cardHeaderStyle,
  cardExpandStyle,
  Tag,
  EditIconButton,
} from '../../../shared/ui';
import { colorOfTag } from '../../../shared/config';

interface ArtCardProps {
  art: Art;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const ArtCard = ({ art, expanded, onToggle, onEdit }: ArtCardProps) => {
  const cf = colorOfTag(art.faction);
  const ct = colorOfTag(art.type);
  const hasTraits = art.traits.length > 0;
  const hasDetails = art.details.length > 0;
  const hasMerits = !!art.merits;
  const hasAnyExtra = expanded && (hasTraits || hasDetails || hasMerits || art.notes || art.demerits);

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
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '3px',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{art.name}</p>
            <Tag color={cf}>{art.faction}</Tag>
            <Tag color={ct} shape="pill">
              {art.type}
            </Tag>
            {art.tag && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                {art.tag}
              </span>
            )}
          </div>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {art.desc}
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

      {hasAnyExtra && (
        <div style={cardExpandStyle}>
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
              {art.traits.map((t, j) => (
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
                      background: cf,
                      marginTop: 8,
                      flexShrink: 0,
                    }}
                  />
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7 }}>{t}</p>
                </div>
              ))}
            </div>
          )}
          {(art.merits || art.demerits) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {art.merits && (
                <div
                  style={{
                    background: 'var(--color-background-primary)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    borderLeft: '3px solid #1D9E75',
                  }}
                >
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: '#1D9E75', fontWeight: 600 }}>
                    장점
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: 1.6,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {art.merits}
                  </p>
                </div>
              )}
              {art.demerits && (
                <div
                  style={{
                    background: 'var(--color-background-primary)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    borderLeft: '3px solid #D85A30',
                  }}
                >
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: '#D85A30', fontWeight: 600 }}>
                    단점
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: 1.6,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {art.demerits}
                  </p>
                </div>
              )}
            </div>
          )}
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
              {art.details.map((d, i) => (
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
                    <Tag color={ct}>{d.l}</Tag>
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>{d.t}</p>
                </div>
              ))}
            </div>
          )}
          {art.notes && (
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
                {art.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
