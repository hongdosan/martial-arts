import type { HasId, MemberEntry } from '../../../shared/lib';

export const CHARACTER_SUBS = ['주역', '조연', '반동', '기타'] as const;
export type CharacterSub = (typeof CHARACTER_SUBS)[number];

export interface Character extends HasId {
  sub: CharacterSub;
  name: string;
  aliases: string[];
  source: string;
  sex: string;
  age: string;
  origin: string;
  desc: string;
  traits: string[];
  relations: MemberEntry[];
  notes: string;
}

export const createEmptyCharacter = (sub: CharacterSub): Omit<Character, 'id'> => ({
  sub,
  name: '',
  aliases: [],
  source: '',
  sex: '',
  age: '',
  origin: '',
  desc: '',
  traits: [],
  relations: [],
  notes: '',
});
