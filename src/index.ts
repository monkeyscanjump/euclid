// Export all components for framework integrations
export { Components, JSX } from './components';

// Note: Individual Stencil components are exported via the auto-generated Components interface
// For framework integrations, use the Components and JSX interfaces above
// Individual component classes are available at runtime through the custom element registry

// Export stores
export {
  walletStore,
  marketStore,
  appStore,
  swapStore,
  liquidityStore
} from './store';

// Export utility types and interfaces
export type * from './utils/types';

// Export utilities
export { apiClient } from './utils/api-client';
export { DEFAULT_CONFIG, ENVIRONMENT_PRESETS, mergeConfig } from './utils/env';
export type { EuclidConfig } from './utils/env';
export * from './utils/constants';
