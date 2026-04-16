import type { Fortune } from './types';
import { joinSearchable } from '../../../shared/lib';

export const fortuneSearchText = (fortune: Fortune): string =>
  joinSearchable([
    fortune.name,
    fortune.tag,
    fortune.desc,
    fortune.notes,
    ...fortune.details.map((d) => d.l + d.t),
  ]);
