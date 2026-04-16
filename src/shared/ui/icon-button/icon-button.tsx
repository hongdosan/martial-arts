import type { CSSProperties, MouseEvent, ReactNode } from 'react';

interface IconButtonProps {
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
  children: ReactNode;
  style?: CSSProperties;
  stopPropagation?: boolean;
}

const base: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  color: 'var(--color-text-tertiary)',
  padding: '4px 8px',
};

export const IconButton = ({
  onClick,
  title,
  ariaLabel,
  children,
  style,
  stopPropagation = true,
}: IconButtonProps) => (
  <button
    type="button"
    title={title}
    aria-label={ariaLabel ?? title}
    onClick={(e: MouseEvent<HTMLButtonElement>) => {
      if (stopPropagation) e.stopPropagation();
      onClick();
    }}
    style={{ ...base, ...style }}
  >
    {children}
  </button>
);

export const EditIconButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} title="수정">
    ✎
  </IconButton>
);
