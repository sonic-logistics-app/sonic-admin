import { useState, useEffect, useCallback } from 'react';

interface ProgressiveLoadingOptions<T> {
  criticalData: () => Promise<T>;
  secondaryData?: () => Promise<any>;
  delay?: number;
}

export function useProgressiveLoading<T>({
  criticalData,
  secondaryData,
  delay = 100
}: ProgressiveLoadingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load critical data first
      const critical = await criticalData();
      setData(critical);
      setLoading(false);

      // Load secondary data after delay
      if (secondaryData) {
        setTimeout(async () => {
          try {
            await secondaryData();
            setSecondaryLoaded(true);
          } catch (err) {
            // Silently fail secondary data
          }
        }, delay);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setLoading(false);
    }
  }, [criticalData, secondaryData, delay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    secondaryLoaded,
    refresh: loadData
  };
}