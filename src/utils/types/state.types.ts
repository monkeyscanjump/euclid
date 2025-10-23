import type { ChainConfig, TokenInfo, TokenBalance, PoolInfo, SwapRoute } from './api.types';

// Wallet State Types
export interface WalletInfo {
  address: string;
  chainUID: string;
  name?: string;
  type: 'keplr' | 'metamask' | 'walletconnect' | 'other';
  balances: TokenBalance[];
  autoConnect?: boolean; // Auto-reconnect when session expires
}

export interface WalletState {
  wallets: Map<string, WalletInfo>; // chainUID -> WalletInfo
  isInitialized: boolean;
}

// Market State Types
export interface MarketState {
  chains: ChainConfig[];
  tokens: TokenInfo[];
  pools: PoolInfo[];
  isLoading: boolean;
  lastUpdated?: number;
}

// App State Types
export interface AppState {
  walletModalOpen: boolean;
  walletModalFilter?: string | null; // chainUID filter
  tokenModalOpen: boolean;
  isInitialized: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// Swap State Types
export interface SwapState {
  fromToken?: TokenInfo;
  toToken?: TokenInfo;
  fromAmount: string;
  toAmount: string;
  routes: SwapRoute[];
  selectedRoute?: SwapRoute;
  isLoadingRoutes: boolean;
  slippage: number;
  isSwapping: boolean;
  lastRouteUpdate?: number;
}

// Liquidity State Types
export interface LiquidityPosition {
  poolId: string;
  pool: PoolInfo;
  lpTokenBalance: string;
  token1Amount: string;
  token2Amount: string;
  sharePercentage: string;
  usdValue?: string;
}

export interface LiquidityState {
  positions: LiquidityPosition[];
  selectedPool?: PoolInfo;
  token1?: TokenInfo;
  token2?: TokenInfo;
  token1Amount: string;
  token2Amount: string;
  isAddingLiquidity: boolean;
  isRemovingLiquidity: boolean;
}
