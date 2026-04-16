import type { DetailEntry, HasId } from '../../../shared/lib';

export const MISC_SUBS = ['내공 이론', '무공 범주', '증상', '기타'] as const;
export type MiscSub = (typeof MISC_SUBS)[number];

export interface Misc extends HasId {
  sub: MiscSub;
  name: string;
  tag: string;
  desc: string;
  details: DetailEntry[];
  notes: string;
}

export const createEmptyMisc = (sub: MiscSub): Omit<Misc, 'id'> => ({
  sub,
  name: '',
  tag: '',
  desc: '',
  details: [],
  notes: '',
});
