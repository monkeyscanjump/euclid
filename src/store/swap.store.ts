import { createStore } from '@stencil/store';
import type { SwapState, TokenInfo, SwapRoute } from '../utils/types';

const initialState: SwapState = {
  fromToken: undefined,
  toToken: undefined,
  fromAmount: '',
  toAmount: '',
  routes: [],
  selectedRoute: undefined,
  isLoadingRoutes: false,
  slippage: 0.5, // 0.5% default
  isSwapping: false,
  lastRouteUpdate: undefined,
};

const { state, onChange, reset, dispose } = createStore(initialState);

// Actions
const actions = {
  setFromToken(token: TokenInfo) {
    state.fromToken = token;
    // Clear routes when changing tokens
    state.routes = [];
    state.selectedRoute = undefined;
  },

  setToToken(token: TokenInfo) {
    state.toToken = token;
    // Clear routes when changing tokens
    state.routes = [];
    state.selectedRoute = undefined;
  },

  setFromAmount(amount: string) {
    state.fromAmount = amount;
  },

  setToAmount(amount: string) {
    state.toAmount = amount;
  },

  setRoutes(routes: SwapRoute[]) {
    state.routes = [...routes];
    state.lastRouteUpdate = Date.now();
    state.isLoadingRoutes = false;

    // Auto-select best route (first one, assumed to be optimal)
    if (routes.length > 0 && !state.selectedRoute) {
      state.selectedRoute = routes[0];
      state.toAmount = routes[0].outputAmount;
    }
  },

  setSelectedRoute(route: SwapRoute) {
    state.selectedRoute = route;
    state.toAmount = route.outputAmount;
  },

  setLoadingRoutes(loading: boolean) {
    state.isLoadingRoutes = loading;
  },

  setSlippage(slippage: number) {
    state.slippage = slippage;
  },

  setSwapping(swapping: boolean) {
    state.isSwapping = swapping;
  },

  swapTokens() {
    const fromToken = state.fromToken;
    const toToken = state.toToken;
    const fromAmount = state.fromAmount;

    state.fromToken = toToken;
    state.toToken = fromToken;
    state.fromAmount = '';
    state.toAmount = fromAmount;
    state.routes = [];
    state.selectedRoute = undefined;
  },

  clear() {
    reset();
  },
};

// Getters
const getters = {
  canSwap: () => {
    return !!(
      state.fromToken &&
      state.toToken &&
      state.fromAmount &&
      parseFloat(state.fromAmount) > 0 &&
      state.selectedRoute &&
      !state.isSwapping
    );
  },

  isRoutesStale: (maxAge: number = 30 * 1000) => { // 30 seconds default
    if (!state.lastRouteUpdate) return true;
    return Date.now() - state.lastRouteUpdate > maxAge;
  },
};

export const swapStore: any = {
  state,
  onChange,
  reset,
  dispose,
  ...actions,
  ...getters,
};

export type { SwapState, SwapRoute };
