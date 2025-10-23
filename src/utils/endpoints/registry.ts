/**
 * Dynamic Endpoint Registry
 * Smart registry that loads endpoints on-demand using the lazy loader
 */

import { lazyEndpointLoader, type LazyEndpointLoader, type EndpointCategoryName } from './loader';
import { GraphQLQueryFactory, RESTEndpointFactory } from '../endpoint-factory';
import type { EndpointConfig } from './base';
import { logger } from '../logger';

export interface RequestOptions {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  skipCache?: boolean;
  timeout?: number;
}

type EndpointExecutor<TResult = unknown> = (options?: RequestOptions) => Promise<TResult>;

/**
 * Dynamic endpoint registry with lazy loading and smart caching
 */
export class DynamicEndpointRegistry {
  private graphqlFactory: GraphQLQueryFactory;
  private restFactory: RESTEndpointFactory;
  private loader: LazyEndpointLoader;
  private endpointExecutors = new Map<string, EndpointExecutor>();

  constructor(graphqlEndpoint: string, restEndpoint: string, loader?: LazyEndpointLoader) {
    this.graphqlFactory = new GraphQLQueryFactory(graphqlEndpoint);
    this.restFactory = new RESTEndpointFactory(restEndpoint);
    this.loader = loader || lazyEndpointLoader;
  }

  /**
   * Get an endpoint executor, loading it lazily if needed
   */
  async getEndpoint<TResult>(endpointId: string): Promise<EndpointExecutor<TResult>> {
    // Return cached executor if available
    if (this.endpointExecutors.has(endpointId)) {
      return this.endpointExecutors.get(endpointId)! as EndpointExecutor<TResult>;
    }

    // Load endpoint config lazily
    const config = await this.loader.loadEndpoint(endpointId);
    if (!config) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    // Create and cache executor
    const executor = this.createEndpointExecutor<TResult>(config);
    this.endpointExecutors.set(endpointId, executor);

    return executor;
  }

  /**
   * Create an endpoint executor for a given config
   */
  private createEndpointExecutor<TResult>(config: EndpointConfig): EndpointExecutor<TResult> {
    if (config.type === 'graphql') {
      return this.graphqlFactory.createQuery<TResult>(config);
    } else {
      return this.restFactory.createEndpoint<TResult>(config);
    }
  }

  /**
   * Pre-load endpoints for a specific category
   */
  async preloadCategory(categoryName: string): Promise<void> {
    // Validate category name
    const validCategories: EndpointCategoryName[] = ['chains', 'tokens', 'pools', 'routing', 'transactions', 'user'];
    if (!validCategories.includes(categoryName as EndpointCategoryName)) {
      throw new Error(`Invalid category: ${categoryName}. Valid categories: ${validCategories.join(', ')}`);
    }

    const category = await this.loader.loadCategory(categoryName as EndpointCategoryName);

    // Create executors for all endpoints in the category
    const executorPromises = category.endpoints.map(async (config) => {
      if (!this.endpointExecutors.has(config.id)) {
        const executor = this.createEndpointExecutor(config);
        this.endpointExecutors.set(config.id, executor);
      }
    });

    await Promise.all(executorPromises);
    logger.info('Utils', `✅ Pre-loaded ${category.endpoints.length} endpoints from ${categoryName} category`);
  }  /**
   * Pre-load specific endpoints in batch
   */
  async preloadEndpoints(endpointIds: string[]): Promise<void> {
    const configs = await this.loader.loadEndpoints(endpointIds);

    configs.forEach(config => {
      if (!this.endpointExecutors.has(config.id)) {
        const executor = this.createEndpointExecutor(config);
        this.endpointExecutors.set(config.id, executor);
      }
    });

    logger.info('Utils', `✅ Pre-loaded ${configs.length} endpoints: ${endpointIds.join(', ')}`);
  }

  /**
   * Check if an endpoint is available (without loading it)
   */
  isEndpointAvailable(endpointId: string): boolean {
    return this.loader.getCategoryForEndpoint(endpointId) !== null;
  }

  /**
   * Check if an endpoint is loaded and ready
   */
  isEndpointLoaded(endpointId: string): boolean {
    return this.endpointExecutors.has(endpointId);
  }

  /**
   * Get all available endpoint IDs
   */
  getAllEndpointIds(): string[] {
    return this.loader.getAllEndpointIds();
  }

  /**
   * Get endpoint IDs for a specific category
   */
  getEndpointIdsForCategory(categoryName: string): string[] {
    const categoryKey = categoryName as keyof typeof import('./loader').ENDPOINT_LOADERS;
    return this.loader.getEndpointIdsForCategory(categoryKey);
  }

  /**
   * Get loading and caching statistics
   */
  getStats(): {
    loader: ReturnType<LazyEndpointLoader['getLoadingStats']>;
    registry: {
      totalExecutors: number;
      loadedExecutors: number;
      executorIds: string[];
    };
  } {
    return {
      loader: this.loader.getLoadingStats(),
      registry: {
        totalExecutors: this.getAllEndpointIds().length,
        loadedExecutors: this.endpointExecutors.size,
        executorIds: Array.from(this.endpointExecutors.keys()),
      },
    };
  }

  /**
   * Clear all caches (useful for testing)
   */
  clearCache(): void {
    this.endpointExecutors.clear();
    this.loader.clearCache();
  }

  /**
   * Get the underlying loader for advanced usage
   */
  getLoader(): LazyEndpointLoader {
    return this.loader;
  }
}

/**
 * Factory function for creating a dynamic registry
 */
export const createDynamicRegistry = (graphqlEndpoint: string, restEndpoint: string) => {
  return new DynamicEndpointRegistry(graphqlEndpoint, restEndpoint);
};
