/**
 * Endpoints Module - Lazy Loading System
 * Export all endpoint-related functionality
 */

// Base types and interfaces
export type { EndpointConfig, EndpointCategory, EndpointLoader } from './base';

// Lazy loading system
export { lazyEndpointLoader, LazyEndpointLoader, type EndpointCategoryName } from './loader';

// Dynamic registry
export { DynamicEndpointRegistry, createDynamicRegistry, type RequestOptions } from './registry';

// Category exports for manual loading if needed
export { default as CHAIN_ENDPOINTS } from './chains';
export { default as TOKEN_ENDPOINTS } from './tokens';
export { default as POOL_ENDPOINTS } from './pools';
export { default as ROUTING_ENDPOINTS } from './routing';
export { default as TRANSACTION_ENDPOINTS } from './transactions';
export { default as USER_ENDPOINTS } from './user';
