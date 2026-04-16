import { useMemo, useRef } from 'react';
import { Modal } from '../../../shared/ui';
import { copyToClipboard } from '../../../shared/lib';

interface ExportModalProps {
  data: unknown;
  onClose: () => void;
  onCopied: () => void;
}

export const ExportModal = ({ data, onClose, onCopied }: ExportModalProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(json);
    if (ok) onCopied();
    else if (textareaRef.current) textareaRef.current.select();
  };

  return (
    <Modal open onClose={onClose} title="전체 데이터 내보내기">
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888' }}>
        아래 JSON을 복사하여 전달하면 코드의 기본 데이터에 반영할 수 있습니다.
      </p>
      <textarea
        ref={textareaRef}
        readOnly
        value={json}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          height: '400px',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #ddd',
          background: '#f0f0f0',
          color: '#111',
          fontSize: '11px',
          fontFamily: 'monospace',
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: '1px solid #bbb',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#555',
          }}
        >
          닫기
        </button>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: '#111',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#fff',
            fontWeight: 500,
          }}
        >
          복사
        </button>
      </div>
    </Modal>
  );
};
