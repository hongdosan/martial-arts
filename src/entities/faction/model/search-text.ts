import type { Faction } from './types';
import { joinSearchable } from '../../../shared/lib';

export const factionSearchText = (faction: Faction): string =>
  joinSearchable([
    faction.name,
    faction.tag,
    faction.desc,
    faction.notes,
    ...faction.groups.flatMap((g) => [g.label, ...g.members.map((m) => m.n + m.d)]),
  ]);
