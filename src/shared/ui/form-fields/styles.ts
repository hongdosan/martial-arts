import type { CSSProperties } from 'react';

export const fieldInputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  background: '#f5f5f5',
  color: '#111',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
};

export const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#555',
  marginBottom: '4px',
};

export const fieldWrapperStyle: CSSProperties = { marginBottom: '12px' };
