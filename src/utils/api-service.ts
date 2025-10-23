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
