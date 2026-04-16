import type { Title } from './types';
import { joinSearchable } from '../../../shared/lib';

export const titleSearchText = (title: Title): string =>
  joinSearchable([
    title.name,
    title.tag,
    title.desc,
    title.notes,
    ...title.members.map((m) => m.n + m.d),
  ]);
