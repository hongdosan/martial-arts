import { useMemo, useRef, useState } from 'react';
import { Modal } from '../../../shared/ui';
import { copyToClipboard } from '../../../shared/lib';
import { TABS, type TabId } from '../../../shared/config';

export type ExportScope = TabId | 'all';

interface ExportModalProps {
  data: Record<TabId, unknown>;
  initialScope?: ExportScope;
  onClose: () => void;
  onCopied: () => void;
}

const SCOPE_LABEL: Record<ExportScope, string> = {
  all: '전체',
  ...(Object.fromEntries(TABS.map((t) => [t.id, t.label])) as Record<TabId, string>),
};

const SCOPE_OPTIONS: ExportScope[] = ['all', ...TABS.map((t) => t.id)];

export const ExportModal = ({ data, initialScope = 'all', onClose, onCopied }: ExportModalProps) => {
  const [scope, setScope] = useState<ExportScope>(initialScope);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const json = useMemo(() => {
    const payload = scope === 'all' ? data : { [scope]: data[scope] };
    return JSON.stringify(payload, null, 2);
  }, [data, scope]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(json);
    if (ok) onCopied();
    else if (textareaRef.current) textareaRef.current.select();
  };

  const title = scope === 'all' ? '전체 데이터 내보내기' : `${SCOPE_LABEL[scope]} 데이터 내보내기`;

  return (
    <Modal open onClose={onClose} title={title}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <label style={{ fontSize: '12px', color: '#555', fontWeight: 600 }}>범위</label>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as ExportScope)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: '#fff',
            color: '#111',
            fontSize: '12px',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          {SCOPE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SCOPE_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888' }}>
        선택한 범위의 JSON을 복사해 전달하면 해당 탭의 초기 데이터에 반영할 수 있습니다.
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