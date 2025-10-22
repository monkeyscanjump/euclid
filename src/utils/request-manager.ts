/**
 * Request Manager - Simple request deduplication and caching
 * Uses web-standard Map and Promise patterns
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface RequestConfig {
  ttl?: number; // Time to live in milliseconds
  priority?: 'high' | 'normal' | 'low';
}

export class RequestManager {
  private pendingRequests = new Map<string, Promise<unknown>>();
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: Required<RequestConfig>;

  constructor(config: RequestConfig = {}) {
    this.config = {
      ttl: 30000, // 30 seconds default
      priority: 'normal',
      ...config
    };
  }

  /**
   * Execute a request with deduplication and caching
   * @param key Unique identifier for the request
   * @param requestFn Function that returns a Promise
   * @param config Optional config overrides
   */
  async request<T>(
    key: string,
    requestFn: () => Promise<T>,
    config?: RequestConfig
  ): Promise<T> {
    const requestConfig = { ...this.config, ...config };

    // Check if same request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < requestConfig.ttl) {
      return cached.data as T;
    }

    // Execute the request
    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;

      // Cache the successful result
      this.cache.set(key, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } finally {
      // Always clean up pending request
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Clear cache entry
   */
  clearCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Check if data is cached and fresh
   */
  isCached(key: string, ttl?: number): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const maxAge = ttl || this.config.ttl;
    return (Date.now() - cached.timestamp) < maxAge;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Default instance
export const requestManager = new RequestManager();
