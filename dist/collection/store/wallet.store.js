import { createStore } from "@stencil/store";
import { walletAdapterFactory } from "../utils/wallet-adapters";
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
export const walletStore = {
    state,
    onChange,
    reset,
    dispose,
    ...actions,
    ...getters,
};
//# sourceMappingURL=wallet.store.js.map
