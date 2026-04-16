import { useCallback, useEffect, useState } from 'react';
import { storage } from '../../../shared/api';
import { dataKey, customDefaultKey, type TabId } from '../../../shared/config';
import { DEFAULT_LEVELS, type Level } from '../../../entities/level';
import { DEFAULT_ARTS, type Art } from '../../../entities/art';
import { DEFAULT_FACTIONS, type Faction } from '../../../entities/faction';
import { DEFAULT_TITLES, type Title } from '../../../entities/title';
import { DEFAULT_MISC, type Misc } from '../../../entities/misc';
import { DEFAULT_FORTUNE, type Fortune } from '../../../entities/fortune';

export interface CodexData {
  levels: Level[];
  arts: Art[];
  factions: Faction[];
  titles: Title[];
  misc: Misc[];
  fortune: Fortune[];
}

const ORIGINAL: CodexData = {
  levels: DEFAULT_LEVELS,
  arts: DEFAULT_ARTS,
  factions: DEFAULT_FACTIONS,
  titles: DEFAULT_TITLES,
  misc: DEFAULT_MISC,
  fortune: DEFAULT_FORTUNE,
};

type TabDataMap = {
  levels: Level;
  arts: Art;
  factions: Faction;
  titles: Title;
  misc: Misc;
  fortune: Fortune;
};

export type TabData<T extends TabId> = TabDataMap[T];

export interface CodexDataApi {
  ready: boolean;
  data: CodexData;
  getByTab: <T extends TabId>(tab: T) => TabData<T>[];
  setByTab: <T extends TabId>(tab: T, next: TabData<T>[]) => Promise<void>;
  saveAsDefault: (tab: TabId) => Promise<void>;
  restoreDefault: (tab: TabId) => Promise<void>;
}

export const useCodexData = (): CodexDataApi => {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<CodexData>(ORIGINAL);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [levels, arts, factions, titles, misc, fortune] = await Promise.all([
        storage.get<Level[]>(dataKey('levels'), DEFAULT_LEVELS),
        storage.get<Art[]>(dataKey('arts'), DEFAULT_ARTS),
        storage.get<Faction[]>(dataKey('factions'), DEFAULT_FACTIONS),
        storage.get<Title[]>(dataKey('titles'), DEFAULT_TITLES),
        storage.get<Misc[]>(dataKey('misc'), DEFAULT_MISC),
        storage.get<Fortune[]>(dataKey('fortune'), DEFAULT_FORTUNE),
      ]);
      if (cancelled) return;
      setData({ levels, arts, factions, titles, misc, fortune });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getByTab = useCallback(
    <T extends TabId>(tab: T): TabData<T>[] => data[tab] as TabData<T>[],
    [data],
  );

  const setByTab = useCallback(
    async <T extends TabId>(tab: T, next: TabData<T>[]): Promise<void> => {
      setData((prev) => ({ ...prev, [tab]: next }));
      await storage.set(dataKey(tab), next);
    },
    [],
  );

  const saveAsDefault = useCallback(
    async (tab: TabId) => {
      await storage.set(customDefaultKey(tab), data[tab]);
    },
    [data],
  );

  const restoreDefault = useCallback(
    async (tab: TabId) => {
      const custom = await storage.get<CodexData[TabId] | null>(customDefaultKey(tab), null);
      const fallback = ORIGINAL[tab];
      const next = (custom ?? fallback) as CodexData[TabId];
      setData((prev) => ({ ...prev, [tab]: next }));
      await storage.set(dataKey(tab), next);
    },
    [],
  );

  return { ready, data, getByTab, setByTab, saveAsDefault, restoreDefault };
};
