/**
 * Unified Euclid API Service
 * Now uses ultra-lightweight lazy-loading core API
 */

// Import the new minimal core API
export {
  LazyEuclidAPI,
  euclidAPI as euclidAPIService,
  createEuclidAPI as createEuclidAPIService
} from './core-api';

// Re-export types for backward compatibility
export type {
  SwapRequest,
  AddLiquidityRequest,
  RemoveLiquidityRequest,
  GetRoutesRequest,
  CrossChainUser
} from './types/api.types';

// Note: The old smart-api-service and endpoint system are now deprecated
// This new system provides the same API but with lazy loading for ~90% bundle size reduction
