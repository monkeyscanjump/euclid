import { createStore } from '@stencil/store';
import type { EuclidChainConfig, TokenMetadata, PoolInfo } from '../utils/types/api.types';
import type { MarketState } from '../utils/types/euclid-api.types';
import type { BaseStore } from './types';

const initialState: MarketState = {
  chains: [],
  tokens: [],
  pools: [],
  prices: {},
  loading: false,
  error: null,
  lastUpdated: 0,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Actions
const actions = {
  setLoading(loading: boolean) {
    state.loading = loading;
  },

  setError(error: string | null) {
    state.error = error;
  },

  setChains(chains: EuclidChainConfig[]) {
    state.chains = [...chains];
    state.lastUpdated = Date.now();
  },

  setTokens(tokens: TokenMetadata[]) {
    state.tokens = [...tokens];
    state.lastUpdated = Date.now();
  },

  setPools(pools: PoolInfo[]) {
    state.pools = [...pools];
    state.lastUpdated = Date.now();
  },

  setPrices(prices: Record<string, number>) {
    state.prices = { ...prices };
    state.lastUpdated = Date.now();
  },

  addToken(token: TokenMetadata) {
    state.tokens = [...state.tokens, token];
  },

  updateToken(tokenId: string, updates: Partial<TokenMetadata>) {
    state.tokens = state.tokens.map(token =>
      token.id === tokenId ? { ...token, ...updates } : token
    );
  },

  clear() {
    reset();
  },
};

// Getters
const getters = {
  getChain: (chainUID: string) =>
    state.chains.find(chain => chain.chain_uid === chainUID),

  getToken: (tokenId: string) =>
    state.tokens.find(token => token.id === tokenId),

  getTokensByChain: (chainUID: string) =>
    state.tokens.filter(token => token.chain_uid === chainUID),

  getPool: (poolId: string) =>
    state.pools.find(pool => pool.pool_id === poolId),

  getPoolsForTokenPair: (token1: string, token2: string) =>
    state.pools.filter(pool =>
      (pool.token_1 === token1 && pool.token_2 === token2) ||
      (pool.token_1 === token2 && pool.token_2 === token1)
    ),

  getPrice: (tokenId: string) =>
    state.prices[tokenId] || 0,

  isDataStale: (maxAge: number = 5 * 60 * 1000) => { // 5 minutes default
    if (!state.lastUpdated) return true;
    return Date.now() - state.lastUpdated > maxAge;
  },
};

// Proper store type definition extending BaseStore
export interface MarketStore extends BaseStore<MarketState> {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setChains: (chains: EuclidChainConfig[]) => void;
  setTokens: (tokens: TokenMetadata[]) => void;
  setPools: (pools: PoolInfo[]) => void;
  setPrices: (prices: Record<string, number>) => void;
  addToken: (token: TokenMetadata) => void;
  updateToken: (tokenId: string, updates: Partial<TokenMetadata>) => void;
  clear: () => void;
  getChain: (chainUID: string) => EuclidChainConfig | undefined;
  getToken: (tokenId: string) => TokenMetadata | undefined;
  getTokensByChain: (chainUID: string) => TokenMetadata[];
  getPool: (poolId: string) => PoolInfo | undefined;
  getPoolsForTokenPair: (token1: string, token2: string) => PoolInfo[];
  getPrice: (tokenId: string) => number;
  isDataStale: (maxAge?: number) => boolean;
}

export const marketStore: MarketStore = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

// Expose store globally for debugging and testing
if (typeof window !== 'undefined') {
  (window as unknown as { marketStore: MarketStore }).marketStore = marketStore;
}

export type { MarketState, EuclidChainConfig, TokenMetadata, PoolInfo };
