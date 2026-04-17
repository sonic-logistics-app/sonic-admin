import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [originalData, setOriginalData] = useState<T[]>(initialData);

  const optimisticUpdate = useCallback(async <R>(
    updateFn: (currentData: T[]) => T[],
    apiFn: () => Promise<R>,
    onSuccess?: (result: R, newData: T[]) => T[],
    onError?: (error: any) => void
  ): Promise<R | null> => {
    // Store original data for rollback
    setOriginalData(data);
    
    // Apply optimistic update
    const newData = updateFn(data);
    setData(newData);

    try {
      const result = await apiFn();
      
      // Apply success transformation if provided
      if (onSuccess) {
        const finalData = onSuccess(result, newData);
        setData(finalData);
        setOriginalData(finalData);
      } else {
        setOriginalData(newData);
      }
      
      return result;
    } catch (error: any) {
      // Rollback on error
      setData(originalData);
      
      if (onError) {
        onError(error);
      }
      
      return null;
    }
  }, [data, originalData]);

  const resetData = useCallback((newData: T[]) => {
    setData(newData);
    setOriginalData(newData);
  }, []);

  return {
    data,
    optimisticUpdate,
    resetData
  };
}