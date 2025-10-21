import { p as proxyCustomElement, H } from './p-neZz74Yz.js';
import { l as liquidityStore } from './p-CvVRNpOF.js';
import { m as marketStore } from './p-DYNFp3VG.js';
import { w as walletStore } from './p-4AU8BcJF.js';
import { a as apiClient } from './p-Wc26abo-.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './p-CKexLjV3.js';

const EuclidLiquidityController = /*@__PURE__*/ proxyCustomElement(class EuclidLiquidityController extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
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
}, [256, "euclid-liquidity-controller", {
        "isInitialized": [32]
    }, [[8, "euclid:liquidity:add-request", "handleAddLiquidityExecution"], [8, "euclid:liquidity:remove-request", "handleRemoveLiquidityExecution"]], {
        "isInitialized": ["onInitializedChange"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-liquidity-controller"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-liquidity-controller":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidLiquidityController);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidLiquidityController as E, defineCustomElement as d };
//# sourceMappingURL=p-Bfu1xZ0p.js.map

//# sourceMappingURL=p-Bfu1xZ0p.js.map