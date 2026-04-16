import type { HasId, MemberEntry } from '../../../shared/lib';

export interface Title extends HasId {
  name: string;
  tag: string;
  desc: string;
  members: MemberEntry[];
  notes: string;
}

export const createEmptyTitle = (): Omit<Title, 'id'> => ({
  name: '',
  tag: '',
  desc: '',
  members: [],
  notes: '',
});
