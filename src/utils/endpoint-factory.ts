/**
 * Enhanced Request Factory System
 * Automatically generates and manages API endpoints with proper typing, caching, and error handling
 */

import { requestManager } from './request-manager';

export interface EndpointConfig {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  type: 'graphql' | 'rest';
  query?: string;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal' | 'none';
  cacheTTL?: number;
  pollInterval?: number;
  priority: 'high' | 'normal' | 'low';
  retryConfig?: {
    maxRetries: number;
    backoffMultiplier: number;
    baseDelay: number;
  };
}

export interface RequestOptions {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  skipCache?: boolean;
  timeout?: number;
}

/**
 * GraphQL Query Factory
 * Generates and manages GraphQL queries with automatic caching and optimization
 */
export class GraphQLQueryFactory {
  private endpoint: string;
  private defaultHeaders: Record<string, string>;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Generate a cached GraphQL query executor
   */
  createQuery<TResult>(config: EndpointConfig) {
    return async (options: RequestOptions = {}): Promise<TResult> => {
      const cacheKey = this.generateCacheKey(config.id, options.variables);

      return requestManager.request(
        cacheKey,
        () => this.executeGraphQLQuery<TResult>(config, options),
        {
          ttl: this.getCacheTTL(config.cacheStrategy, config.cacheTTL),
          priority: config.priority,
        }
      );
    };
  }

  /**
   * Execute a GraphQL query with proper error handling
   */
  private async executeGraphQLQuery<TResult>(
    config: EndpointConfig,
    options: RequestOptions
  ): Promise<TResult> {
    const { variables = {}, headers = {}, timeout = 10000 } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { ...this.defaultHeaders, ...headers },
        body: JSON.stringify({
          query: config.query,
          variables,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }

      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.enhanceError(error, config);
    }
  }

  /**
   * Generate a consistent cache key
   */
  private generateCacheKey(queryId: string, variables?: Record<string, unknown>): string {
    const variablesHash = variables ? JSON.stringify(variables) : '';
    return `gql:${queryId}:${btoa(variablesHash)}`;
  }

  /**
   * Get cache TTL based on strategy
   */
  private getCacheTTL(strategy: string, customTTL?: number): number {
    if (customTTL) return customTTL;

    switch (strategy) {
      case 'aggressive': return 300000; // 5 minutes
      case 'moderate': return 60000;   // 1 minute
      case 'minimal': return 10000;    // 10 seconds
      case 'none': return 0;           // No cache
      default: return 30000;           // 30 seconds default
    }
  }

  /**
   * Enhance errors with context
   */
  private enhanceError(error: unknown, config: EndpointConfig): Error {
    const baseMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Error(`GraphQL ${config.id} failed: ${baseMessage}`);
  }
}

/**
 * REST Endpoint Factory
 * Generates and manages REST endpoints with automatic caching and retry logic
 */
export class RESTEndpointFactory {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Generate a cached REST endpoint executor
   */
  createEndpoint<TResult>(config: EndpointConfig) {
    return async (options: RequestOptions = {}): Promise<TResult> => {
      const cacheKey = this.generateCacheKey(config.method, config.path, options.variables);

      return requestManager.request(
        cacheKey,
        () => this.executeRESTRequest<TResult>(config, options),
        {
          ttl: this.getCacheTTL(config.cacheStrategy, config.cacheTTL),
          priority: config.priority,
        }
      );
    };
  }

  /**
   * Execute a REST request with proper error handling and retries
   */
  private async executeRESTRequest<TResult>(
    config: EndpointConfig,
    options: RequestOptions
  ): Promise<TResult> {
    const { variables = {}, headers = {}, timeout = 10000 } = options;
    const retryConfig = config.retryConfig || { maxRetries: 3, backoffMultiplier: 2, baseDelay: 1000 };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const result = await this.makeRequest<TResult>(config, variables, headers, timeout);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < retryConfig.maxRetries) {
          const delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw this.enhanceError(lastError!, config);
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest<TResult>(
    config: EndpointConfig,
    variables: Record<string, unknown>,
    headers: Record<string, string>,
    timeout: number
  ): Promise<TResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = this.buildURL(config.path, config.method === 'GET' ? variables : undefined);
      const body = config.method !== 'GET' ? JSON.stringify(variables) : undefined;

      const response = await fetch(url, {
        method: config.method,
        headers: { ...this.defaultHeaders, ...headers },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Build URL with query parameters for GET requests
   */
  private buildURL(path: string, queryParams?: Record<string, unknown>): string {
    const url = new URL(path, this.baseURL);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Generate a consistent cache key
   */
  private generateCacheKey(method: string, path: string, variables?: Record<string, unknown>): string {
    const variablesHash = variables ? JSON.stringify(variables) : '';
    return `rest:${method}:${path}:${btoa(variablesHash)}`;
  }

  /**
   * Get cache TTL based on strategy
   */
  private getCacheTTL(strategy: string, customTTL?: number): number {
    if (customTTL) return customTTL;

    switch (strategy) {
      case 'aggressive': return 300000; // 5 minutes
      case 'moderate': return 60000;   // 1 minute
      case 'minimal': return 10000;    // 10 seconds
      case 'none': return 0;           // No cache
      default: return 30000;           // 30 seconds default
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhance errors with context
   */
  private enhanceError(error: Error, config: EndpointConfig): Error {
    return new Error(`REST ${config.method} ${config.path} failed: ${error.message}`);
  }
}

/**
 * Endpoint Registry
 * Central registry for all API endpoints with metadata and configuration
 */
export class EndpointRegistry {
  private endpoints = new Map<string, EndpointConfig>();
  private graphqlFactory: GraphQLQueryFactory;
  private restFactory: RESTEndpointFactory;

  constructor(graphqlEndpoint: string, restEndpoint: string) {
    this.graphqlFactory = new GraphQLQueryFactory(graphqlEndpoint);
    this.restFactory = new RESTEndpointFactory(restEndpoint);
  }

  /**
   * Register a new endpoint
   */
  register(config: EndpointConfig): void {
    this.endpoints.set(config.id, config);
  }

  /**
   * Register multiple endpoints
   */
  registerBatch(configs: EndpointConfig[]): void {
    configs.forEach(config => this.register(config));
  }

  /**
   * Get an endpoint executor
   */
  getEndpoint<TResult>(endpointId: string) {
    const config = this.endpoints.get(endpointId);
    if (!config) {
      throw new Error(`Endpoint ${endpointId} not found in registry`);
    }

    if (config.type === 'graphql') {
      return this.graphqlFactory.createQuery<TResult>(config);
    } else {
      return this.restFactory.createEndpoint<TResult>(config);
    }
  }

  /**
   * Get all registered endpoints
   */
  getAllEndpoints(): EndpointConfig[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Get endpoints by category
   */
  getEndpointsByType(type: 'graphql' | 'rest'): EndpointConfig[] {
    return Array.from(this.endpoints.values()).filter(config => config.type === type);
  }

  /**
   * Clear the registry
   */
  clear(): void {
    this.endpoints.clear();
  }
}

// Default export for easy usage
export const createEndpointRegistry = (graphqlEndpoint: string, restEndpoint: string) => {
  return new EndpointRegistry(graphqlEndpoint, restEndpoint);
};
