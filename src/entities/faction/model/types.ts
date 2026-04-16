import type { HasId, MemberGroup } from '../../../shared/lib';

export interface Faction extends HasId {
  name: string;
  tag: string;
  desc: string;
  groups: MemberGroup[];
  notes: string;
}

export const createEmptyFaction = (): Omit<Faction, 'id'> => ({
  name: '',
  tag: '',
  desc: '',
  groups: [{ label: '', members: [{ n: '', d: '' }] }],
  notes: '',
});
