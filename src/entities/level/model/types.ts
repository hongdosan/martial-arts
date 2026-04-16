import type { HasId } from '../../../shared/lib';

export const LEVEL_SUBS = ['경지', '검도', '성취', '방어', '공격'] as const;
export type LevelSub = (typeof LEVEL_SUBS)[number];

export interface Level extends HasId {
  sub: LevelSub;
  rank: string;
  name: string;
  aliases: string[];
  desc: string;
  conditions: string;
  notes: string;
}

export const LEVEL_SUB_LABELS: Record<LevelSub, string> = {
  경지: '무림 경지',
  검도: '검도 경지',
  성취: '성취',
  방어: '방어',
  공격: '공격',
};

export const createEmptyLevel = (): Omit<Level, 'id'> => ({
  sub: '경지',
  rank: '',
  name: '',
  aliases: [],
  desc: '',
  conditions: '',
  notes: '',
});
