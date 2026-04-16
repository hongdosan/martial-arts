import { useMemo, useState } from 'react';
import { type TabId } from '../../../shared/config';
import {
  matches,
  createId,
  type HasId,
} from '../../../shared/lib';
import { ConfirmDialog } from '../../../shared/ui';
import { useCodexData, type TabData } from '../model/use-codex-data';
import {
  LevelCard,
  LEVEL_SUBS,
  LEVEL_SUB_LABELS,
  createEmptyLevel,
  levelSearchText,
  type LevelSub,
} from '../../../entities/level';
import {
  ArtCard,
  ART_FACTION_FILTERS,
  ART_FACTION_LABELS,
  ART_TYPE_FILTERS,
  ART_TYPE_LABELS,
  createEmptyArt,
  artSearchText,
  type ArtFactionFilter,
  type ArtTypeFilter,
} from '../../../entities/art';
import { FactionCard, createEmptyFaction, factionSearchText } from '../../../entities/faction';
import { TitleCard, createEmptyTitle, titleSearchText } from '../../../entities/title';
import {
  MiscCard,
  MISC_SUBS,
  createEmptyMisc,
  miscSearchText,
  type MiscSub,
} from '../../../entities/misc';
import {
  FortuneCard,
  FORTUNE_SUBS,
  createEmptyFortune,
  fortuneSearchText,
  type FortuneSub,
} from '../../../entities/fortune';
import { CodexHeader } from '../../../widgets/codex-header';
import { CodexSearch } from '../../../widgets/codex-search';
import { CodexTabs } from '../../../widgets/codex-tabs';
import { CodexToolbar } from '../../../widgets/codex-toolbar';
import { DraggableRow, EmptyState } from '../../../widgets/codex-list';
import { EntryEditModal, type EditState } from '../../../features/entry-edit';
import { useDragReorder } from '../../../features/entry-reorder';
import { PillSelector } from '../../../features/entry-filter';
import { ExportModal } from '../../../features/codex-export';

interface Confirm {
  msg: string;
  onOk: (() => void) | null;
}

export const CodexPage = () => {
  const { ready, data, getByTab, setByTab, saveAsDefault, restoreDefault } = useCodexData();

  const [tab, setTab] = useState<TabId>('levels');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState<EditState | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [showExport, setShowExport] = useState(false);

  const [levelSub, setLevelSub] = useState<LevelSub>('경지');
  const [artFaction, setArtFaction] = useState<ArtFactionFilter>('전체');
  const [artType, setArtType] = useState<ArtTypeFilter>('전체');
  const [miscSub, setMiscSub] = useState<MiscSub>('내공 이론');
  const [fortuneSub, setFortuneSub] = useState<FortuneSub>('영약');

  const reorder = useDragReorder<HasId>(
    getByTab(tab) as HasId[],
    (next) => {
      void setByTab(tab, next as TabData<TabId>[]);
    },
  );

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const filtered = useMemo(() => {
    switch (tab) {
      case 'levels': {
        const items = data.levels.filter((i) => i.sub === levelSub);
        return items.filter((i) => matches(levelSearchText(i), query));
      }
      case 'arts': {
        let items = data.arts;
        if (artFaction !== '전체') items = items.filter((i) => i.faction === artFaction);
        if (artType !== '전체') items = items.filter((i) => i.type === artType);
        return items.filter((i) => matches(artSearchText(i), query));
      }
      case 'factions':
        return data.factions.filter((i) => matches(factionSearchText(i), query));
      case 'titles':
        return data.titles.filter((i) => matches(titleSearchText(i), query));
      case 'misc': {
        const items = data.misc.filter((i) => i.sub === miscSub);
        return items.filter((i) => matches(miscSearchText(i), query));
      }
      case 'fortune': {
        const items = data.fortune.filter((i) => i.sub === fortuneSub);
        return items.filter((i) => matches(fortuneSearchText(i), query));
      }
    }
  }, [tab, data, levelSub, artFaction, artType, miscSub, fortuneSub, query]);

  const handleTabChange = (next: TabId) => {
    setTab(next);
    setExpandedId(null);
    setQuery('');
  };

  const openNew = () => {
    switch (tab) {
      case 'levels':
        setEdit({ tabId: 'levels', item: { ...createEmptyLevel(), id: '' }, isNew: true });
        break;
      case 'arts':
        setEdit({
          tabId: 'arts',
          item: { ...createEmptyArt(artFaction, artType), id: '' },
          isNew: true,
        });
        break;
      case 'factions':
        setEdit({ tabId: 'factions', item: { ...createEmptyFaction(), id: '' }, isNew: true });
        break;
      case 'titles':
        setEdit({ tabId: 'titles', item: { ...createEmptyTitle(), id: '' }, isNew: true });
        break;
      case 'misc':
        setEdit({ tabId: 'misc', item: { ...createEmptyMisc(miscSub), id: '' }, isNew: true });
        break;
      case 'fortune':
        setEdit({
          tabId: 'fortune',
          item: { ...createEmptyFortune(fortuneSub), id: '' },
          isNew: true,
        });
        break;
    }
  };

  const saveEdit = () => {
    if (!edit) return;
    const current = getByTab(edit.tabId);
    const next = edit.isNew
      ? [...current, { ...edit.item, id: createId() }]
      : current.map((x: HasId) => (x.id === edit.item.id ? edit.item : x));
    void setByTab(edit.tabId, next as TabData<typeof edit.tabId>[]);
    setEdit(null);
  };

  const deleteEdit = () => {
    if (!edit) return;
    const current = getByTab(edit.tabId);
    const next = (current as HasId[]).filter((x) => x.id !== edit.item.id);
    void setByTab(edit.tabId, next as TabData<typeof edit.tabId>[]);
    setEdit(null);
  };

  const handleSaveAsDefault = () =>
    setConfirm({
      msg: '현재 데이터를 이 탭의 기본값으로 저장하시겠습니까?',
      onOk: () => {
        void saveAsDefault(tab);
        setConfirm({ msg: '저장이 완료되었습니다.', onOk: null });
      },
    });

  const handleRestoreDefault = () =>
    setConfirm({
      msg: '기본값으로 복원하시겠습니까?\n현재 데이터가 저장된 기본값으로 대체됩니다.',
      onOk: () => {
        void restoreDefault(tab);
        setExpandedId(null);
        setConfirm(null);
      },
    });

  if (!ready) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
        불러오는 중...
      </div>
    );
  }

  const filters = (() => {
    switch (tab) {
      case 'levels':
        return (
          <div style={{ marginBottom: '12px' }}>
            <PillSelector
              options={LEVEL_SUBS}
              value={levelSub}
              onChange={(v) => {
                setLevelSub(v);
                setExpandedId(null);
              }}
              labelOf={(v) => LEVEL_SUB_LABELS[v]}
            />
          </div>
        );
      case 'arts':
        return (
          <div
            style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: 600,
                }}
              >
                세력
              </p>
              <PillSelector
                options={ART_FACTION_FILTERS}
                value={artFaction}
                onChange={(v) => {
                  setArtFaction(v);
                  setExpandedId(null);
                }}
                labelOf={(v) => ART_FACTION_LABELS[v]}
              />
            </div>
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: 600,
                }}
              >
                계열
              </p>
              <PillSelector
                options={ART_TYPE_FILTERS}
                value={artType}
                onChange={(v) => {
                  setArtType(v);
                  setExpandedId(null);
                }}
                labelOf={(v) => ART_TYPE_LABELS[v]}
              />
            </div>
          </div>
        );
      case 'misc':
        return (
          <div style={{ marginBottom: '12px' }}>
            <PillSelector
              options={MISC_SUBS}
              value={miscSub}
              onChange={(v) => {
                setMiscSub(v);
                setExpandedId(null);
              }}
            />
          </div>
        );
      case 'fortune':
        return (
          <div style={{ marginBottom: '12px' }}>
            <PillSelector
              options={FORTUNE_SUBS}
              value={fortuneSub}
              onChange={(v) => {
                setFortuneSub(v);
                setExpandedId(null);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  })();

  const renderCards = () => {
    if (filtered.length === 0) return <EmptyState />;
    switch (tab) {
      case 'levels':
        return (filtered as typeof data.levels).map((i) => (
          <DraggableRow key={i.id} id={i.id} reorder={reorder}>
            <LevelCard
              level={i}
              expanded={expandedId === i.id}
              onToggle={() => toggleExpand(i.id)}
              onEdit={() =>
                setEdit({
                  tabId: 'levels',
                  item: { ...i, aliases: [...i.aliases] },
                  isNew: false,
                })
              }
            />
          </DraggableRow>
        ));
      case 'arts':
        return (filtered as typeof data.arts).map((i) => (
          <DraggableRow key={i.id} id={i.id} reorder={reorder}>
            <ArtCard
              art={i}
              expanded={expandedId === i.id}
              onToggle={() => toggleExpand(i.id)}
              onEdit={() =>
                setEdit({
                  tabId: 'arts',
                  item: { ...i, traits: [...i.traits], details: [...i.details] },
                  isNew: false,
                })
              }
            />
          </DraggableRow>
        ));
      case 'factions':
        return (filtered as typeof data.factions).map((i) => (
          <DraggableRow key={i.id} id={i.id} reorder={reorder}>
            <FactionCard
              faction={i}
              expanded={expandedId === i.id}
              onToggle={() => toggleExpand(i.id)}
              onEdit={() =>
                setEdit({
                  tabId: 'factions',
                  item: JSON.parse(JSON.stringify(i)),
                  isNew: false,
                })
              }
            />
          </DraggableRow>
        ));
      case 'titles':
        return (filtered as typeof data.titles).map((i) => (
          <DraggableRow key={i.id} id={i.id} reorder={reorder}>
            <TitleCard
              title={i}
              expanded={expandedId === i.id}
              onToggle={() => toggleExpand(i.id)}
              onEdit={() =>
                setEdit({
                  tabId: 'titles',
                  item: { ...i, members: [...i.members] },
                  isNew: false,
                })
              }
            />
          </DraggableRow>
        ));
      case 'misc':
        return (filtered as typeof data.misc).map((i) => (
          <DraggableRow key={i.id} id={i.id} reorder={reorder}>
            <MiscCard
              misc={i}
              expanded={expandedId === i.id}
              onToggle={() => toggleExpand(i.id)}
              onEdit={() =>
                setEdit({
                  tabId: 'misc',
                  item: { ...i, details: [...i.details] },
                  isNew: false,
                })
              }
            />
          </DraggableRow>
        ));
      case 'fortune':
        return (filtered as typeof data.fortune).map((i) => (
          <DraggableRow key={i.id} id={i.id} reorder={reorder}>
            <FortuneCard
              fortune={i}
              expanded={expandedId === i.id}
              onToggle={() => toggleExpand(i.id)}
              onEdit={() =>
                setEdit({
                  tabId: 'fortune',
                  item: { ...i, details: [...i.details] },
                  isNew: false,
                })
              }
            />
          </DraggableRow>
        ));
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Noto Serif KR','Nanum Myeongjo',Georgia,serif",
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        paddingBottom: '32px',
      }}
    >
      <CodexHeader onExport={() => setShowExport(true)} />
      <CodexSearch
        value={query}
        onChange={(v) => {
          setQuery(v);
          setExpandedId(null);
        }}
      />
      <CodexTabs value={tab} onChange={handleTabChange} />
      <div style={{ padding: '16px 20px' }}>
        <CodexToolbar
          onAdd={openNew}
          onSaveAsDefault={handleSaveAsDefault}
          onRestoreDefault={handleRestoreDefault}
          filters={filters}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{renderCards()}</div>
      </div>

      {edit && (
        <EntryEditModal
          state={edit}
          onChange={setEdit}
          onSave={saveEdit}
          onDelete={deleteEdit}
          onClose={() => setEdit(null)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.msg}
          onConfirm={confirm.onOk}
          onCancel={() => setConfirm(null)}
        />
      )}

      {showExport && (
        <ExportModal
          data={data}
          onClose={() => setShowExport(false)}
          onCopied={() => {
            setShowExport(false);
            setConfirm({ msg: '클립보드에 복사되었습니다.', onOk: null });
          }}
        />
      )}
    </div>
  );
};
