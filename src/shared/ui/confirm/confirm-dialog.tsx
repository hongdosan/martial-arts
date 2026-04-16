interface ConfirmDialogProps {
  message: string;
  onConfirm: (() => void) | null;
  onCancel: () => void;
}

export const ConfirmDialog = ({ message, onConfirm, onCancel }: ConfirmDialogProps) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(17,17,17,0.55)',
    }}
  >
    <div
      style={{
        background: '#fafafa',
        borderRadius: '12px',
        border: '1px solid #ddd',
        width: 'min(400px,85vw)',
        padding: '24px',
        color: '#111',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: '0 0 20px', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {onConfirm && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 24px',
              borderRadius: '6px',
              border: '1px solid #bbb',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#555',
            }}
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={() => (onConfirm ? onConfirm() : onCancel())}
          style={{
            padding: '8px 24px',
            borderRadius: '6px',
            border: 'none',
            background: '#111',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#fff',
            fontWeight: 500,
          }}
        >
          {onConfirm ? '확인' : '닫기'}
        </button>
      </div>
    </div>
  </div>
);
