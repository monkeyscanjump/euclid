import { createStore } from '@stencil/store';
import type { EuclidChainConfig, TokenMetadata, PoolInfo } from '../utils/types/api.types';
import type { MarketState } from '../utils/types/euclid-api.types';
import type { BaseStore } from './types';
import { wrapStoreWithSmartUpdates } from '../utils/store-update-coordinator';

const initialState: MarketState = {
  chains: [],
  tokens: [],
  pools: [],
  prices: {},
  loading: false,
  error: null,
  lastUpdated: 0,
  lastChainsUpdate: 0,
  lastTokensUpdate: 0,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Wrap the store with smart update capabilities
const smartStore = wrapStoreWithSmartUpdates(
  { state, onChange },
  'market-store',
  {
    debounceMs: 150, // Debounce updates for 150ms
    deepCompare: true,
    skipFields: ['loading', 'error'] // Don't debounce loading/error changes
  }
);

// Actions with smart updates to prevent flickering
const actions = {
  setLoading(loading: boolean) {
    // Loading state should update immediately (not debounced)
    state.loading = loading;
  },

  setError(error: string | null) {
    // Error state should update immediately (not debounced)
    state.error = error;
  },

  // Immediate update methods for initial data loads
  setChains(chains: EuclidChainConfig[]) {
    // Use immediate update to ensure UI gets data quickly
    state.chains = [...chains];
    state.lastChainsUpdate = Date.now();
    state.lastUpdated = Date.now();
  },

  setTokens(tokens: TokenMetadata[]) {
    // Use immediate update to ensure UI gets data quickly
    state.tokens = [...tokens];
    state.lastTokensUpdate = Date.now();
    state.lastUpdated = Date.now();
  },  setPools(pools: PoolInfo[]) {
    // Use immediate update to ensure UI gets data quickly
    state.pools = [...pools];
    state.lastUpdated = Date.now();
  },

  setPrices(prices: Record<string, number>) {
    // Use immediate update for price changes
    state.prices = { ...prices };
    state.lastUpdated = Date.now();
  },

  // Smart update methods for incremental/polling updates
  updateChainsSmartly(chains: EuclidChainConfig[]) {
    smartStore.smartUpdate({
      chains: [...chains],
      lastUpdated: Date.now(),
    });
  },

  updateTokensSmartly(tokens: TokenMetadata[]) {
    smartStore.smartUpdate({
      tokens: [...tokens],
      lastUpdated: Date.now(),
    });
  },

  updatePoolsSmartly(pools: PoolInfo[]) {
    smartStore.smartUpdate({
      pools: [...pools],
      lastUpdated: Date.now(),
    });
  },

  addToken(token: TokenMetadata) {
    // Use smart update for incremental changes (can be debounced)
    smartStore.smartUpdate({
      tokens: [...state.tokens, token],
    }, { debounceMs: 0 });
  },

  updateToken(tokenId: string, updates: Partial<TokenMetadata>) {
    // Use smart update for incremental changes (can be debounced)
    smartStore.smartUpdate({
      tokens: state.tokens.map(token =>
        token.id === tokenId ? { ...token, ...updates } : token
      ),
    }, { debounceMs: 0 });
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

  isChainsStale: (maxAge: number = 5 * 60 * 1000) => {
    if (!state.lastChainsUpdate) return true;
    return Date.now() - state.lastChainsUpdate > maxAge;
  },

  isTokensStale: (maxAge: number = 5 * 60 * 1000) => {
    if (!state.lastTokensUpdate) return true;
    return Date.now() - state.lastTokensUpdate > maxAge;
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
  isChainsStale: (maxAge?: number) => boolean;
  isTokensStale: (maxAge?: number) => boolean;
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
