import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
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
          width: 'min(560px,92vw)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          color: '#111',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#111' }}>{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#666',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};
