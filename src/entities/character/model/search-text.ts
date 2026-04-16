import type { Character } from './types';
import { joinSearchable } from '../../../shared/lib';

export const characterSearchText = (c: Character): string =>
  joinSearchable([
    c.name,
    c.desc,
    c.source,
    c.origin,
    c.sex,
    c.age,
    c.notes,
    ...c.aliases,
    ...c.traits,
    ...c.relations.map((r) => r.n + r.d),
  ]);
