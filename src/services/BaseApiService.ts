import { apiCache } from '@/hooks/useApiCache';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';

interface ApiOptions {
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
}

class BaseApiService {
  private monitorResponseTime(startTime: number) {
    const responseTime = Date.now() - startTime;
    
    // Dispatch custom event for connection status monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('connection-status-update', {
        detail: { responseTime }
      }));
    }
    
    return responseTime;
  }

  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries: number = 3
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok || i === retries - 1) {
          return response;
        }
      } catch (error) {
        if (i === retries - 1) throw error;
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  protected async apiCall<T>(
    endpoint: string,
    options: RequestInit & ApiOptions = {}
  ): Promise<T> {
    const {
      cache = false,
      cacheTTL = 30000,
      retries = 3,
      timeout = 10000,
      ...fetchOptions
    } = options;

    const url = `${apiUrl}${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(fetchOptions)}`;
    
    // Check cache first for GET requests
    if (cache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      const cached = apiCache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = Date.now();
    
    try {
      // Add timeout to fetch options
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await this.fetchWithRetry(url, {
        ...fetchOptions,
        signal: controller.signal
      }, retries);

      clearTimeout(timeoutId);
      this.monitorResponseTime(startTime);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful GET responses
      if (cache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
        apiCache.set(cacheKey, data);
      }

      return data;
    } catch (error: any) {
      this.monitorResponseTime(startTime);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Batch multiple API calls
  protected async batchCalls<T>(calls: Array<() => Promise<T>>): Promise<T[]> {
    const results = await Promise.allSettled(calls.map(call => call()));
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        throw new Error(`Batch call ${index} failed: ${result.reason}`);
      }
    });
  }

  // Parallel API calls with error handling
  protected async parallelCalls<T>(calls: Record<string, () => Promise<T>>): Promise<Record<string, T | null>> {
    const entries = Object.entries(calls);
    const results = await Promise.allSettled(entries.map(([, call]) => call()));
    
    const output: Record<string, T | null> = {};
    entries.forEach(([key], index) => {
      const result = results[index];
      output[key] = result.status === 'fulfilled' ? result.value : null;
    });
    
    return output;
  }

  // Clear cache for specific patterns
  protected clearCache(pattern?: string) {
    if (pattern) {
      // Clear specific cache entries matching pattern
      // This would require extending the apiCache to support pattern matching
    } else {
      apiCache.clear();
    }
  }
}

export default BaseApiService;