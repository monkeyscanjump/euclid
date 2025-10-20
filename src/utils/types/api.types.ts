// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Chain Types
export interface ChainConfig {
  chainId: string;
  chainUID: string;
  name: string;
  displayName: string;
  type: 'cosmos' | 'evm';
  rpcUrl: string;
  restUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  explorer?: string;
  logo?: string;
}

// Token Types
export interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  chainUID: string;
  address?: string;
  denom?: string;
  logo?: string;
  coingeckoId?: string;
}

export interface TokenBalance {
  tokenId: string;
  balance: string;
  formattedBalance: string;
  usdValue?: string;
}

// Pool Types
export interface PoolInfo {
  id: string;
  token1: TokenInfo;
  token2: TokenInfo;
  liquidity: string;
  volume24h?: string;
  fees24h?: string;
  apr?: string;
}

// Route Types
export interface SwapRoute {
  id: string;
  inputToken: TokenInfo;
  outputToken: TokenInfo;
  inputAmount: string;
  outputAmount: string;
  priceImpact: string;
  fee: string;
  path: string[];
  estimatedTime: number;
}

// Transaction Types
export interface Transaction {
  hash: string;
  chainUID: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer';
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  from: string;
  to?: string;
  amount?: string;
  fee?: string;
  blockHeight?: number;
}
