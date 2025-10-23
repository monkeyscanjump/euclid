import { createStore } from '@stencil/store';
import type { LiquidityState } from '../utils/types/euclid-api.types';
import type { TokenMetadata, PoolInfo, LiquidityPosition } from '../utils/types/api.types';
import type { BaseStore } from './types';
import { logger } from '../utils/logger';

const initialState: LiquidityState = {
  token1: null,
  token2: null,
  amount1: '',
  amount2: '',
  token1Amount: '', // legacy alias
  token2Amount: '', // legacy alias
  pool: null,
  selectedPool: null, // legacy alias
  userLpBalance: '0',
  loading: false,
  error: null,
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

  setToken1(token: TokenMetadata | null) {
    state.token1 = token;

    // Clear pool if tokens don't match
    if (state.pool && token &&
        state.pool.token_1 !== token.id &&
        state.pool.token_2 !== token.id) {
      state.pool = null;
    }
  },

  setToken2(token: TokenMetadata | null) {
    state.token2 = token;

    // Clear pool if tokens don't match
    if (state.pool && token &&
        state.pool.token_1 !== token.id &&
        state.pool.token_2 !== token.id) {
      state.pool = null;
    }
  },

  setAmount1(amount: string) {
    state.amount1 = amount;
    state.token1Amount = amount; // Keep alias synchronized
  },

  setAmount2(amount: string) {
    state.amount2 = amount;
    state.token2Amount = amount; // Keep alias synchronized
  },

  // Backward compatibility aliases
  setToken1Amount(amount: string) {
    actions.setAmount1(amount);
  },

  setToken2Amount(amount: string) {
    actions.setAmount2(amount);
  },

  setPool(pool: PoolInfo | null) {
    state.pool = pool;
    state.selectedPool = pool; // Keep alias synchronized
  },

  // Backward compatibility alias
  setSelectedPool(pool: PoolInfo | null) {
    actions.setPool(pool);
  },

  setUserLpBalance(balance: string) {
    state.userLpBalance = balance;
  },

  swapTokens() {
    const token1 = state.token1;
    const token2 = state.token2;
    const amount1 = state.amount1;
    const amount2 = state.amount2;

    state.token1 = token2;
    state.token2 = token1;
    state.amount1 = amount2;
    state.amount2 = amount1;
  },

  clear() {
    reset();
  },

  // Additional methods that components expect
  setAddingLiquidity(loading: boolean) {
    state.loading = loading;
  },

  setRemovingLiquidity(loading: boolean) {
    state.loading = loading;
  },

  getPosition(poolId: string): LiquidityPosition | null {
    // This would typically fetch from API or cache
    // For now, return null
    logger.warn('LiquidityStore', `getPosition(${poolId}) not implemented`);
    return null;
  },
};

// Getters
const getters = {
  canAddLiquidity: () => {
    return !!(
      state.token1 &&
      state.token2 &&
      state.amount1 &&
      state.amount2 &&
      parseFloat(state.amount1) > 0 &&
      parseFloat(state.amount2) > 0 &&
      !state.loading
    );
  },

  canRemoveLiquidity: () => {
    return !!(
      state.pool &&
      state.userLpBalance &&
      parseFloat(state.userLpBalance) > 0 &&
      !state.loading
    );
  },

  getPoolLiquidity: () => {
    return state.pool?.total_liquidity || '0';
  },

  getPoolVolume24h: () => {
    return state.pool?.volume_24h || '0';
  },

  getPoolFees24h: () => {
    return state.pool?.fees_24h || '0';
  },

  getPoolAPR: () => {
    return state.pool?.apr || '0';
  },

  isValidPair: () => {
    return !!(
      state.token1 &&
      state.token2 &&
      state.token1.id !== state.token2.id
    );
  },
};

// Store interface
export interface LiquidityStore extends BaseStore<LiquidityState> {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setToken1: (token: TokenMetadata | null) => void;
  setToken2: (token: TokenMetadata | null) => void;
  setAmount1: (amount: string) => void;
  setAmount2: (amount: string) => void;
  setToken1Amount: (amount: string) => void; // alias
  setToken2Amount: (amount: string) => void; // alias
  setPool: (pool: PoolInfo | null) => void;
  setSelectedPool: (pool: PoolInfo | null) => void; // alias
  setUserLpBalance: (balance: string) => void;
  swapTokens: () => void;
  clear: () => void;
  setAddingLiquidity: (loading: boolean) => void;
  setRemovingLiquidity: (loading: boolean) => void;
  getPosition: (poolId: string) => LiquidityPosition | null;
  canAddLiquidity: () => boolean;
  canRemoveLiquidity: () => boolean;
  getPoolLiquidity: () => string;
  getPoolVolume24h: () => string;
  getPoolFees24h: () => string;
  getPoolAPR: () => string;
  isValidPair: () => boolean;
}

export const liquidityStore: LiquidityStore = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

export type { LiquidityState };
