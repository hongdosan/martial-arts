import { Modal } from '../../../shared/ui';
import type { EditState } from '../model/edit-state';
import { LevelForm } from './level-form';
import { ArtForm } from './art-form';
import { FactionForm } from './faction-form';
import { TitleForm } from './title-form';
import { CharacterForm } from './character-form';
import { MiscForm } from './misc-form';
import { FortuneForm } from './fortune-form';

interface EntryEditModalProps {
  state: EditState;
  onChange: (next: EditState) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const EntryEditModal = ({
  state,
  onChange,
  onSave,
  onDelete,
  onClose,
}: EntryEditModalProps) => {
  const title = state.isNew ? '새 항목 추가' : `${state.item.name || '항목'} 수정`;

  const renderForm = () => {
    switch (state.tabId) {
      case 'levels':
        return (
          <LevelForm
            value={state.item}
            onPatch={(p) => onChange({ ...state, item: { ...state.item, ...p } })}
          />
        );
      case 'arts':
        return (
          <ArtForm
            value={state.item}
            onPatch={(p) => onChange({ ...state, item: { ...state.item, ...p } })}
          />
        );
      case 'factions':
        return (
          <FactionForm
            value={state.item}
            onPatch={(p) => onChange({ ...state, item: { ...state.item, ...p } })}
          />
        );
      case 'titles':
        return (
          <TitleForm
            value={state.item}
            onPatch={(p) => onChange({ ...state, item: { ...state.item, ...p } })}
          />
        );
      case 'characters':
        return (
          <CharacterForm
            value={state.item}
            onPatch={(p) => onChange({ ...state, item: { ...state.item, ...p } })}
          />
        );
      case 'misc':
        return (
          <MiscForm
            value={state.item}
            onPatch={(p) => onChange({ ...state, item: { ...state.item, ...p } })}
          />
        );
      case 'fortune':
        return (
          <FortuneForm
            value={state.item}
            onPatch={(p) => onChange({ ...state, item: { ...state.item, ...p } })}
          />
        );
    }
  };

  return (
    <Modal open onClose={onClose} title={title}>
      {renderForm()}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #ddd',
        }}
      >
        <div>
          {!state.isNew && (
            <button
              type="button"
              onClick={onDelete}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: '1px solid #D85A30',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#D85A30',
                fontWeight: 500,
              }}
            >
              삭제
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
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
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
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
            저장
          </button>
        </div>
      </div>
    </Modal>
  );
};
