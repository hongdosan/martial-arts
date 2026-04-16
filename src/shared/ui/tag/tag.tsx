import type { CSSProperties, ReactNode } from 'react';

export type TagShape = 'pill' | 'square';

interface TagProps {
  color: string;
  shape?: TagShape;
  children: ReactNode;
}

const baseStyle = (color: string, shape: TagShape): CSSProperties => ({
  fontSize: '10.5px',
  padding: shape === 'pill' ? '2px 8px' : '2px 9px',
  borderRadius: shape === 'pill' ? '20px' : '6px',
  background: color + '18',
  color,
  border: `1px solid ${color}33`,
  whiteSpace: 'nowrap',
  fontWeight: 500,
});

export const Tag = ({ color, shape = 'square', children }: TagProps) => (
  <span style={baseStyle(color, shape)}>{children}</span>
);
