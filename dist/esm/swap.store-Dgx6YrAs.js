import { c as createStore } from './wallet.store--j01c46J.js';

const initialState = {
    tokenIn: null,
    tokenOut: null,
    fromToken: null, // alias for backward compatibility
    toToken: null, // alias for backward compatibility
    amountIn: '',
    amountOut: '',
    fromAmount: '', // alias for backward compatibility
    toAmount: '', // alias for backward compatibility
    routes: [],
    selectedRoute: null,
    slippage: 0.5, // 0.5% default
    loading: false,
    error: null,
};
const { state, onChange, reset, dispose } = createStore(initialState);
// Actions
const actions = {
    setTokenIn(token) {
        state.tokenIn = token;
        state.fromToken = token; // Keep aliases synchronized
        // Clear routes when changing tokens
        state.routes = [];
        state.selectedRoute = null;
        state.amountOut = '';
        state.toAmount = '';
    },
    setTokenOut(token) {
        state.tokenOut = token;
        state.toToken = token; // Keep aliases synchronized
        // Clear routes when changing tokens
        state.routes = [];
        state.selectedRoute = null;
        state.amountOut = '';
        state.toAmount = '';
    },
    // Backward compatibility aliases
    setFromToken(token) {
        actions.setTokenIn(token);
    },
    setToToken(token) {
        actions.setTokenOut(token);
    },
    setAmountIn(amount) {
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
    setAmountOut(amount) {
        state.amountOut = amount;
        state.toAmount = amount; // Keep aliases synchronized
    },
    // Backward compatibility aliases
    setFromAmount(amount) {
        actions.setAmountIn(amount);
    },
    setToAmount(amount) {
        actions.setAmountOut(amount);
    },
    setRoutes(routes) {
        state.routes = [...routes];
        state.loading = false;
        state.error = null;
        // Auto-select best route (first one, assumed to be optimal)
        if (routes.length > 0) {
            actions.setSelectedRoute(routes[0]);
        }
    },
    setSelectedRoute(route) {
        state.selectedRoute = route;
        // Calculate expected output from route
        if (route && route.path.length > 0) {
            const lastHop = route.path[route.path.length - 1];
            state.amountOut = lastHop.amount_out;
        }
    },
    setLoading(loading) {
        state.loading = loading;
    },
    setError(error) {
        state.error = error;
    },
    setSlippage(slippage) {
        state.slippage = slippage;
    },
    // Additional methods that components expect
    setLoadingRoutes(loading) {
        state.loading = loading;
    },
    setSwapping(swapping) {
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
        return !!(state.tokenIn &&
            state.tokenOut &&
            state.amountIn &&
            parseFloat(state.amountIn) > 0 &&
            state.selectedRoute &&
            !state.loading);
    },
    getPriceImpact: () => {
        return state.selectedRoute?.total_price_impact || '0';
    },
    getEstimatedGas: () => {
        // This would be calculated based on the route complexity
        if (!state.selectedRoute)
            return '0';
        const hopCount = state.selectedRoute.path.length;
        return (hopCount * 100000).toString(); // Rough estimate
    },
    isValidPair: () => {
        return !!(state.tokenIn &&
            state.tokenOut &&
            state.tokenIn.id !== state.tokenOut.id);
    },
    getSlippageAmount: () => {
        if (!state.amountOut || !state.slippage)
            return '0';
        try {
            const output = BigInt(state.amountOut);
            const slippageBps = BigInt(Math.floor(state.slippage * 100)); // Convert to basis points
            const slippageAmount = (output * slippageBps) / BigInt(10000);
            const minimumReceive = output - slippageAmount;
            return minimumReceive.toString();
        }
        catch {
            return '0';
        }
    },
};
const swapStore = {
    state,
    onChange,
    reset,
    dispose,
    ...actions,
    ...getters,
};

export { swapStore as s };
//# sourceMappingURL=swap.store-Dgx6YrAs.js.map

//# sourceMappingURL=swap.store-Dgx6YrAs.js.map