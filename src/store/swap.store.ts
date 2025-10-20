import { createStore } from '@stencil/store';
import type { SwapState } from '../utils/types/euclid-api.types';
import type { TokenMetadata, RoutePath } from '../utils/types/api.types';
import type { BaseStore } from './types';

const initialState: SwapState = {
  tokenIn: null,
  tokenOut: null,
  fromToken: null, // alias for backward compatibility
  toToken: null,   // alias for backward compatibility
  amountIn: '',
  amountOut: '',
  fromAmount: '', // alias for backward compatibility
  toAmount: '',   // alias for backward compatibility
  routes: [],
  selectedRoute: null,
  slippage: 0.5, // 0.5% default
  loading: false,
  error: null,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Actions
const actions = {
  setTokenIn(token: TokenMetadata | null) {
    state.tokenIn = token;
    state.fromToken = token; // Keep aliases synchronized
    // Clear routes when changing tokens
    state.routes = [];
    state.selectedRoute = null;
    state.amountOut = '';
    state.toAmount = '';
  },

  setTokenOut(token: TokenMetadata | null) {
    state.tokenOut = token;
    state.toToken = token; // Keep aliases synchronized
    // Clear routes when changing tokens
    state.routes = [];
    state.selectedRoute = null;
    state.amountOut = '';
    state.toAmount = '';
  },

  // Backward compatibility aliases
  setFromToken(token: TokenMetadata | null) {
    actions.setTokenIn(token);
  },

  setToToken(token: TokenMetadata | null) {
    actions.setTokenOut(token);
  },

  setAmountIn(amount: string) {
    state.amountIn = amount;
    state.fromAmount = amount; // Keep aliases synchronized
    // Clear output when changing input
    if (!amount) {
      state.amountOut = '';
      state.toAmount = '';
      state.routes = [];
      state.selectedRoute = null;
    }
  },

  setAmountOut(amount: string) {
    state.amountOut = amount;
    state.toAmount = amount; // Keep aliases synchronized
  },

  // Backward compatibility aliases
  setFromAmount(amount: string) {
    actions.setAmountIn(amount);
  },

  setToAmount(amount: string) {
    actions.setAmountOut(amount);
  },

  setRoutes(routes: RoutePath[]) {
    state.routes = [...routes];
    state.loading = false;
    state.error = null;

    // Auto-select best route (first one, assumed to be optimal)
    if (routes.length > 0) {
      actions.setSelectedRoute(routes[0]);
    }
  },

  setSelectedRoute(route: RoutePath | null) {
    state.selectedRoute = route;

    // Calculate expected output from route
    if (route && route.path.length > 0) {
      const lastHop = route.path[route.path.length - 1];
      state.amountOut = lastHop.amount_out;
    }
  },

  setLoading(loading: boolean) {
    state.loading = loading;
  },

  setError(error: string | null) {
    state.error = error;
  },

  setSlippage(slippage: number) {
    state.slippage = slippage;
  },

  // Additional methods that components expect
  setLoadingRoutes(loading: boolean) {
    state.loading = loading;
  },

  setSwapping(swapping: boolean) {
    state.loading = swapping; // Use loading flag for swapping state
  },

  swapTokens() {
    const tokenIn = state.tokenIn;
    const tokenOut = state.tokenOut;
    const amountIn = state.amountIn;

    state.tokenIn = tokenOut;
    state.tokenOut = tokenIn;
    state.fromToken = tokenOut; // Keep aliases synchronized
    state.toToken = tokenIn;
    state.amountIn = '';
    state.amountOut = amountIn;
    state.fromAmount = '';
    state.toAmount = amountIn;
    state.routes = [];
    state.selectedRoute = null;
    state.error = null;
  },

  clear() {
    reset();
  },
};

// Getters
const getters = {
  canSwap: () => {
    return !!(
      state.tokenIn &&
      state.tokenOut &&
      state.amountIn &&
      parseFloat(state.amountIn) > 0 &&
      state.selectedRoute &&
      !state.loading
    );
  },

  getPriceImpact: () => {
    return state.selectedRoute?.total_price_impact || '0';
  },

  getEstimatedGas: () => {
    // This would be calculated based on the route complexity
    if (!state.selectedRoute) return '0';

    const hopCount = state.selectedRoute.path.length;
    return (hopCount * 100000).toString(); // Rough estimate
  },

  isValidPair: () => {
    return !!(
      state.tokenIn &&
      state.tokenOut &&
      state.tokenIn.id !== state.tokenOut.id
    );
  },

  getSlippageAmount: () => {
    if (!state.amountOut || !state.slippage) return '0';

    try {
      const output = BigInt(state.amountOut);
      const slippageBps = BigInt(Math.floor(state.slippage * 100)); // Convert to basis points
      const slippageAmount = (output * slippageBps) / BigInt(10000);
      const minimumReceive = output - slippageAmount;

      return minimumReceive.toString();
    } catch {
      return '0';
    }
  },
};

// Proper store type definition extending BaseStore
export interface SwapStore extends BaseStore<SwapState> {
  setTokenIn: (token: TokenMetadata | null) => void;
  setTokenOut: (token: TokenMetadata | null) => void;
  setFromToken: (token: TokenMetadata | null) => void; // alias
  setToToken: (token: TokenMetadata | null) => void;   // alias
  setAmountIn: (amount: string) => void;
  setAmountOut: (amount: string) => void;
  setFromAmount: (amount: string) => void; // alias
  setToAmount: (amount: string) => void;   // alias
  setRoutes: (routes: RoutePath[]) => void;
  setSelectedRoute: (route: RoutePath | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingRoutes: (loading: boolean) => void; // alias
  setSwapping: (swapping: boolean) => void; // alias
  setError: (error: string | null) => void;
  setSlippage: (slippage: number) => void;
  swapTokens: () => void;
  clear: () => void;
  canSwap: () => boolean;
  getPriceImpact: () => string;
  getEstimatedGas: () => string;
  isValidPair: () => boolean;
  getSlippageAmount: () => string;
}

export const swapStore: SwapStore = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

export type { SwapState };
