import type { TabId } from './tabs';

export const STORAGE_PREFIX = 'ma';

export const dataKey = (tabId: TabId): string => `${STORAGE_PREFIX}:data:${tabId}`;
export const customDefaultKey = (tabId: TabId): string => `${STORAGE_PREFIX}:default:${tabId}`;
