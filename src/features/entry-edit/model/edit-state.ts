import type { Level } from '../../../entities/level';
import type { Art } from '../../../entities/art';
import type { Faction } from '../../../entities/faction';
import type { Title } from '../../../entities/title';
import type { Character } from '../../../entities/character';
import type { Misc } from '../../../entities/misc';
import type { Fortune } from '../../../entities/fortune';

export type EditState =
  | { tabId: 'levels'; item: Level; isNew: boolean }
  | { tabId: 'arts'; item: Art; isNew: boolean }
  | { tabId: 'factions'; item: Faction; isNew: boolean }
  | { tabId: 'titles'; item: Title; isNew: boolean }
  | { tabId: 'characters'; item: Character; isNew: boolean }
  | { tabId: 'misc'; item: Misc; isNew: boolean }
  | { tabId: 'fortune'; item: Fortune; isNew: boolean };

export const patchItem = <T extends EditState>(state: T, patch: Partial<T['item']>): T => ({
  ...state,
  item: { ...state.item, ...patch },
});
