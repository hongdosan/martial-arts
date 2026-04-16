/**
 * 표준 localStorage 어댑터.
 * - 어떤 브라우저에서도 동작하는 Web Storage API 만 사용.
 * - 실패 시 메모리 폴백으로 런타임을 멈추지 않는다.
 */
const memory = new Map<string, string>();

const safeStorage = (): Storage | null => {
  try {
    if (typeof window === 'undefined') return null;
    const s = window.localStorage;
    const k = '__mal_probe__';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
};

const store = safeStorage();

export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = store ? store.getItem(key) : memory.get(key) ?? null;
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value);
    try {
      if (store) store.setItem(key, raw);
      else memory.set(key, raw);
    } catch {
      memory.set(key, raw);
    }
  },
};