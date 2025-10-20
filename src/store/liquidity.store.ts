import { createStore } from '@stencil/store';
import type { LiquidityState, LiquidityPosition, PoolInfo, TokenInfo } from '../utils/types';

const initialState: LiquidityState = {
  positions: [],
  selectedPool: undefined,
  token1: undefined,
  token2: undefined,
  token1Amount: '',
  token2Amount: '',
  isAddingLiquidity: false,
  isRemovingLiquidity: false,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Actions
const actions = {
  setPositions(positions: LiquidityPosition[]) {
    state.positions = [...positions];
  },

  addPosition(position: LiquidityPosition) {
    state.positions = [...state.positions, position];
  },

  updatePosition(poolId: string, updates: Partial<LiquidityPosition>) {
    state.positions = state.positions.map(position =>
      position.poolId === poolId ? { ...position, ...updates } : position
    );
  },

  removePosition(poolId: string) {
    state.positions = state.positions.filter(position => position.poolId !== poolId);
  },

  setSelectedPool(pool: PoolInfo) {
    state.selectedPool = pool;
    state.token1 = pool.token1;
    state.token2 = pool.token2;
  },

  setToken1(token: TokenInfo) {
    state.token1 = token;
    // Clear selected pool if tokens don't match
    if (state.selectedPool &&
        state.selectedPool.token1.id !== token.id &&
        state.selectedPool.token2.id !== token.id) {
      state.selectedPool = undefined;
    }
  },

  setToken2(token: TokenInfo) {
    state.token2 = token;
    // Clear selected pool if tokens don't match
    if (state.selectedPool &&
        state.selectedPool.token1.id !== token.id &&
        state.selectedPool.token2.id !== token.id) {
      state.selectedPool = undefined;
    }
  },

  setToken1Amount(amount: string) {
    state.token1Amount = amount;
  },

  setToken2Amount(amount: string) {
    state.token2Amount = amount;
  },

  setAddingLiquidity(adding: boolean) {
    state.isAddingLiquidity = adding;
  },

  setRemovingLiquidity(removing: boolean) {
    state.isRemovingLiquidity = removing;
  },

  clear() {
    reset();
  },
};

// Getters
const getters = {
  getPosition: (poolId: string) =>
    state.positions.find(position => position.poolId === poolId),

  canAddLiquidity: () => {
    return !!(
      state.token1 &&
      state.token2 &&
      state.token1Amount &&
      state.token2Amount &&
      parseFloat(state.token1Amount) > 0 &&
      parseFloat(state.token2Amount) > 0 &&
      !state.isAddingLiquidity
    );
  },

  canRemoveLiquidity: (poolId: string) => {
    const position = getters.getPosition(poolId);
    return !!(
      position &&
      parseFloat(position.lpTokenBalance) > 0 &&
      !state.isRemovingLiquidity
    );
  },

  getTotalValueLocked: () => {
    return state.positions.reduce((total, position) => {
      const value = parseFloat(position.usdValue || '0');
      return total + value;
    }, 0);
  },
};

// Proper store type definition
export interface LiquidityStore {
  state: LiquidityState;
  onChange: typeof onChange;
  reset: typeof reset;
  dispose: typeof dispose;
  setPositions: (positions: LiquidityPosition[]) => void;
  addPosition: (position: LiquidityPosition) => void;
  updatePosition: (poolId: string, updates: Partial<LiquidityPosition>) => void;
  removePosition: (poolId: string) => void;
  setSelectedPool: (pool: PoolInfo) => void;
  setToken1: (token: TokenInfo) => void;
  setToken2: (token: TokenInfo) => void;
  setToken1Amount: (amount: string) => void;
  setToken2Amount: (amount: string) => void;
  setAddingLiquidity: (adding: boolean) => void;
  setRemovingLiquidity: (removing: boolean) => void;
  clear: () => void;
  getPosition: (poolId: string) => LiquidityPosition | undefined;
  canAddLiquidity: () => boolean;
  canRemoveLiquidity: (poolId: string) => boolean;
  getTotalValueLocked: () => number;
}

export const liquidityStore: LiquidityStore = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

export type { LiquidityState, LiquidityPosition };
