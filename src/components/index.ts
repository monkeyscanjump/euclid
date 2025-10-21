// Auto-generated component exports
export { Components, JSX } from '../components.d';

// Core components
export { EuclidCoreProvider } from './core/euclid-core-provider/euclid-core-provider';
export { EuclidDataList } from './core/euclid-data-list/euclid-data-list';
export { EuclidLiquidityController } from './core/euclid-liquidity-controller/euclid-liquidity-controller';
export { EuclidMarketDataController } from './core/euclid-market-data-controller/euclid-market-data-controller';
export { EuclidSwapController } from './core/euclid-swap-controller/euclid-swap-controller';
export { EuclidTxTrackerController } from './core/euclid-tx-tracker-controller/euclid-tx-tracker-controller';
export { EuclidUserDataController } from './core/euclid-user-data-controller/euclid-user-data-controller';
export { EuclidWalletController } from './core/euclid-wallet-controller/euclid-wallet-controller';

// Export configuration factory
export { createTokensConfig, createChainsConfig, createPoolsConfig, createDataListConfig } from './core/euclid-data-list/config-factory';

// UI Components
export { EuclidButton } from './ui/euclid-button/euclid-button';
export { EuclidTokenInput } from './ui/euclid-token-input/euclid-token-input';
export { EuclidModal } from './ui/euclid-modal/euclid-modal';
export { EuclidTokenContent } from './ui/euclid-token-content/euclid-token-content';
export { EuclidWalletContent } from './ui/euclid-wallet-content/euclid-wallet-content';
export { EuclidChainItem } from './ui/euclid-chain-item/euclid-chain-item';
export { EuclidTokenItem } from './ui/euclid-token-item/euclid-token-item';
export { EuclidListItems } from './ui/euclid-list-items/euclid-list-items';

// Feature Components
export { EuclidSwapCard } from './features/euclid-swap-card/euclid-swap-card';
export { EuclidLiquidityCard } from './features/euclid-liquidity-card/euclid-liquidity-card';
export { EuclidPoolsList } from './features/euclid-pools-list/euclid-pools-list';
export { EuclidTokensList } from './features/euclid-tokens-list/euclid-tokens-list';
export { EuclidChainsList } from './features/euclid-chains-list/euclid-chains-list';
export { EuclidPortfolioOverview } from './features/euclid-portfolio-overview/euclid-portfolio-overview';

// Re-export component interfaces
export type {
  // Core component types

  // UI component types
  ButtonVariant,
  ButtonSize,
  TokenInfo as TokenInputInfo
} from '../components.d';

// Re-export store types for convenience
export type {
  WalletState,
  WalletInfo,
  MarketState,
  AppState,
  SwapState,
  LiquidityState,
  UserBalance,
  LiquidityPosition,
  ChainConfig,
  TokenInfo,
  PoolInfo,
  SwapRoute,
  Transaction
} from '../utils/types';
