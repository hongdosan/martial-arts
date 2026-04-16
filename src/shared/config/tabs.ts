export const TAB_IDS = ['levels', 'arts', 'factions', 'titles', 'fortune', 'misc'] as const;
export type TabId = (typeof TAB_IDS)[number];

export interface TabDef {
  id: TabId;
  label: string;
  icon: string;
}

export const TABS: readonly TabDef[] = [
  { id: 'levels', label: '경지', icon: '⛰' },
  { id: 'arts', label: '무공', icon: '⚔' },
  { id: 'factions', label: '세력', icon: '旗' },
  { id: 'titles', label: '칭호', icon: '冠' },
  { id: 'fortune', label: '기연', icon: '寶' },
  { id: 'misc', label: '기타', icon: '卷' },
];
