import type { CSSProperties, ReactNode } from 'react';

export const cardStyle: CSSProperties = {
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: '10px',
  background: 'var(--color-background-primary)',
  overflow: 'hidden',
};

export const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};

export const cardBodyStyle: CSSProperties = { flex: 1, padding: '11px 14px' };

export const cardExpandStyle: CSSProperties = {
  borderTop: '1px solid var(--color-border-tertiary)',
  padding: '12px 16px',
  background: 'var(--color-background-secondary)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

export const memberItemStyle = (color: string): CSSProperties => ({
  background: 'var(--color-background-primary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: '6px',
  padding: '8px 12px',
  borderLeft: `3px solid ${color}`,
});

export const rankBadgeStyle = (color: string): CSSProperties => ({
  width: '42px',
  background: color + '14',
  borderRight: `1px solid ${color}28`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'stretch',
  flexShrink: 0,
});

interface CardProps {
  children: ReactNode;
}

export const Card = ({ children }: CardProps) => <div style={cardStyle}>{children}</div>;
