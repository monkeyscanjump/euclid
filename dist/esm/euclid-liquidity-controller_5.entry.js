import { r as registerInstance } from './index-DQPEQJEF.js';
import { l as liquidityStore, a as apiClient, m as marketStore, D as DEFAULTS } from './constants-BDGHnWrB.js';
import { w as walletStore } from './wallet.store--j01c46J.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './events-CKexLjV3.js';
import { s as swapStore } from './swap.store-Dgx6YrAs.js';

const EuclidLiquidityController = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isInitialized = false;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    async initialize() {
        console.log('💧 Initializing Liquidity Controller...');
        // Subscribe to liquidity store changes
        liquidityStore.onChange('selectedPool', () => this.handlePoolChange());
        this.isInitialized = true;
        console.log('✅ Liquidity Controller initialized');
    }
    handlePoolChange() {
        const { selectedPool } = liquidityStore.state;
        if (selectedPool) {
            console.log('🏊 Pool selected for liquidity operations:', selectedPool.id);
        }
    }
    // Execute add liquidity transaction
    async executeAddLiquidity() {
        try {
            const { selectedPool, token1, token2, token1Amount, token2Amount } = liquidityStore.state;
            if (!selectedPool || !token1 || !token2 || !token1Amount || !token2Amount) {
                return { success: false, error: 'Missing required liquidity parameters' };
            }
            // Check if wallets are connected for both tokens
            const token1Wallet = walletStore.getWallet(token1.chainUID);
            const token2Wallet = walletStore.getWallet(token2.chainUID);
            if (!token1Wallet?.isConnected) {
                return { success: false, error: `Wallet not connected for ${token1.symbol}` };
            }
            if (!token2Wallet?.isConnected) {
                return { success: false, error: `Wallet not connected for ${token2.symbol}` };
            }
            // Check sufficient balances
            if (!walletStore.hasSufficientBalance(token1.chainUID, token1.id, token1Amount)) {
                return { success: false, error: `Insufficient ${token1.symbol} balance` };
            }
            if (!walletStore.hasSufficientBalance(token2.chainUID, token2.id, token2Amount)) {
                return { success: false, error: `Insufficient ${token2.symbol} balance` };
            }
            liquidityStore.setAddingLiquidity(true);
            console.log('💧 Executing add liquidity...', {
                pool: selectedPool.id,
                token1: token1.symbol,
                token2: token2.symbol,
                amount1: token1Amount,
                amount2: token2Amount,
            });
            // Execute add liquidity via API
            const result = await apiClient.createAddLiquidityTransactionWrapped({
                slippage_tolerance_bps: 50, // 0.5% = 50 basis points
                timeout: (Math.floor(Date.now() / 1000) + 1200).toString(), // 20 minutes
                pair_info: {
                    token_1: {
                        token: token1.id,
                        amount: token1Amount,
                        token_type: token1.token_type || { native: { denom: token1.id } }
                    },
                    token_2: {
                        token: token2.id,
                        amount: token2Amount,
                        token_type: token2.token_type || { native: { denom: token2.id } }
                    }
                },
                sender: {
                    address: token1Wallet.address,
                    chain_uid: token1.chainUID
                }
            });
            if (result.success && result.data) {
                const transactionData = result.data;
                const { txHash } = transactionData;
                // Get wallet info and track the transaction
                const connectedWallets = walletStore.getAllConnectedWallets();
                const walletInfo = connectedWallets[0]; // Use primary wallet
                const primaryChain = walletInfo.chainUID;
                walletStore.addTransaction(primaryChain, {
                    txHash: txHash || result.data?.transactionHash || 'pending',
                    timestamp: Date.now(),
                    type: 'add_liquidity'
                });
                // Emit global event for transaction tracking
                dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.SUBMITTED, {
                    txHash,
                    chainUID: primaryChain,
                    type: 'add_liquidity',
                });
                console.log('✅ Add liquidity transaction submitted:', txHash);
                return { success: true, txHash };
            }
            else {
                return { success: false, error: result.error || 'Add liquidity execution failed' };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('❌ Add liquidity execution error:', errorMessage);
            return { success: false, error: errorMessage };
        }
        finally {
            liquidityStore.setAddingLiquidity(false);
        }
    }
    // Execute remove liquidity transaction
    async executeRemoveLiquidity(poolId, lpTokenAmount) {
        try {
            const position = liquidityStore.getPosition(poolId);
            if (!position) {
                return { success: false, error: 'Liquidity position not found' };
            }
            // Get the pool info from market store
            const allPools = marketStore.state.pools;
            const pool = allPools.find(p => p.id === poolId);
            if (!pool) {
                return { success: false, error: 'Pool not found' };
            }
            // Get token metadata to find chain info
            const tokens = marketStore.state.tokens;
            const token1 = tokens.find(t => t.address === pool.token_1);
            if (!token1) {
                return { success: false, error: 'Token metadata not found' };
            }
            const primaryWallet = walletStore.getWallet(token1.chain_uid);
            if (!primaryWallet?.isConnected) {
                return { success: false, error: `Wallet not connected for ${token1.chain_uid}` };
            }
            // Check sufficient LP token balance
            const lpBalance = walletStore.getWalletBalance(token1.chain_uid, `lp-${poolId}`);
            if (!lpBalance || BigInt(lpBalance.amount) < BigInt(lpTokenAmount)) {
                return { success: false, error: 'Insufficient LP token balance' };
            }
            liquidityStore.setRemovingLiquidity(true);
            console.log('💧 Executing remove liquidity...', {
                poolId,
                lpAmount: lpTokenAmount,
            });
            // Execute remove liquidity via API
            const result = await apiClient.createRemoveLiquidityTransactionWrapped({
                slippage_tolerance_bps: 50, // 0.5% = 50 basis points
                timeout: (Math.floor(Date.now() / 1000) + 1200).toString(), // 20 minutes
                lp_token_amount: lpTokenAmount,
                sender: {
                    address: primaryWallet.address,
                    chain_uid: token1.chain_uid
                }
            });
            if (result.success && result.data) {
                const transactionData = result.data;
                const { txHash } = transactionData;
                // Add transaction to wallet store
                walletStore.addTransaction(token1.chain_uid, {
                    txHash,
                    timestamp: Date.now(),
                    type: 'remove_liquidity'
                });
                // Emit global event for transaction tracking
                dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.SUBMITTED, {
                    txHash,
                    chainUID: token1.chain_uid,
                    type: 'remove_liquidity',
                });
                console.log('✅ Remove liquidity transaction submitted:', txHash);
                return { success: true, txHash };
            }
            else {
                return { success: false, error: result.error || 'Remove liquidity execution failed' };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('❌ Remove liquidity execution error:', errorMessage);
            return { success: false, error: errorMessage };
        }
        finally {
            liquidityStore.setRemovingLiquidity(false);
        }
    }
    // Event listeners
    async handleAddLiquidityExecution() {
        console.log('💧 Add liquidity execution requested via event');
        const result = await this.executeAddLiquidity();
        // Emit result event
        if (result.success) {
            dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.ADD_SUCCESS, {
                txHash: result.txHash,
            });
        }
        else {
            dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.ADD_FAILED, {
                error: result.error,
            });
        }
    }
    async handleRemoveLiquidityExecution(event) {
        console.log('💧 Remove liquidity execution requested via event');
        const { poolId, lpTokenAmount } = event.detail;
        const result = await this.executeRemoveLiquidity(poolId, lpTokenAmount);
        // Emit result event
        if (result.success) {
            dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.REMOVE_SUCCESS, {
                txHash: result.txHash,
            });
        }
        else {
            dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.REMOVE_FAILED, {
                error: result.error,
            });
        }
    }
    onInitializedChange(newValue) {
        if (newValue) {
            console.log('💧 Liquidity Controller ready for operations');
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
    static get watchers() { return {
        "isInitialized": ["onInitializedChange"]
    }; }
};

/**
 * Wallet Adapter Utility
 *
 * Abstracts the actual connection logic for different wallet types.
 * Used by euclid-wallet-controller to maintain separation of concerns.
 */
var _a;
// Keplr Wallet Adapter
class KeplrAdapter {
    get keplr() {
        return window.keplr;
    }
    isInstalled() {
        return !!window.keplr;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'Keplr wallet not installed' };
            }
            // Suggest chain if not already added
            if (chainConfig.type === 'Cosmwasm') {
                try {
                    await this.keplr.experimentalSuggestChain({
                        chainId: chainConfig.chain_id,
                        chainName: chainConfig.display_name,
                        rpc: 'https://rpc.cosmos.network', // Default RPC
                        rest: 'https://api.cosmos.network', // Default REST
                        bip44: { coinType: 118 },
                        bech32Config: {
                            bech32PrefixAccAddr: this.getAddressPrefix(chainConfig.chain_id),
                            bech32PrefixAccPub: this.getAddressPrefix(chainConfig.chain_id) + 'pub',
                            bech32PrefixValAddr: this.getAddressPrefix(chainConfig.chain_id) + 'valoper',
                            bech32PrefixValPub: this.getAddressPrefix(chainConfig.chain_id) + 'valoperpub',
                            bech32PrefixConsAddr: this.getAddressPrefix(chainConfig.chain_id) + 'valcons',
                            bech32PrefixConsPub: this.getAddressPrefix(chainConfig.chain_id) + 'valconspub'
                        },
                        currencies: [{
                                coinDenom: 'ATOM', // Default
                                coinMinimalDenom: 'uatom',
                                coinDecimals: 6,
                            }],
                        feeCurrencies: [{
                                coinDenom: 'ATOM', // Default
                                coinMinimalDenom: 'uatom',
                                coinDecimals: 6,
                            }],
                        stakeCurrency: {
                            coinDenom: 'ATOM', // Default
                            coinMinimalDenom: 'uatom',
                            coinDecimals: 6,
                        }
                    });
                }
                catch (suggestError) {
                    console.warn('Failed to suggest chain to Keplr:', suggestError);
                }
            }
            // Enable the chain
            await this.keplr.enable(chainConfig.chain_id);
            // Get the offline signer and accounts
            const offlineSigner = this.keplr.getOfflineSigner(chainConfig.chain_id);
            const accounts = await offlineSigner.getAccounts();
            if (accounts.length === 0) {
                return { success: false, error: 'No accounts found' };
            }
            return {
                success: true,
                address: accounts[0].address,
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to Keplr',
            };
        }
    }
    async disconnect(chainUID) {
        // Keplr doesn't have a programmatic disconnect method
        // The user needs to disconnect from the Keplr extension directly
        console.log('Keplr disconnect requested for:', chainUID);
    }
    async getAddress(chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            // Use Keplr's getKey method to get the address
            const key = await this.keplr.getKey(chainUID);
            return key.bech32Address;
        }
        catch {
            return null;
        }
    }
    async switchChain(chainConfig) {
        try {
            await this.keplr.enable(chainConfig.chain_id);
            return true;
        }
        catch {
            return false;
        }
    }
    getAddressPrefix(chainId) {
        // Common Cosmos chain prefixes
        const prefixes = {
            'cosmoshub-4': 'cosmos',
            'osmosis-1': 'osmo',
            'juno-1': 'juno',
            'stargaze-1': 'stars',
        };
        return prefixes[chainId] || 'cosmos';
    }
}
// MetaMask Wallet Adapter
class MetaMaskAdapter {
    get ethereum() {
        return window.ethereum;
    }
    isInstalled() {
        return !!window.ethereum && window.ethereum.isMetaMask;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'MetaMask not installed' };
            }
            if (chainConfig.type !== 'EVM') {
                return { success: false, error: 'MetaMask only supports EVM chains' };
            }
            // Request account access
            const accounts = await this.ethereum.request({
                method: 'eth_requestAccounts'
            });
            if (!Array.isArray(accounts) || accounts.length === 0) {
                return { success: false, error: 'No accounts found' };
            }
            // Switch to or add the correct network
            const switched = await this.switchChain(chainConfig);
            if (!switched) {
                return { success: false, error: 'Failed to switch network' };
            }
            return {
                success: true,
                address: accounts[0],
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to MetaMask',
            };
        }
    }
    async disconnect(_chainUID) {
        // MetaMask doesn't have a programmatic disconnect method
        // The connection persists until the user disconnects from MetaMask directly
        // Parameter kept for interface consistency but not used in MetaMask
    }
    async getAddress(_chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            const accounts = await this.ethereum.request({
                method: 'eth_accounts'
            });
            return Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
        }
        catch {
            return null;
        }
    }
    async switchChain(chainConfig) {
        try {
            const chainIdHex = `0x${parseInt(chainConfig.chain_id).toString(16)}`;
            // Try to switch to the chain
            try {
                await this.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainIdHex }],
                });
                return true;
            }
            catch (switchError) {
                // Chain not added to MetaMask, try to add it
                if (switchError.code === 4902) {
                    await this.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                                chainId: chainIdHex,
                                chainName: chainConfig.display_name,
                                rpcUrls: ['https://rpc.example.com'], // Default RPC
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                blockExplorerUrls: chainConfig.explorer_url ? [chainConfig.explorer_url] : [],
                            }],
                    });
                    return true;
                }
                throw switchError;
            }
        }
        catch {
            return false;
        }
    }
}
// Cosmostation Adapter (similar to Keplr but for Cosmostation wallet)
class CosmostationAdapter {
    get cosmostation() {
        return window.cosmostation;
    }
    isInstalled() {
        return !!window.cosmostation;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'Cosmostation wallet not installed' };
            }
            if (chainConfig.type !== 'Cosmwasm') {
                return { success: false, error: 'Cosmostation only supports Cosmos chains' };
            }
            const account = await this.cosmostation.cosmos.request({
                method: 'cos_requestAccount',
                params: { chainName: chainConfig.chain_id },
            });
            return {
                success: true,
                address: account.address,
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to Cosmostation',
            };
        }
    }
    async disconnect(chainUID) {
        console.log('Cosmostation disconnect requested for:', chainUID);
    }
    async getAddress(chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            const account = await this.cosmostation.cosmos.request({
                method: 'cos_account',
                params: { chainName: chainUID },
            });
            return account?.address || null;
        }
        catch {
            return null;
        }
    }
    async switchChain(_chainConfig) {
        // Cosmostation handles chain switching automatically
        return true;
    }
}
// Phantom Wallet Adapter
class PhantomAdapter {
    get phantom() {
        return window.phantom?.ethereum;
    }
    isInstalled() {
        return !!this.phantom;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'Phantom wallet not installed' };
            }
            if (chainConfig.type !== 'EVM') {
                return { success: false, error: 'Phantom only supports EVM chains' };
            }
            // Request account access
            const accounts = await this.phantom.request({
                method: 'eth_requestAccounts'
            });
            if (!Array.isArray(accounts) || accounts.length === 0) {
                return { success: false, error: 'No accounts found' };
            }
            return {
                success: true,
                address: accounts[0],
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to Phantom',
            };
        }
    }
    async disconnect(_chainUID) {
        // Phantom doesn't have a programmatic disconnect method
    }
    async getAddress(_chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            const accounts = await this.phantom.request({
                method: 'eth_accounts'
            });
            return Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
        }
        catch {
            return null;
        }
    }
    async switchChain(chainConfig) {
        try {
            const chainIdHex = `0x${parseInt(chainConfig.chain_id).toString(16)}`;
            await this.phantom.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
// Wallet Adapter Factory
class WalletAdapterFactory {
    static getAdapter(walletType) {
        return this.adapters.get(walletType) || null;
    }
    static getAvailableWallets() {
        return Array.from(this.adapters.entries()).map(([type, adapter]) => ({
            type,
            installed: adapter.isInstalled(),
        }));
    }
    static async connectWallet(walletType, chainConfig) {
        const adapter = this.getAdapter(walletType);
        if (!adapter) {
            return { success: false, error: `Adapter not found for ${walletType}` };
        }
        return adapter.connect(chainConfig);
    }
    static async disconnectWallet(walletType, chainUID) {
        const adapter = this.getAdapter(walletType);
        if (adapter) {
            await adapter.disconnect(chainUID);
        }
    }
}
_a = WalletAdapterFactory;
WalletAdapterFactory.adapters = new Map();
(() => {
    _a.adapters.set('keplr', new KeplrAdapter());
    _a.adapters.set('metamask', new MetaMaskAdapter());
    _a.adapters.set('phantom', new PhantomAdapter());
    _a.adapters.set('cosmostation', new CosmostationAdapter());
})();

const EuclidSwapController = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isInitialized = false;
        this.routePollingActive = false;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    disconnectedCallback() {
        this.stopRoutePolling();
    }
    async initialize() {
        console.log('🔄 Initializing Swap Controller...');
        // Subscribe to swap store changes for smart polling
        swapStore.onChange('fromToken', () => this.handleTokenChange());
        swapStore.onChange('toToken', () => this.handleTokenChange());
        swapStore.onChange('fromAmount', () => this.handleAmountChange());
        this.isInitialized = true;
        console.log('✅ Swap Controller initialized');
    }
    handleTokenChange() {
        // Clear existing routes when tokens change
        swapStore.setRoutes([]);
        swapStore.setSelectedRoute(undefined);
        this.stopRoutePolling();
        // Start polling if we have both tokens and an amount
        if (swapStore.state.fromToken && swapStore.state.toToken && swapStore.state.fromAmount) {
            this.startRoutePolling();
        }
    }
    handleAmountChange() {
        const { fromToken, toToken, fromAmount } = swapStore.state;
        if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
            // Debounce the route fetching
            this.debounceRouteFetch();
        }
        else {
            this.stopRoutePolling();
            swapStore.setRoutes([]);
        }
    }
    debounceRouteFetch() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = window.setTimeout(() => {
            this.startRoutePolling();
        }, 500); // 500ms debounce
    }
    startRoutePolling() {
        if (this.routePollingActive)
            return;
        console.log('🔄 Starting route polling...');
        this.routePollingActive = true;
        // Fetch routes immediately
        this.fetchRoutes();
        // Set up periodic polling
        this.routePollingInterval = window.setInterval(() => {
            this.fetchRoutes();
        }, DEFAULTS.ROUTE_REFRESH_INTERVAL);
    }
    stopRoutePolling() {
        if (!this.routePollingActive)
            return;
        console.log('⏹️ Stopping route polling...');
        this.routePollingActive = false;
        if (this.routePollingInterval) {
            clearInterval(this.routePollingInterval);
        }
    }
    async fetchRoutes() {
        const { fromToken, toToken, fromAmount } = swapStore.state;
        if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
            return;
        }
        try {
            swapStore.setLoadingRoutes(true);
            console.log('🛣️ Fetching swap routes:', {
                from: fromToken.symbol,
                to: toToken.symbol,
                amount: fromAmount,
            });
            // Call the routes API
            const response = await apiClient.getRoutesWrapped({
                amount_in: fromAmount,
                token_in: fromToken.id,
                token_out: toToken.id,
                external: true,
            });
            if (response.success && response.data) {
                const routePaths = response.data.paths || [];
                // Store the RoutePath[] directly
                swapStore.setRoutes(routePaths);
                // Auto-select the best route (first one, typically best by default)
                if (routePaths.length > 0 && !swapStore.state.selectedRoute) {
                    swapStore.setSelectedRoute(routePaths[0]);
                }
                console.log(`✅ Found ${routePaths.length} swap routes`);
            }
            else {
                console.warn('⚠️ Failed to fetch routes:', response.error);
                swapStore.setRoutes([]);
            }
        }
        catch (error) {
            console.error('❌ Error fetching routes:', error);
            swapStore.setRoutes([]);
        }
        finally {
            swapStore.setLoadingRoutes(false);
        }
    }
    getUserAddressForChain(chainUID) {
        const wallet = walletStore.getWallet(chainUID);
        return wallet?.address;
    }
    // Execute swap transaction
    async executeSwap() {
        try {
            const { fromToken, toToken, fromAmount, selectedRoute, slippage } = swapStore.state;
            if (!fromToken || !toToken || !fromAmount || !selectedRoute) {
                return { success: false, error: 'Missing required swap parameters' };
            }
            // Check if wallet is connected for the required chain
            const wallet = walletStore.getWallet(fromToken.chainUID);
            if (!wallet?.isConnected) {
                return { success: false, error: `Wallet not connected for ${fromToken.chainUID}` };
            }
            // Check sufficient balance
            if (!walletStore.hasSufficientBalance(fromToken.chainUID, fromToken.id, fromAmount)) {
                return { success: false, error: 'Insufficient balance' };
            }
            swapStore.setSwapping(true);
            console.log('🔄 Executing swap...', {
                from: fromToken.symbol,
                to: toToken.symbol,
                amount: fromAmount,
                route: selectedRoute.id,
            });
            // Get the wallet adapter for signing
            const walletAdapter = WalletAdapterFactory.getAdapter(wallet.type);
            if (!walletAdapter) {
                return { success: false, error: `Wallet adapter not found for ${wallet.type}` };
            }
            // Execute the swap via API - create a basic SwapRequest structure
            const swapResult = await apiClient.createSwapTransactionWrapped({
                amount_in: fromAmount,
                asset_in: {
                    token: fromToken.id,
                    token_type: { native: { denom: fromToken.id } }
                },
                slippage: slippage.toString(),
                minimum_receive: this.calculateMinimumReceived(selectedRoute.outputAmount, slippage),
                sender: {
                    address: wallet.address,
                    chain_uid: fromToken.chain_uid || fromToken.chainUID
                },
                swap_path: {
                    path: selectedRoute.path || []
                },
                timeout: (Math.floor(Date.now() / 1000) + 1200).toString() // 20 minutes from now
            });
            if (swapResult.success && swapResult.data) {
                const txHash = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                // Add transaction to wallet store
                walletStore.addTransaction(fromToken.chainUID, {
                    txHash,
                    timestamp: Date.now(),
                    type: 'swap'
                });
                // Emit global event for transaction tracking
                dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.SUBMITTED, {
                    txHash,
                    chainUID: fromToken.chainUID,
                    type: 'swap',
                });
                console.log('✅ Swap transaction submitted:', txHash);
                return { success: true, txHash };
            }
            else {
                return { success: false, error: swapResult.error || 'Swap execution failed' };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('❌ Swap execution error:', errorMessage);
            return { success: false, error: errorMessage };
        }
        finally {
            swapStore.setSwapping(false);
        }
    }
    calculateMinimumReceived(outputAmount, slippage) {
        try {
            const amount = BigInt(outputAmount);
            const slippageMultiplier = BigInt(Math.floor((100 - slippage) * 100)); // Convert to basis points
            const minimumReceived = (amount * slippageMultiplier) / BigInt(10000);
            return minimumReceived.toString();
        }
        catch {
            return outputAmount; // Fallback to original amount
        }
    }
    // Event listeners
    async handleSwapExecution() {
        console.log('🔄 Swap execution requested via event');
        const result = await this.executeSwap();
        // Emit result event
        if (result.success) {
            dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_SUCCESS, {
                txHash: result.txHash,
            });
        }
        else {
            dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_FAILED, {
                error: result.error,
            });
        }
    }
    handleRouteRefresh() {
        console.log('🔄 Manual route refresh requested');
        this.fetchRoutes();
    }
    handleStopPolling() {
        this.stopRoutePolling();
    }
    handleStartPolling() {
        this.startRoutePolling();
    }
    onInitializedChange(newValue) {
        if (newValue) {
            console.log('📊 Swap Controller ready for route polling');
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
    static get watchers() { return {
        "isInitialized": ["onInitializedChange"]
    }; }
};

const EuclidTxTrackerController = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isInitialized = false;
        this.trackingTransactions = new Map();
    }
    async componentDidLoad() {
        await this.initialize();
    }
    disconnectedCallback() {
        this.stopTracking();
    }
    async initialize() {
        console.log('🔍 Initializing Transaction Tracker Controller...');
        // Start periodic tracking
        this.startTracking();
        this.isInitialized = true;
        console.log('✅ Transaction Tracker Controller initialized');
    }
    startTracking() {
        // Check transactions every 10 seconds
        this.trackingInterval = window.setInterval(() => {
            this.checkPendingTransactions();
        }, 10000);
    }
    stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
    }
    // Track a specific transaction
    async trackTransaction(txHash, chainUID, type) {
        console.log('🔍 Starting to track transaction:', { txHash, chainUID, type });
        this.trackingTransactions.set(txHash, { chainUID, type, pollCount: 0 });
        // Check immediately
        await this.checkTransactionStatus(txHash, chainUID, type);
    }
    async checkPendingTransactions() {
        const promises = Array.from(this.trackingTransactions.entries()).map(([txHash, { chainUID, type, pollCount }]) => this.checkTransactionStatus(txHash, chainUID, type, pollCount));
        await Promise.allSettled(promises);
    }
    async checkTransactionStatus(txHash, chainUID, type, currentPollCount = 0) {
        try {
            console.log(`🔍 Checking transaction status: ${txHash}`);
            const response = await apiClient.trackTransactionWrapped(txHash, chainUID);
            if (response.success && response.data) {
                const { status } = response.data;
                // Update transaction status in wallet store
                walletStore.updateTransactionStatus(chainUID, txHash, status);
                if (status === 'confirmed' || status === 'failed') {
                    // Transaction is final, stop tracking
                    this.trackingTransactions.delete(txHash);
                    // Emit global event with final status
                    dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.FINALIZED, {
                        txHash,
                        chainUID,
                        type,
                        status,
                    });
                    console.log(`✅ Transaction finalized: ${txHash} - Status: ${status}`);
                    // If successful, refresh user data to update balances/positions
                    if (status === 'confirmed') {
                        this.refreshUserDataAfterSuccess(chainUID, type);
                    }
                }
                else {
                    // Still pending, continue tracking with incremented poll count
                    const newPollCount = currentPollCount + 1;
                    // Stop tracking after 120 polls (20 minutes with 10s intervals)
                    if (newPollCount >= 120) {
                        console.warn(`⚠️ Transaction tracking timeout: ${txHash}`);
                        this.trackingTransactions.delete(txHash);
                        // Mark as failed due to timeout
                        walletStore.updateTransactionStatus(chainUID, txHash, 'failed');
                        dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.TIMEOUT, {
                            txHash,
                            chainUID,
                            type
                        });
                    }
                    else {
                        this.trackingTransactions.set(txHash, { chainUID, type, pollCount: newPollCount });
                    }
                }
            }
            else {
                console.warn(`⚠️ Failed to check transaction status: ${txHash}`, response.error);
            }
        }
        catch (error) {
            console.error(`❌ Error checking transaction status: ${txHash}`, error);
        }
    }
    refreshUserDataAfterSuccess(chainUID, type) {
        // Emit events to refresh relevant data after successful transactions
        dispatchEuclidEvent(EUCLID_EVENTS.USER.REFRESH_DATA);
        if (type === 'add_liquidity' || type === 'remove_liquidity') {
            dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.POSITIONS_REFRESH);
        }
        // Refresh balances for the affected chain
        dispatchEuclidEvent(EUCLID_EVENTS.USER.BALANCES_REFRESH, { chainUID });
    }
    // Get tracking statistics
    getTrackingStats() {
        const stats = {
            totalTracking: this.trackingTransactions.size,
            byType: {},
            byChain: {},
        };
        this.trackingTransactions.forEach(({ chainUID, type }) => {
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            stats.byChain[chainUID] = (stats.byChain[chainUID] || 0) + 1;
        });
        return stats;
    }
    // Manual transaction status check
    async checkTransactionManually(txHash, chainUID) {
        try {
            const response = await apiClient.trackTransactionWrapped(txHash, chainUID);
            if (response.success && response.data) {
                return {
                    success: true,
                    status: response.data.status,
                };
            }
            else {
                return {
                    success: false,
                    error: response.error || 'Failed to check transaction status',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    // Event listeners
    async handleTransactionSubmitted(event) {
        const { txHash, chainUID, type } = event.detail;
        console.log('🔍 Transaction submitted, starting tracking:', event.detail);
        await this.trackTransaction(txHash, chainUID, type);
    }
    async handleTrackTransactionRequest(event) {
        const { txHash, chainUID, type } = event.detail;
        console.log('🔍 Manual transaction tracking requested:', event.detail);
        await this.trackTransaction(txHash, chainUID, type);
    }
    handleStopTrackingTransaction(event) {
        const { txHash } = event.detail;
        console.log('⏹️ Stopping transaction tracking:', txHash);
        this.trackingTransactions.delete(txHash);
    }
    handleGetTrackingStats() {
        const stats = this.getTrackingStats();
        dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.STATS_RESPONSE, stats);
    }
    onInitializedChange(newValue) {
        if (newValue) {
            console.log('🔍 Transaction Tracker Controller ready');
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
    static get watchers() { return {
        "isInitialized": ["onInitializedChange"]
    }; }
};

const EuclidUserDataController = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isInitialized = false;
        this.isLoading = false;
        this.error = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    disconnectedCallback() {
        this.clearPeriodicRefresh();
        walletStore.dispose?.();
    }
    async initialize() {
        console.log('👤 Initializing User Data Controller...');
        // Listen for wallet connection changes
        walletStore.onChange('wallets', async (wallets) => {
            const connectedWallets = Array.from(wallets.values()).filter(wallet => wallet.isConnected);
            if (connectedWallets.length > 0) {
                await this.handleWalletConnection(connectedWallets);
            }
            else {
                this.handleWalletDisconnection();
            }
        });
        // Initial check for already connected wallets
        const connectedWallets = walletStore.getAllConnectedWallets();
        if (connectedWallets.length > 0) {
            await this.handleWalletConnection(connectedWallets);
        }
        this.isInitialized = true;
        console.log('✅ User Data Controller initialized');
    }
    async handleWalletConnection(_wallets) {
        try {
            this.isLoading = true;
            this.error = null;
            console.log('🔗 Wallets connected, loading user data...');
            // Load user data for each connected wallet
            await Promise.all([
                this.loadUserBalances(),
                this.loadLiquidityPositions(),
                this.loadUserTransactions()
            ]);
            // Start periodic refresh
            this.setupPeriodicRefresh();
            // Reset retry count on success
            this.retryCount = 0;
        }
        catch (error) {
            console.error('❌ Failed to load user data:', error);
            await this.handleLoadError(error);
        }
        finally {
            this.isLoading = false;
        }
    }
    handleWalletDisconnection() {
        console.log('🔌 Wallets disconnected, clearing user data...');
        this.clearPeriodicRefresh();
        this.retryCount = 0;
        // Clear all wallet data
        walletStore.clear();
    }
    async loadUserBalances() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        for (const wallet of connectedWallets) {
            try {
                console.log(`💰 Loading balances for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);
                const balanceResponse = await apiClient.getBalance(wallet.address, wallet.chainUID);
                if (balanceResponse.success && balanceResponse.data) {
                    const balanceData = balanceResponse.data;
                    if (balanceData.balance?.all) {
                        const chainBalances = balanceData.balance.all.map(item => ({
                            amount: item.amount,
                            token_id: item.denom,
                            // Legacy compatibility fields
                            token: item.denom,
                            balance: item.amount,
                            chain_uid: wallet.chainUID,
                            token_type: { native: { denom: item.denom } }
                        }));
                        // Update wallet store with balances for this chain
                        walletStore.updateWalletBalances(wallet.chainUID, chainBalances);
                    }
                }
            }
            catch (error) {
                console.warn(`⚠️ Failed to load balance for ${wallet.chainUID}:`, error.message);
                // Continue loading other addresses even if one fails
            }
        }
        console.log(`✅ Updated balances for connected wallets`);
    }
    async loadLiquidityPositions() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        for (const wallet of connectedWallets) {
            try {
                console.log(`🏊 Loading liquidity positions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);
                // Stub implementation - to be completed later
                console.log('Liquidity positions loading - implementation pending');
                // TODO: Implement proper liquidity position loading
                // const poolsResponse = await apiClient.getUserPools(wallet.address);
                // Process and update walletStore.updateWalletPositions(wallet.chainUID, positions);
            }
            catch (error) {
                console.warn(`⚠️ Failed to load liquidity positions for ${wallet.chainUID}:`, error.message);
            }
        }
    }
    async loadUserTransactions() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        for (const wallet of connectedWallets) {
            try {
                console.log(`📊 Loading transactions for ${wallet.chainUID}:${wallet.address.slice(0, 8)}...`);
                // Stub implementation - to be completed later
                console.log('Transactions loading - implementation pending');
                // TODO: Implement proper transaction loading
                // const txResponse = await apiClient.getUserTransactions(wallet.address, wallet.chainUID);
                // Process and update walletStore.updateWalletTransactions(wallet.chainUID, transactions);
            }
            catch (error) {
                console.warn(`⚠️ Failed to load transactions for ${wallet.chainUID}:`, error.message);
            }
        }
    }
    calculatePoolShare(lpTokenBalance, poolInfo) {
        try {
            const lpBalance = parseFloat(lpTokenBalance);
            const totalSupply = parseFloat(String(poolInfo.totalSupply || poolInfo.liquidity || '0'));
            if (totalSupply === 0)
                return 0;
            return (lpBalance / totalSupply) * 100;
        }
        catch {
            return 0;
        }
    }
    calculateTokenAmount(sharePercentage, tokenInfo) {
        try {
            const reserve = parseFloat(String(tokenInfo.reserve || tokenInfo.balance || '0'));
            const amount = (reserve * sharePercentage) / 100;
            return amount.toString();
        }
        catch {
            return '0';
        }
    }
    calculatePositionValue(sharePercentage, poolInfo) {
        try {
            const tvl = parseFloat(String(poolInfo.tvl || poolInfo.liquidity || '0'));
            const value = (tvl * sharePercentage) / 100;
            return value.toString();
        }
        catch {
            return '0';
        }
    }
    setupPeriodicRefresh() {
        this.clearPeriodicRefresh();
        this.refreshTimer = window.setInterval(async () => {
            // Check if we have connected wallets
            const connectedWallets = walletStore.getAllConnectedWallets();
            if (connectedWallets.length > 0) {
                console.log('🔄 Refreshing wallet data...');
                await this.refreshUserData();
            }
        }, DEFAULTS.BALANCE_REFRESH_INTERVAL);
    }
    clearPeriodicRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    async refreshUserData() {
        const connectedWallets = walletStore.getAllConnectedWallets();
        if (connectedWallets.length === 0)
            return;
        try {
            this.isLoading = true;
            await Promise.all([
                this.loadUserBalances(),
                this.loadLiquidityPositions()
            ]);
            // Portfolio value calculation to be implemented later
            console.log('Portfolio value calculation - implementation pending');
            this.retryCount = 0;
        }
        catch (error) {
            console.warn('⚠️ Failed to refresh user data:', error);
            await this.handleLoadError(error);
        }
        finally {
            this.isLoading = false;
        }
    }
    async handleLoadError(error) {
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
            console.log(`🔄 Retrying user data load (${this.retryCount}/${this.maxRetries})...`);
            // Exponential backoff
            const delay = Math.pow(2, this.retryCount) * 1000;
            setTimeout(() => {
                this.refreshUserData();
            }, delay);
        }
        else {
            console.error('❌ Max retries reached for user data loading');
            this.error = error.message || 'Failed to load user data';
        }
    }
    async handleRefreshRequest() {
        console.log('🔄 Manual user data refresh requested');
        await this.refreshUserData();
    }
    handleClearRequest() {
        console.log('🗑️ User data clear requested');
        walletStore.clear();
        this.clearPeriodicRefresh();
    }
    onInitializedChange(newValue) {
        if (newValue) {
            // Emit initialization complete event
            dispatchEuclidEvent(EUCLID_EVENTS.USER.CONTROLLER_READY, {
                timestamp: Date.now()
            });
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
    static get watchers() { return {
        "isInitialized": ["onInitializedChange"]
    }; }
};

const EuclidWalletController = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isInitialized = false;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    async initialize() {
        console.log('🔗 Initializing Wallet Controller...');
        // Check for available wallets on page load
        await this.detectAvailableWallets();
        // Set up wallet event listeners
        this.setupWalletEventListeners();
        this.isInitialized = true;
        console.log('✅ Wallet Controller initialized');
    }
    async detectAvailableWallets() {
        const availableWallets = [];
        // Check for Keplr (Cosmos wallets)
        if (window.keplr) {
            availableWallets.push('keplr');
        }
        // Check for MetaMask (EVM wallets)
        if (window.ethereum?.isMetaMask) {
            availableWallets.push('metamask');
        }
        // Check for Cosmostation
        if (window.cosmostation) {
            availableWallets.push('cosmostation');
        }
        console.log('🔍 Available wallets detected:', availableWallets);
        return availableWallets;
    }
    setupWalletEventListeners() {
        // Listen for MetaMask account changes
        if (window.ethereum) {
            // MetaMask's ethereum object has event emitter methods not defined in our interface
            const ethProvider = window.ethereum;
            if (ethProvider.on) {
                ethProvider.on('accountsChanged', (accounts) => {
                    console.log('MetaMask accounts changed:', accounts);
                    this.handleEvmAccountChange(accounts);
                });
                ethProvider.on('chainChanged', (chainId) => {
                    console.log('MetaMask chain changed:', chainId);
                    this.handleEvmChainChange(chainId);
                });
            }
        }
        // Listen for Keplr events
        window.addEventListener('keplr_keystorechange', () => {
            console.log('Keplr keystore changed');
            this.handleKeplrKeystoreChange();
        });
    }
    async handleEvmAccountChange(accounts) {
        if (accounts.length === 0) {
            // User disconnected
            this.disconnectEvmWallets();
        }
    }
    handleEvmChainChange(chainId) {
        // Handle EVM chain changes
        console.log('Chain changed to:', chainId);
        // TODO: Update wallet store with new chain info
    }
    handleKeplrKeystoreChange() {
        // Handle Keplr keystore changes (account switches, etc.)
        // TODO: Update all Cosmos chain wallets
    }
    disconnectEvmWallets() {
        // Disconnect all EVM wallets
        const evmChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'base', 'manta', 'sepolia'];
        evmChains.forEach(chainUID => {
            walletStore.removeWallet(chainUID);
        });
    }
    async handleWalletConnectionRequest(event) {
        const { chainUID, walletType } = event.detail;
        console.log('🔗 Wallet connection requested:', { chainUID, walletType });
        try {
            await this.connectWallet(chainUID, walletType);
        }
        catch (error) {
            console.error('Failed to connect wallet:', error);
            // Emit connection failure event
            dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_FAILED, {
                chainUID,
                walletType,
                error: error.message
            });
        }
    }
    handleWalletDisconnectionRequest(event) {
        const { chainUID } = event.detail;
        console.log('🔌 Wallet disconnection requested:', chainUID);
        walletStore.disconnectWallet(chainUID);
        // Emit disconnection success event
        dispatchEuclidEvent(EUCLID_EVENTS.WALLET.DISCONNECT_SUCCESS, { chainUID });
    }
    async connectWallet(chainUID, walletType) {
        // Get chain configuration
        const chainConfig = marketStore.getChain(chainUID);
        if (!chainConfig) {
            throw new Error(`Chain configuration not found for ${chainUID}`);
        }
        // Validate wallet type
        const validWalletTypes = ['keplr', 'metamask', 'cosmostation', 'walletconnect'];
        if (!validWalletTypes.includes(walletType)) {
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }
        // Use the wallet adapter factory for proper separation of concerns
        const result = await WalletAdapterFactory.connectWallet(walletType, chainConfig);
        if (result.success && result.address) {
            // Add wallet to store
            walletStore.addWallet(chainUID, {
                address: result.address,
                name: walletType,
                walletType: walletType,
                type: walletType, // legacy alias
                isConnected: true,
                balances: []
            });
            // Emit connection success event
            dispatchEuclidEvent(EUCLID_EVENTS.WALLET.CONNECT_SUCCESS, {
                chainUID,
                walletType,
                address: result.address
            });
        }
        else {
            throw new Error(result.error || 'Failed to connect wallet');
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
};

export { EuclidLiquidityController as euclid_liquidity_controller, EuclidSwapController as euclid_swap_controller, EuclidTxTrackerController as euclid_tx_tracker_controller, EuclidUserDataController as euclid_user_data_controller, EuclidWalletController as euclid_wallet_controller };
//# sourceMappingURL=euclid-liquidity-controller.euclid-swap-controller.euclid-tx-tracker-controller.euclid-user-data-controller.euclid-wallet-controller.entry.js.map
