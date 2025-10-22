/**
 * Base Endpoint Definitions
 * Core types and interfaces for lazy-loaded endpoint system
 */

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

export interface EndpointCategory {
  name: string;
  endpoints: EndpointConfig[];
}

export type EndpointLoader = () => Promise<EndpointCategory>;
