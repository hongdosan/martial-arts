import type { Level } from './types';
import { joinSearchable } from '../../../shared/lib';

export const levelSearchText = (level: Level): string =>
  joinSearchable([level.name, level.desc, level.conditions, level.notes, ...level.aliases]);
