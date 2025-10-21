import { c as createStore } from './p-a_EWBc2O.js';

const initialState = {
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
    setLoading(loading) {
        state.loading = loading;
    },
    setError(error) {
        state.error = error;
    },
    setChains(chains) {
        state.chains = [...chains];
        state.lastUpdated = Date.now();
    },
    setTokens(tokens) {
        state.tokens = [...tokens];
        state.lastUpdated = Date.now();
    },
    setPools(pools) {
        state.pools = [...pools];
        state.lastUpdated = Date.now();
    },
    setPrices(prices) {
        state.prices = { ...prices };
        state.lastUpdated = Date.now();
    },
    addToken(token) {
        state.tokens = [...state.tokens, token];
    },
    updateToken(tokenId, updates) {
        state.tokens = state.tokens.map(token => token.id === tokenId ? { ...token, ...updates } : token);
    },
    clear() {
        reset();
    },
};
// Getters
const getters = {
    getChain: (chainUID) => state.chains.find(chain => chain.chain_uid === chainUID),
    getToken: (tokenId) => state.tokens.find(token => token.id === tokenId),
    getTokensByChain: (chainUID) => state.tokens.filter(token => token.chain_uid === chainUID),
    getPool: (poolId) => state.pools.find(pool => pool.pool_id === poolId),
    getPoolsForTokenPair: (token1, token2) => state.pools.filter(pool => (pool.token_1 === token1 && pool.token_2 === token2) ||
        (pool.token_1 === token2 && pool.token_2 === token1)),
    getPrice: (tokenId) => state.prices[tokenId] || 0,
    isDataStale: (maxAge = 5 * 60 * 1000) => {
        if (!state.lastUpdated)
            return true;
        return Date.now() - state.lastUpdated > maxAge;
    },
};
const marketStore = {
    state,
    onChange,
    reset,
    dispose,
    ...actions,
    ...getters,
};
// Expose store globally for debugging and testing
if (typeof window !== 'undefined') {
    window.marketStore = marketStore;
}

export { marketStore as m };
//# sourceMappingURL=p-DYNFp3VG.js.map

//# sourceMappingURL=p-DYNFp3VG.js.map