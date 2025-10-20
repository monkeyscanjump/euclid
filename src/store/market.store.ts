import { createStore } from '@stencil/store';
import type { MarketState, ChainConfig, TokenInfo, PoolInfo } from '../utils/types';

const initialState: MarketState = {
  chains: [],
  tokens: [],
  pools: [],
  isLoading: false,
  lastUpdated: undefined,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Actions
const actions = {
  setLoading(loading: boolean) {
    state.isLoading = loading;
  },

  setChains(chains: ChainConfig[]) {
    state.chains = [...chains];
    state.lastUpdated = Date.now();
  },

  setTokens(tokens: TokenInfo[]) {
    state.tokens = [...tokens];
    state.lastUpdated = Date.now();
  },

  setPools(pools: PoolInfo[]) {
    state.pools = [...pools];
    state.lastUpdated = Date.now();
  },

  addToken(token: TokenInfo) {
    state.tokens = [...state.tokens, token];
  },

  updateToken(tokenId: string, updates: Partial<TokenInfo>) {
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
    state.chains.find(chain => chain.chainUID === chainUID),

  getToken: (tokenId: string) =>
    state.tokens.find(token => token.id === tokenId),

  getTokensByChain: (chainUID: string) =>
    state.tokens.filter(token => token.chainUID === chainUID),

  getPool: (poolId: string) =>
    state.pools.find(pool => pool.id === poolId),

  getPoolsForTokenPair: (token1Id: string, token2Id: string) =>
    state.pools.filter(pool =>
      (pool.token1.id === token1Id && pool.token2.id === token2Id) ||
      (pool.token1.id === token2Id && pool.token2.id === token1Id)
    ),

  isDataStale: (maxAge: number = 5 * 60 * 1000) => { // 5 minutes default
    if (!state.lastUpdated) return true;
    return Date.now() - state.lastUpdated > maxAge;
  },
};

// Proper store type definition
export interface MarketStore {
  state: MarketState;
  onChange: typeof onChange;
  reset: typeof reset;
  dispose: typeof dispose;
  setLoading: (loading: boolean) => void;
  setChains: (chains: ChainConfig[]) => void;
  setTokens: (tokens: TokenInfo[]) => void;
  setPools: (pools: PoolInfo[]) => void;
  addToken: (token: TokenInfo) => void;
  updateToken: (tokenId: string, updates: Partial<TokenInfo>) => void;
  clear: () => void;
  getChain: (chainUID: string) => ChainConfig | undefined;
  getToken: (tokenId: string) => TokenInfo | undefined;
  getTokensByChain: (chainUID: string) => TokenInfo[];
  getPool: (poolId: string) => PoolInfo | undefined;
  getPoolsForTokenPair: (token1Id: string, token2Id: string) => PoolInfo[];
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

export type { MarketState, ChainConfig, TokenInfo, PoolInfo };
