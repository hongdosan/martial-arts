interface DefaultsButtonsProps {
  onSaveAsDefault: () => void;
  onRestoreDefault: () => void;
}

const buttonBase = {
  padding: '5px 10px',
  borderRadius: '6px',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '11px',
};

export const DefaultsButtons = ({ onSaveAsDefault, onRestoreDefault }: DefaultsButtonsProps) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    <button
      type="button"
      onClick={onSaveAsDefault}
      style={{ ...buttonBase, border: '1px solid #1D9E75', color: '#1D9E75' }}
    >
      기본값으로 저장
    </button>
    <button
      type="button"
      onClick={onRestoreDefault}
      style={{
        ...buttonBase,
        border: '1px solid var(--color-border-tertiary)',
        color: 'var(--color-text-tertiary)',
      }}
    >
      기본값 복원
    </button>
  </div>
);
