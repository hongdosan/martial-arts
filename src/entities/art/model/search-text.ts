import type { Art } from './types';
import { joinSearchable } from '../../../shared/lib';

export const artSearchText = (art: Art): string =>
  joinSearchable([
    art.name,
    art.desc,
    art.tag,
    art.notes,
    art.faction,
    art.type,
    art.merits,
    art.demerits,
    ...art.traits,
    ...art.details.map((d) => d.l + d.t),
  ]);
