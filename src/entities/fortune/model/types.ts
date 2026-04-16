import type { DetailEntry, HasId } from '../../../shared/lib';

export const FORTUNE_SUBS = ['영약', '영물', '신병이기'] as const;
export type FortuneSub = (typeof FORTUNE_SUBS)[number];

export interface Fortune extends HasId {
  sub: FortuneSub;
  name: string;
  tag: string;
  desc: string;
  details: DetailEntry[];
  notes: string;
}

export const createEmptyFortune = (sub: FortuneSub): Omit<Fortune, 'id'> => ({
  sub,
  name: '',
  tag: '',
  desc: '',
  details: [],
  notes: '',
});
