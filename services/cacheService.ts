
type CacheEntry<T> = {
  value: T;
  expires: number;
};

const memoryCache = new Map<string, CacheEntry<any>>();

export function getCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  memoryCache.set(key, {
    value,
    expires: Date.now() + ttlMs
  });
}
