import { c as createStore } from './p-a_EWBc2O.js';

const initialState = {
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
    setLoading(loading) {
        state.loading = loading;
    },
    setError(error) {
        state.error = error;
    },
    setToken1(token) {
        state.token1 = token;
        // Clear pool if tokens don't match
        if (state.pool && token &&
            state.pool.token_1 !== token.id &&
            state.pool.token_2 !== token.id) {
            state.pool = null;
        }
    },
    setToken2(token) {
        state.token2 = token;
        // Clear pool if tokens don't match
        if (state.pool && token &&
            state.pool.token_1 !== token.id &&
            state.pool.token_2 !== token.id) {
            state.pool = null;
        }
    },
    setAmount1(amount) {
        state.amount1 = amount;
        state.token1Amount = amount; // Keep alias synchronized
    },
    setAmount2(amount) {
        state.amount2 = amount;
        state.token2Amount = amount; // Keep alias synchronized
    },
    // Backward compatibility aliases
    setToken1Amount(amount) {
        actions.setAmount1(amount);
    },
    setToken2Amount(amount) {
        actions.setAmount2(amount);
    },
    setPool(pool) {
        state.pool = pool;
        state.selectedPool = pool; // Keep alias synchronized
    },
    // Backward compatibility alias
    setSelectedPool(pool) {
        actions.setPool(pool);
    },
    setUserLpBalance(balance) {
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
    setAddingLiquidity(loading) {
        state.loading = loading;
    },
    setRemovingLiquidity(loading) {
        state.loading = loading;
    },
    getPosition(poolId) {
        // This would typically fetch from API or cache
        // For now, return null
        console.warn(`getPosition(${poolId}) not implemented`);
        return null;
    },
};
// Getters
const getters = {
    canAddLiquidity: () => {
        return !!(state.token1 &&
            state.token2 &&
            state.amount1 &&
            state.amount2 &&
            parseFloat(state.amount1) > 0 &&
            parseFloat(state.amount2) > 0 &&
            !state.loading);
    },
    canRemoveLiquidity: () => {
        return !!(state.pool &&
            state.userLpBalance &&
            parseFloat(state.userLpBalance) > 0 &&
            !state.loading);
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
        return !!(state.token1 &&
            state.token2 &&
            state.token1.id !== state.token2.id);
    },
};
const liquidityStore = {
    state,
    onChange,
    reset,
    dispose,
    ...actions,
    ...getters,
};

export { liquidityStore as l };
//# sourceMappingURL=p-CvVRNpOF.js.map

//# sourceMappingURL=p-CvVRNpOF.js.map