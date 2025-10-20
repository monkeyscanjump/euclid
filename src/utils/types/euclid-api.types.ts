// Euclid Protocol Specific Types
// These are derived from the Euclid documentation and used internally

import type {
  TokenWithDenom,
  TokenWithDenomAndAmount,
  CrossChainUser,
  EuclidChainConfig,
  TokenMetadata,
  PoolInfo,
  UserBalance,
  SwapPath,
  RoutePath,
  TransactionResponse
} from './api.types';

// Re-export for convenience
export type { RoutePath } from './api.types';

// Legacy alias
export type ChainInfo = EuclidChainConfig;

// ============================================================================
// INTERNAL STORE TYPES
// ============================================================================

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  chainUID: string | null;
  walletType: 'metamask' | 'keplr' | 'phantom' | null;
  balances: UserBalance[];
  loading: boolean;
  error: string | null;
}

// Legacy wallet info type for backward compatibility
export interface WalletInfo {
  address: string;
  chainUID: string;
  isConnected: boolean;
  walletType: 'metamask' | 'keplr' | 'phantom';
  type?: 'metamask' | 'keplr' | 'phantom'; // legacy alias for walletType
  name?: string; // legacy compatibility
  balances: UserBalance[];
}

export interface SwapState {
  tokenIn: TokenMetadata | null;
  tokenOut: TokenMetadata | null;
  fromToken: TokenMetadata | null; // alias for backward compatibility
  toToken: TokenMetadata | null;   // alias for backward compatibility
  amountIn: string;
  amountOut: string;
  fromAmount: string; // alias for backward compatibility
  toAmount: string;   // alias for backward compatibility
  routes: RoutePath[];
  selectedRoute: RoutePath | null;
  slippage: number;
  loading: boolean;
  error: string | null;
}

export interface LiquidityState {
  token1: TokenMetadata | null;
  token2: TokenMetadata | null;
  amount1: string;
  amount2: string;
  token1Amount: string; // legacy alias for amount1
  token2Amount: string; // legacy alias for amount2
  pool: PoolInfo | null;
  selectedPool: PoolInfo | null; // legacy alias for pool
  userLpBalance: string;
  loading: boolean;
  error: string | null;
}

export interface MarketState {
  chains: EuclidChainConfig[];
  tokens: TokenMetadata[];
  pools: PoolInfo[];
  prices: Record<string, number>;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface TokenInputProps {
  label: string;
  value: string;
  token: TokenMetadata | null;
  balances: UserBalance[];
  onValueChange: (value: string) => void;
  onTokenSelect: () => void;
  disabled?: boolean;
  showBalance?: boolean;
  showMax?: boolean;
}

export interface PoolCardProps {
  pool: PoolInfo;
  token1Metadata: TokenMetadata;
  token2Metadata: TokenMetadata;
  userLpBalance?: string;
  onAddLiquidity: () => void;
  onRemoveLiquidity: () => void;
}

// ============================================================================
// API CLIENT INTERFACES
// ============================================================================

export interface EuclidGraphQLClient {
  getChains(variables?: { showAllChains?: boolean; type?: string }): Promise<EuclidChainConfig[]>;
  getTokenMetadata(variables?: { token?: string; chain_uid?: string }): Promise<TokenMetadata[]>;
  getAllPools(): Promise<PoolInfo[]>;
  getUserBalances(user: CrossChainUser): Promise<UserBalance[]>;
}

export interface EuclidRESTClient {
  getRoutes(request: {
    amount_in: string;
    token_in: string;
    token_out: string;
    external?: boolean;
    chain_uids?: string[];
  }): Promise<RoutePath[]>;

  buildSwapTransaction(request: {
    amount_in: string;
    asset_in: TokenWithDenom;
    slippage: string;
    sender: CrossChainUser;
    swap_path: SwapPath;
  }): Promise<TransactionResponse>;

  buildAddLiquidityTransaction(request: {
    slippage_tolerance_bps: number;
    pair_info: { token_1: TokenWithDenomAndAmount; token_2: TokenWithDenomAndAmount };
    sender: CrossChainUser;
  }): Promise<TransactionResponse>;

  buildRemoveLiquidityTransaction(request: {
    slippage_tolerance_bps: number;
    lp_token_amount: string;
    sender: CrossChainUser;
  }): Promise<TransactionResponse>;
}

// ============================================================================
// WALLET ADAPTER TYPES
// ============================================================================

export interface WalletAdapter {
  type: 'metamask' | 'keplr' | 'phantom';
  isAvailable(): boolean;
  connect(chainId?: string): Promise<{ address: string; chainId: string }>;
  disconnect(): Promise<void>;
  getBalance(address: string): Promise<string>;
  signAndBroadcast(transaction: TransactionResponse): Promise<string>;
  switchChain(chainId: string): Promise<void>;
  addChain(config: EuclidChainConfig): Promise<void>;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface WalletConnectedEvent {
  address: string;
  chainId: string;
  chainUID: string;
  walletType: 'metamask' | 'keplr' | 'phantom';
}

export interface SwapCompletedEvent {
  txHash: string;
  tokenIn: TokenWithDenomAndAmount;
  tokenOut: TokenWithDenomAndAmount;
  route: RoutePath;
}

export interface LiquidityAddedEvent {
  txHash: string;
  token1: TokenWithDenomAndAmount;
  token2: TokenWithDenomAndAmount;
  lpTokenAmount: string;
}

export interface LiquidityRemovedEvent {
  txHash: string;
  lpTokenAmount: string;
  token1Amount: string;
  token2Amount: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ChainType = 'EVM' | 'Cosmwasm';

export interface FormattedBalance {
  raw: string;
  formatted: string;
  symbol: string;
  usdValue?: number;
}

export interface PriceInfo {
  tokenId: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  chainUID: string;
  blockHeight?: number;
  gasUsed?: string;
  fee?: string;
}
