/**
 * Lazy Endpoint Loader
 * Dynamic imports for endpoint categories with automatic tree-shaking
 */

import type { EndpointCategory, EndpointConfig } from './base';
import { logger } from '../logger';

/**
 * Endpoint category loaders using dynamic imports for tree-shaking
 */
export const ENDPOINT_LOADERS = {
  chains: () => import('./chains').then(m => m.default),
  tokens: () => import('./tokens').then(m => m.default),
  pools: () => import('./pools').then(m => m.default),
  routing: () => import('./routing').then(m => m.default),
  transactions: () => import('./transactions').then(m => m.default),
  user: () => import('./user').then(m => m.default),
} as const;

export type EndpointCategoryName = keyof typeof ENDPOINT_LOADERS;

/**
 * Endpoint metadata for determining which category an endpoint belongs to
 * This is statically analyzable and doesn't require loading full endpoint configs
 */
const ENDPOINT_CATEGORY_MAP: Record<string, EndpointCategoryName> = {
  // Chain endpoints
  'getChains': 'chains',

  // Token endpoints
  'getTokenMetadata': 'tokens',
  'getTokenById': 'tokens',
  'getTokenPriceHistory': 'tokens',
  'getTokenHolders': 'tokens',
  'getTokenTransfers': 'tokens',
  'getTokenSupply': 'tokens',
  'getTokenMarketData': 'tokens',
  'getTokenSocial': 'tokens',
  'getTokenPairs': 'tokens',
  'getVerifiedTokens': 'tokens',
  'getTokenAnalytics': 'tokens',
  'searchTokens': 'tokens',
  'getTokenBySymbol': 'tokens',

  // Pool endpoints
  'getAllPools': 'pools',
  'getPoolById': 'pools',
  'getPoolStatistics': 'pools',
  'getPoolLiquidityProviders': 'pools',
  'getPoolTransactions': 'pools',
  'getPoolVolume': 'pools',
  'getPoolFees': 'pools',
  'getPoolAPR': 'pools',
  'getPoolTVL': 'pools',
  'getPoolComposition': 'pools',
  'getPoolInfo': 'pools',

  // Routing endpoints
  'getRoutes': 'routing',
  'getOptimalRoute': 'routing',
  'getMultiRoutes': 'routing',
  'getRouteStatistics': 'routing',
  'getRouteFees': 'routing',
  'simulateRoute': 'routing',

  // Transaction endpoints
  'buildSwapTransaction': 'transactions',
  'buildAddLiquidityTransaction': 'transactions',
  'buildRemoveLiquidityTransaction': 'transactions',
  'broadcastTransaction': 'transactions',
  'getTransactionStatus': 'transactions',
  'getTransactionDetails': 'transactions',
  'estimateTransactionFees': 'transactions',
  'simulateTransaction': 'transactions',
  'getUserTransactions': 'transactions',
  'getPendingTransactions': 'transactions',
  'batchTransactions': 'transactions',

  // User endpoints
  'getUserBalances': 'user',
};

/**
 * Lazy endpoint loader with caching and error handling
 */
export class LazyEndpointLoader {
  private loadedCategories = new Map<EndpointCategoryName, EndpointCategory>();
  private loadingPromises = new Map<EndpointCategoryName, Promise<EndpointCategory>>();

  /**
   * Get the category name for an endpoint
   */
  getCategoryForEndpoint(endpointId: string): EndpointCategoryName | null {
    return ENDPOINT_CATEGORY_MAP[endpointId] || null;
  }

  /**
   * Load a specific endpoint category lazily
   */
  async loadCategory(categoryName: EndpointCategoryName): Promise<EndpointCategory> {
    // Return cached category if already loaded
    if (this.loadedCategories.has(categoryName)) {
      return this.loadedCategories.get(categoryName)!;
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(categoryName)) {
      return this.loadingPromises.get(categoryName)!;
    }

    // Start loading the category
    const loadingPromise = this.loadCategoryInternal(categoryName);
    this.loadingPromises.set(categoryName, loadingPromise);

    try {
      const category = await loadingPromise;
      this.loadedCategories.set(categoryName, category);
      this.loadingPromises.delete(categoryName);
      return category;
    } catch (error) {
      this.loadingPromises.delete(categoryName);
      throw error;
    }
  }

  /**
   * Internal category loading with error handling
   */
  private async loadCategoryInternal(categoryName: EndpointCategoryName): Promise<EndpointCategory> {
    const loader = ENDPOINT_LOADERS[categoryName];
    if (!loader) {
      throw new Error(`Unknown endpoint category: ${categoryName}`);
    }

    try {
      logger.info('Utils', `🔄 Loading ${categoryName} endpoints...`);
      const category = await loader();
      logger.info('Utils', `✅ Loaded ${categoryName} endpoints (${category.endpoints.length} endpoints)`);
      return category;
    } catch (error) {
      logger.error('Utils', `❌ Failed to load ${categoryName} endpoints:`, error);
      throw new Error(`Failed to load ${categoryName} endpoints: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load a specific endpoint config lazily
   */
  async loadEndpoint(endpointId: string): Promise<EndpointConfig | null> {
    const categoryName = this.getCategoryForEndpoint(endpointId);
    if (!categoryName) {
      logger.warn('Utils', `Unknown endpoint: ${endpointId}`);
      return null;
    }

    const category = await this.loadCategory(categoryName);
    const endpoint = category.endpoints.find(ep => ep.id === endpointId);

    if (!endpoint) {
      logger.warn('Utils', `Endpoint ${endpointId} not found in category ${categoryName}`);
      return null;
    }

    return endpoint;
  }

  /**
   * Load multiple endpoints efficiently (batched by category)
   */
  async loadEndpoints(endpointIds: string[]): Promise<EndpointConfig[]> {
    // Group endpoints by category
    const categoriesNeeded = new Set<EndpointCategoryName>();
    const endpointToCategory = new Map<string, EndpointCategoryName>();

    for (const endpointId of endpointIds) {
      const categoryName = this.getCategoryForEndpoint(endpointId);
      if (categoryName) {
        categoriesNeeded.add(categoryName);
        endpointToCategory.set(endpointId, categoryName);
      }
    }

    // Load all needed categories in parallel
    const loadPromises = Array.from(categoriesNeeded).map(categoryName =>
      this.loadCategory(categoryName)
    );

    const categories = await Promise.all(loadPromises);
    const categoryMap = new Map<EndpointCategoryName, EndpointCategory>();

    for (let i = 0; i < categories.length; i++) {
      const categoryName = Array.from(categoriesNeeded)[i];
      categoryMap.set(categoryName, categories[i]);
    }

    // Extract requested endpoints
    const endpoints: EndpointConfig[] = [];
    for (const endpointId of endpointIds) {
      const categoryName = endpointToCategory.get(endpointId);
      if (categoryName) {
        const category = categoryMap.get(categoryName);
        const endpoint = category?.endpoints.find(ep => ep.id === endpointId);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      }
    }

    return endpoints;
  }

  /**
   * Get all available endpoint IDs without loading them
   */
  getAllEndpointIds(): string[] {
    return Object.keys(ENDPOINT_CATEGORY_MAP);
  }

  /**
   * Get endpoint IDs for a specific category without loading
   */
  getEndpointIdsForCategory(categoryName: EndpointCategoryName): string[] {
    return Object.entries(ENDPOINT_CATEGORY_MAP)
      .filter(([_, category]) => category === categoryName)
      .map(([endpointId]) => endpointId);
  }

  /**
   * Check if a category is already loaded
   */
  isCategoryLoaded(categoryName: EndpointCategoryName): boolean {
    return this.loadedCategories.has(categoryName);
  }

  /**
   * Get stats about loaded categories
   */
  getLoadingStats(): {
    totalCategories: number;
    loadedCategories: number;
    totalEndpoints: number;
    loadedEndpoints: number;
    categoriesLoaded: EndpointCategoryName[];
  } {
    const totalCategories = Object.keys(ENDPOINT_LOADERS).length;
    const loadedCategories = this.loadedCategories.size;
    const totalEndpoints = this.getAllEndpointIds().length;
    const loadedEndpoints = Array.from(this.loadedCategories.values())
      .reduce((sum, category) => sum + category.endpoints.length, 0);
    const categoriesLoaded = Array.from(this.loadedCategories.keys());

    return {
      totalCategories,
      loadedCategories,
      totalEndpoints,
      loadedEndpoints,
      categoriesLoaded,
    };
  }

  /**
   * Clear all cached categories (useful for testing or reloading)
   */
  clearCache(): void {
    this.loadedCategories.clear();
    this.loadingPromises.clear();
  }
}

// Export singleton instance
export const lazyEndpointLoader = new LazyEndpointLoader();
