import type { Misc } from './types';
import { joinSearchable } from '../../../shared/lib';

export const miscSearchText = (misc: Misc): string =>
  joinSearchable([
    misc.name,
    misc.tag,
    misc.desc,
    misc.notes,
    ...misc.details.map((d) => d.l + d.t),
  ]);
