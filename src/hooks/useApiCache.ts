import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 30000; // 30 seconds

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const apiCache = new ApiCache();

interface UseApiCacheOptions {
  ttl?: number;
  enabled?: boolean;
}

export function useApiCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (useCache = true) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache) {
        const cached = apiCache.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Fetch fresh data
      const result = await fetchFn();
      apiCache.set(key, result);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      // Return cached data if available on error
      const cached = apiCache.get<T>(key);
      if (cached) {
        setData(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, enabled]);

  const refresh = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    apiCache.delete(key);
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache
  };
}

export { apiCache };