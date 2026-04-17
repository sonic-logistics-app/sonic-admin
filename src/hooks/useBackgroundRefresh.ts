import { useEffect, useRef } from 'react';

interface UseBackgroundRefreshOptions {
  interval?: number;
  enabled?: boolean;
}

export function useBackgroundRefresh<T>(
  fetchFn: () => Promise<T>,
  onUpdate: (data: T) => void,
  options: UseBackgroundRefreshOptions = {}
) {
  const { interval = 30000, enabled = true } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const refresh = async () => {
      try {
        const data = await fetchFn();
        onUpdate(data);
      } catch (error) {
        // Silently fail background refresh
      }
    };

    intervalRef.current = setInterval(refresh, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchFn, onUpdate, interval, enabled]);

  const stopRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startRefresh = () => {
    if (!intervalRef.current && enabled) {
      const refresh = async () => {
        try {
          const data = await fetchFn();
          onUpdate(data);
        } catch (error) {
          // Silently fail background refresh
        }
      };

      intervalRef.current = setInterval(refresh, interval);
    }
  };

  return {
    stopRefresh,
    startRefresh
  };
}