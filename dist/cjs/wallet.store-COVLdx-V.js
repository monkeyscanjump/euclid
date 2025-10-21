'use strict';

var index = require('./index-D2hOGQEA.js');

const appendToMap = (map, propName, value) => {
    const items = map.get(propName);
    if (!items) {
        map.set(propName, [value]);
    }
    else if (!items.includes(value)) {
        items.push(value);
    }
};
const debounce = (fn, ms) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = 0;
            fn(...args);
        }, ms);
    };
};

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement) => !('isConnected' in maybeElement) || maybeElement.isConnected;
const cleanupElements = debounce((map) => {
    for (let key of map.keys()) {
        map.set(key, map.get(key).filter(isConnected));
    }
}, 2_000);
const stencilSubscription = () => {
    if (typeof index.getRenderingRef !== 'function') {
        // If we are not in a stencil project, we do nothing.
        // This function is not really exported by @stencil/core.
        return {};
    }
    const elmsToUpdate = new Map();
    return {
        dispose: () => elmsToUpdate.clear(),
        get: (propName) => {
            const elm = index.getRenderingRef();
            if (elm) {
                appendToMap(elmsToUpdate, propName, elm);
            }
        },
        set: (propName) => {
            const elements = elmsToUpdate.get(propName);
            if (elements) {
                elmsToUpdate.set(propName, elements.filter(index.forceUpdate));
            }
            cleanupElements(elmsToUpdate);
        },
        reset: () => {
            elmsToUpdate.forEach((elms) => elms.forEach(index.forceUpdate));
            cleanupElements(elmsToUpdate);
        },
    };
};

const unwrap = (val) => (typeof val === 'function' ? val() : val);
const createObservableMap = (defaultState, shouldUpdate = (a, b) => a !== b) => {
    const unwrappedState = unwrap(defaultState);
    let states = new Map(Object.entries(unwrappedState ?? {}));
    const handlers = {
        dispose: [],
        get: [],
        set: [],
        reset: [],
    };
    // Track onChange listeners to enable removeListener functionality
    const changeListeners = new Map();
    const reset = () => {
        // When resetting the state, the default state may be a function - unwrap it to invoke it.
        // otherwise, the state won't be properly reset
        states = new Map(Object.entries(unwrap(defaultState) ?? {}));
        handlers.reset.forEach((cb) => cb());
    };
    const dispose = () => {
        // Call first dispose as resetting the state would
        // cause less updates ;)
        handlers.dispose.forEach((cb) => cb());
        reset();
    };
    const get = (propName) => {
        handlers.get.forEach((cb) => cb(propName));
        return states.get(propName);
    };
    const set = (propName, value) => {
        const oldValue = states.get(propName);
        if (shouldUpdate(value, oldValue, propName)) {
            states.set(propName, value);
            handlers.set.forEach((cb) => cb(propName, value, oldValue));
        }
    };
    const state = (typeof Proxy === 'undefined'
        ? {}
        : new Proxy(unwrappedState, {
            get(_, propName) {
                return get(propName);
            },
            ownKeys(_) {
                return Array.from(states.keys());
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            has(_, propName) {
                return states.has(propName);
            },
            set(_, propName, value) {
                set(propName, value);
                return true;
            },
        }));
    const on = (eventName, callback) => {
        handlers[eventName].push(callback);
        return () => {
            removeFromArray(handlers[eventName], callback);
        };
    };
    const onChange = (propName, cb) => {
        const setHandler = (key, newValue) => {
            if (key === propName) {
                cb(newValue);
            }
        };
        const resetHandler = () => cb(unwrap(defaultState)[propName]);
        // Register the handlers
        const unSet = on('set', setHandler);
        const unReset = on('reset', resetHandler);
        // Track the relationship between the user callback and internal handlers
        changeListeners.set(cb, { setHandler, resetHandler, propName });
        return () => {
            unSet();
            unReset();
            changeListeners.delete(cb);
        };
    };
    const use = (...subscriptions) => {
        const unsubs = subscriptions.reduce((unsubs, subscription) => {
            if (subscription.set) {
                unsubs.push(on('set', subscription.set));
            }
            if (subscription.get) {
                unsubs.push(on('get', subscription.get));
            }
            if (subscription.reset) {
                unsubs.push(on('reset', subscription.reset));
            }
            if (subscription.dispose) {
                unsubs.push(on('dispose', subscription.dispose));
            }
            return unsubs;
        }, []);
        return () => unsubs.forEach((unsub) => unsub());
    };
    const forceUpdate = (key) => {
        const oldValue = states.get(key);
        handlers.set.forEach((cb) => cb(key, oldValue, oldValue));
    };
    const removeListener = (propName, listener) => {
        const listenerInfo = changeListeners.get(listener);
        if (listenerInfo && listenerInfo.propName === propName) {
            // Remove the specific handlers that were created for this listener
            removeFromArray(handlers.set, listenerInfo.setHandler);
            removeFromArray(handlers.reset, listenerInfo.resetHandler);
            changeListeners.delete(listener);
        }
    };
    return {
        state,
        get,
        set,
        on,
        onChange,
        use,
        dispose,
        reset,
        forceUpdate,
        removeListener,
    };
};
const removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index >= 0) {
        array[index] = array[array.length - 1];
        array.length--;
    }
};

const createStore = (defaultState, shouldUpdate) => {
    const map = createObservableMap(defaultState, shouldUpdate);
    map.use(stencilSubscription());
    return map;
};

/**
 * Wallet Adapters for Euclid Protocol
 * Unified interface for different wallet providers
 */
/**
 * MetaMask wallet adapter for EVM chains
 */
class MetaMaskAdapter {
    constructor() {
        this.type = 'metamask';
    }
    isAvailable() {
        return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
    }
    async connect(chainId) {
        if (!this.isAvailable()) {
            throw new Error('MetaMask is not installed');
        }
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }
            // Get current chain ID
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId'
            });
            // Switch to requested chain if provided
            if (chainId && chainId !== currentChainId) {
                await this.switchChain(chainId);
            }
            return {
                address: accounts[0],
                chainId: chainId || currentChainId
            };
        }
        catch (error) {
            throw new Error(`Failed to connect MetaMask: ${error.message}`);
        }
    }
    async disconnect() {
        // MetaMask doesn't have a disconnect method, this is handled by the wallet
        console.log('MetaMask disconnect requested');
    }
    async getBalance(address) {
        if (!this.isAvailable()) {
            throw new Error('MetaMask is not available');
        }
        try {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
            });
            return balance;
        }
        catch (error) {
            throw new Error(`Failed to get balance: ${error.message}`);
        }
    }
    async signAndBroadcast(transaction) {
        if (!this.isAvailable()) {
            throw new Error('MetaMask is not available');
        }
        if (transaction.type !== 'evm') {
            throw new Error('MetaMask can only handle EVM transactions');
        }
        try {
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: transaction.msgs.map(msg => ({
                    from: transaction.sender.address,
                    to: msg.to,
                    data: msg.data,
                    value: msg.value,
                    gasLimit: msg.gasLimit
                }))
            });
            return txHash;
        }
        catch (error) {
            throw new Error(`Failed to send transaction: ${error.message}`);
        }
    }
    async switchChain(chainId) {
        if (!this.isAvailable()) {
            throw new Error('MetaMask is not available');
        }
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }]
            });
        }
        catch (error) {
            // Chain not added to MetaMask
            if (error.code === 4902) {
                throw new Error('Chain not added to MetaMask. Please add the chain first.');
            }
            throw new Error(`Failed to switch chain: ${error.message}`);
        }
    }
    async addChain(config) {
        if (!this.isAvailable()) {
            throw new Error('MetaMask is not available');
        }
        if (config.type !== 'EVM') {
            throw new Error('MetaMask only supports EVM chains');
        }
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                        chainId: config.chain_id,
                        chainName: config.display_name,
                        nativeCurrency: {
                            name: 'ETH', // This should come from chain config
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: [config.explorer_url], // This should be RPC URL
                        blockExplorerUrls: [config.explorer_url]
                    }]
            });
        }
        catch (error) {
            throw new Error(`Failed to add chain: ${error.message}`);
        }
    }
}
/**
 * Keplr wallet adapter for Cosmos chains
 */
class KeplrAdapter {
    constructor() {
        this.type = 'keplr';
    }
    isAvailable() {
        return typeof window !== 'undefined' && Boolean(window.keplr);
    }
    async connect(chainId) {
        if (!this.isAvailable()) {
            throw new Error('Keplr is not installed');
        }
        try {
            const defaultChainId = chainId || 'cosmoshub-4';
            // Enable the chain
            await window.keplr.enable(defaultChainId);
            // Get the offline signer
            const offlineSigner = window.keplr.getOfflineSigner(defaultChainId);
            const accounts = await offlineSigner.getAccounts();
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }
            return {
                address: accounts[0].address,
                chainId: defaultChainId
            };
        }
        catch (error) {
            throw new Error(`Failed to connect Keplr: ${error.message}`);
        }
    }
    async disconnect() {
        // Keplr doesn't have a disconnect method
        console.log('Keplr disconnect requested');
    }
    async getBalance(_address) {
        // This would require a Cosmos LCD client
        throw new Error('Balance checking not implemented for Keplr');
    }
    async signAndBroadcast(transaction) {
        if (!this.isAvailable()) {
            throw new Error('Keplr is not available');
        }
        if (transaction.type !== 'cosmwasm') {
            throw new Error('Keplr can only handle CosmWasm transactions');
        }
        try {
            // This is a simplified implementation
            // In reality, you'd need to use StargateClient or similar
            // This would need proper Cosmos transaction building
            throw new Error('CosmWasm transaction signing not fully implemented');
        }
        catch (error) {
            throw new Error(`Failed to send transaction: ${error.message}`);
        }
    }
    async switchChain(chainId) {
        if (!this.isAvailable()) {
            throw new Error('Keplr is not available');
        }
        try {
            await window.keplr.enable(chainId);
        }
        catch (error) {
            throw new Error(`Failed to switch to chain ${chainId}: ${error.message}`);
        }
    }
    async addChain(config) {
        if (!this.isAvailable()) {
            throw new Error('Keplr is not available');
        }
        if (config.type !== 'Cosmwasm') {
            throw new Error('Keplr only supports Cosmos chains');
        }
        try {
            await window.keplr.experimentalSuggestChain({
                chainId: config.chain_id,
                chainName: config.display_name,
                rpc: config.explorer_url, // This should be RPC URL
                rest: config.explorer_url, // This should be REST URL
                bip44: {
                    coinType: 118
                },
                bech32Config: {
                    bech32PrefixAccAddr: 'cosmos',
                    bech32PrefixAccPub: 'cosmospub',
                    bech32PrefixValAddr: 'cosmosvaloper',
                    bech32PrefixValPub: 'cosmosvaloperpub',
                    bech32PrefixConsAddr: 'cosmosvalcons',
                    bech32PrefixConsPub: 'cosmosvalconspub'
                },
                currencies: [{
                        coinDenom: 'ATOM',
                        coinMinimalDenom: 'uatom',
                        coinDecimals: 6
                    }],
                feeCurrencies: [{
                        coinDenom: 'ATOM',
                        coinMinimalDenom: 'uatom',
                        coinDecimals: 6
                    }],
                stakeCurrency: {
                    coinDenom: 'ATOM',
                    coinMinimalDenom: 'uatom',
                    coinDecimals: 6
                }
            });
        }
        catch (error) {
            throw new Error(`Failed to add chain: ${error.message}`);
        }
    }
}
/**
 * Phantom wallet adapter for Solana chains
 */
class PhantomAdapter {
    constructor() {
        this.type = 'phantom';
    }
    isAvailable() {
        return typeof window !== 'undefined' && Boolean(window.solana?.isPhantom);
    }
    async connect(chainId) {
        if (!this.isAvailable()) {
            throw new Error('Phantom is not installed');
        }
        try {
            const resp = await window.solana.connect();
            return {
                address: resp.publicKey.toString(),
                chainId: chainId || 'mainnet-beta'
            };
        }
        catch (error) {
            throw new Error(`Failed to connect Phantom: ${error.message}`);
        }
    }
    async disconnect() {
        if (this.isAvailable()) {
            await window.solana.disconnect();
        }
    }
    async getBalance(_address) {
        // This would require a Solana connection
        throw new Error('Balance checking not implemented for Phantom');
    }
    async signAndBroadcast(_transaction) {
        throw new Error('Solana transaction signing not implemented');
    }
    async switchChain(chainId) {
        // Phantom doesn't support multiple chains
        console.log(`Chain switching not supported by Phantom: ${chainId}`);
    }
    async addChain(_config) {
        // Phantom doesn't support adding chains
        throw new Error('Adding chains not supported by Phantom');
    }
}
/**
 * Wallet adapter factory
 */
class WalletAdapterFactory {
    constructor() {
        this.adapters = new Map();
        // Register available adapters
        this.adapters.set('metamask', new MetaMaskAdapter());
        this.adapters.set('keplr', new KeplrAdapter());
        this.adapters.set('phantom', new PhantomAdapter());
    }
    getAdapter(type) {
        const adapter = this.adapters.get(type);
        if (!adapter) {
            throw new Error(`Unsupported wallet type: ${type}`);
        }
        return adapter;
    }
    getAvailableAdapters() {
        return Array.from(this.adapters.values()).filter(adapter => adapter.isAvailable());
    }
    getAvailableWalletTypes() {
        return this.getAvailableAdapters().map(adapter => adapter.type);
    }
}
// Export default factory instance
const walletAdapterFactory = new WalletAdapterFactory();

const initialState = {
    isConnected: false,
    address: null,
    chainId: null,
    chainUID: null,
    walletType: null,
    balances: [],
    loading: false,
    error: null,
    connectedWallets: new Map(),
    wallets: new Map(), // alias for backward compatibility
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
    async connectWallet(walletType, chainId) {
        state.loading = true;
        state.error = null;
        try {
            const adapter = walletAdapterFactory.getAdapter(walletType);
            if (!adapter.isAvailable()) {
                throw new Error(`${walletType} wallet is not installed`);
            }
            const connection = await adapter.connect(chainId);
            state.isConnected = true;
            state.address = connection.address;
            state.chainId = connection.chainId;
            state.chainUID = connection.chainId; // For now, using chainId as chainUID
            state.walletType = walletType;
            state.error = null;
        }
        catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to connect wallet';
        }
        finally {
            state.loading = false;
        }
    },
    async disconnectWallet(chainUID) {
        if (chainUID) {
            // Disconnect specific wallet
            actions.removeWallet(chainUID);
        }
        else {
            // Disconnect all wallets
            if (state.walletType) {
                try {
                    const adapter = walletAdapterFactory.getAdapter(state.walletType);
                    await adapter.disconnect();
                }
                catch (error) {
                    console.warn('Error disconnecting wallet:', error);
                }
            }
            state.isConnected = false;
            state.address = null;
            state.chainId = null;
            state.chainUID = null;
            state.walletType = null;
            state.balances = [];
            state.connectedWallets.clear();
            state.error = null;
        }
    },
    setBalances(balances) {
        state.balances = [...balances];
    },
    updateBalance(tokenId, balance) {
        const existingIndex = state.balances.findIndex(b => b.token === tokenId);
        const balanceObject = {
            amount: balance,
            token_id: tokenId,
            // Legacy compatibility fields
            token: tokenId,
            balance: balance,
            chain_uid: state.chainUID || '',
            token_type: { native: { denom: tokenId } },
        };
        if (existingIndex >= 0) {
            state.balances[existingIndex] = balanceObject;
        }
        else {
            state.balances.push(balanceObject);
        }
    },
    async switchChain(chainId) {
        if (!state.walletType) {
            throw new Error('No wallet connected');
        }
        state.loading = true;
        state.error = null;
        try {
            const adapter = walletAdapterFactory.getAdapter(state.walletType);
            await adapter.switchChain(chainId);
            state.chainId = chainId;
            state.chainUID = chainId;
            state.error = null;
        }
        catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to switch chain';
        }
        finally {
            state.loading = false;
        }
    },
    clear() {
        reset();
    },
    // Multi-wallet support methods
    initialize() {
        // Check for previously connected wallets and restore connections if possible
        console.log('Wallet store initialized');
    },
    addWallet(chainUID, walletInfo) {
        const fullWalletInfo = {
            ...walletInfo,
            chainUID,
            type: walletInfo.walletType, // Set legacy alias
            name: walletInfo.walletType, // Set legacy name
        };
        state.connectedWallets.set(chainUID, fullWalletInfo);
        state.wallets.set(chainUID, fullWalletInfo); // Keep alias synchronized
        // Update primary wallet state if this is the first connection
        if (!state.isConnected) {
            state.isConnected = true;
            state.address = walletInfo.address;
            state.chainUID = chainUID;
            state.walletType = walletInfo.walletType;
            state.balances = [...walletInfo.balances];
        }
    },
    removeWallet(chainUID) {
        state.connectedWallets.delete(chainUID);
        state.wallets.delete(chainUID); // Keep alias synchronized
        // Update primary wallet state if we removed the current primary
        if (state.chainUID === chainUID) {
            const remaining = Array.from(state.connectedWallets.values());
            if (remaining.length > 0) {
                const newPrimary = remaining[0];
                state.address = newPrimary.address;
                state.chainUID = newPrimary.chainUID;
                state.walletType = newPrimary.walletType;
                state.balances = [...newPrimary.balances];
            }
            else {
                state.isConnected = false;
                state.address = null;
                state.chainUID = null;
                state.walletType = null;
                state.balances = [];
            }
        }
    },
    updateWalletBalances(chainUID, balances) {
        const wallet = state.connectedWallets.get(chainUID);
        if (wallet) {
            const updatedWallet = { ...wallet, balances: [...balances] };
            state.connectedWallets.set(chainUID, updatedWallet);
            // Update primary state if this is the current primary wallet
            if (state.chainUID === chainUID) {
                state.balances = [...balances];
            }
        }
    },
};
// Getters
const getters = {
    getBalance: (tokenId) => {
        return state.balances.find(balance => balance.token === tokenId);
    },
    getFormattedBalance: (tokenId, decimals = 18) => {
        const balance = getters.getBalance(tokenId);
        if (!balance)
            return '0';
        try {
            const value = BigInt(balance.balance);
            const divisor = BigInt(10 ** decimals);
            const beforeDecimal = value / divisor;
            const afterDecimal = value % divisor;
            return `${beforeDecimal.toString()}.${afterDecimal.toString().padStart(decimals, '0')}`;
        }
        catch {
            return '0';
        }
    },
    hasSufficientBalance: (tokenIdOrChainUID, amountOrTokenId, amountParam) => {
        // Support both signatures:
        // hasSufficientBalance(tokenId, amount) - 2 params
        // hasSufficientBalance(chainUID, tokenId, amount) - 3 params
        if (typeof amountParam === 'string' && amountOrTokenId && amountParam) {
            // 3-parameter version: chainUID, tokenId, amount
            const chainUID = tokenIdOrChainUID;
            const tokenId = amountOrTokenId;
            const amount = amountParam;
            const wallet = state.connectedWallets.get(chainUID);
            if (!wallet)
                return false;
            const balance = wallet.balances.find(b => b.token === tokenId);
            if (!balance)
                return false;
            try {
                return BigInt(balance.balance) >= BigInt(amount);
            }
            catch {
                return false;
            }
        }
        else {
            // 2-parameter version: tokenId, amount
            const tokenId = tokenIdOrChainUID;
            const amount = amountOrTokenId || '';
            const balance = getters.getBalance(tokenId);
            if (!balance)
                return false;
            try {
                return BigInt(balance.balance) >= BigInt(amount);
            }
            catch {
                return false;
            }
        }
    }, isWalletAvailable: (walletType) => {
        try {
            const adapter = walletAdapterFactory.getAdapter(walletType);
            return adapter.isAvailable();
        }
        catch {
            return false;
        }
    },
    getAvailableWallets: () => {
        return walletAdapterFactory.getAvailableWalletTypes();
    },
    // Multi-wallet getters
    isWalletConnected: (chainUID) => {
        const wallet = state.connectedWallets.get(chainUID);
        return wallet ? wallet.isConnected : false;
    },
    getAllConnectedWallets: () => {
        return Array.from(state.connectedWallets.values()).filter(wallet => wallet.isConnected);
    },
    getWalletBalance: (chainUID, tokenSymbol) => {
        const wallet = state.connectedWallets.get(chainUID);
        if (!wallet)
            return null;
        return wallet.balances.find(balance => balance.token === tokenSymbol ||
            balance.token.toLowerCase() === tokenSymbol.toLowerCase());
    },
    // Additional method for getting wallet by chain
    getWallet: (chainUID) => {
        return state.connectedWallets.get(chainUID) || null;
    },
    // Method for adding transaction records (placeholder)
    addTransaction: (chainUID, transaction) => {
        // This would typically store transaction history
        // For now, just log it
        console.log(`Transaction added for ${chainUID}:`, transaction);
    },
    // Method for updating transaction status
    updateTransactionStatus: (chainUID, txHash, status) => {
        // This would typically update stored transaction history
        console.log(`Transaction ${txHash} on ${chainUID} updated to status: ${status}`);
    },
};
const walletStore = {
    state,
    onChange,
    reset,
    dispose,
    ...actions,
    ...getters,
};

exports.createStore = createStore;
exports.walletStore = walletStore;
//# sourceMappingURL=wallet.store-COVLdx-V.js.map

//# sourceMappingURL=wallet.store-COVLdx-V.js.map