import type { DetailEntry, HasId } from '../../../shared/lib';

export const ART_FACTIONS = ['정파', '사파', '마교', '혈교', '세외', '무소속'] as const;
export type ArtFaction = (typeof ART_FACTIONS)[number];

export const ART_FACTION_FILTERS = ['전체', ...ART_FACTIONS] as const;
export type ArtFactionFilter = (typeof ART_FACTION_FILTERS)[number];

export const ART_TYPES = ['심법', '병기법', '권각법', '신보법', '호신법', '암기법', '특수법'] as const;
export type ArtType = (typeof ART_TYPES)[number];

export const ART_TYPE_FILTERS = ['전체', ...ART_TYPES] as const;
export type ArtTypeFilter = (typeof ART_TYPE_FILTERS)[number];

export interface Art extends HasId {
  faction: ArtFaction;
  type: ArtType;
  name: string;
  tag: string;
  desc: string;
  traits: string[];
  merits: string;
  demerits: string;
  details: DetailEntry[];
  notes: string;
}

export const ART_FACTION_LABELS: Record<ArtFactionFilter, string> = {
  전체: '전체',
  정파: '正 정파',
  사파: '邪 사파',
  마교: '魔 마교',
  혈교: '血 혈교',
  세외: '塞外 세외',
  무소속: '浪 무소속',
};

export const ART_TYPE_LABELS: Record<ArtTypeFilter, string> = {
  전체: '전체',
  심법: '心法 심법',
  병기법: '兵器 병기법',
  권각법: '拳脚 권각법',
  신보법: '身步 신보법',
  호신법: '護身 호신법',
  암기법: '暗器 암기법',
  특수법: '特殊 특수법',
};

export const createEmptyArt = (
  faction: ArtFactionFilter,
  type: ArtTypeFilter,
): Omit<Art, 'id'> => ({
  faction: faction === '전체' ? '정파' : faction,
  type: type === '전체' ? '심법' : type,
  name: '',
  tag: '',
  desc: '',
  traits: [],
  merits: '',
  demerits: '',
  details: [],
  notes: '',
});
