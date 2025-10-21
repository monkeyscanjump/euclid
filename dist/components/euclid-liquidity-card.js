import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';
import { w as walletStore } from './p-4AU8BcJF.js';
import { a as appStore } from './p-nYiGBV1C.js';
import { l as liquidityStore } from './p-CvVRNpOF.js';
import { m as marketStore } from './p-DYNFp3VG.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './p-CKexLjV3.js';
import { d as defineCustomElement$3 } from './p-bUJ-P9iR.js';
import { d as defineCustomElement$2 } from './p-DhUeaqyu.js';

const euclidLiquidityCardCss = ":host{display:contents}.liquidity-card{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);padding:var(--euclid-spacing-6);max-width:480px;width:100%;box-shadow:var(--euclid-shadow-xl);display:flex;flex-direction:column;gap:var(--euclid-spacing-6)}.liquidity-header{display:flex;justify-content:space-between;align-items:center}.liquidity-title{font-size:var(--euclid-text-size-xl);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary);margin:0}.mode-toggle{display:flex;background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg);padding:var(--euclid-spacing-1)}.mode-button{padding:var(--euclid-spacing-2) var(--euclid-spacing-4);border:none;background:transparent;color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);cursor:pointer;border-radius:var(--euclid-radius-md);transition:all var(--euclid-transition-duration-fast)}.mode-button--active{background:var(--euclid-surface);color:var(--euclid-text-primary);box-shadow:var(--euclid-shadow-sm)}.mode-button:hover:not(.mode-button--active){color:var(--euclid-text-primary)}.pool-section{display:flex;flex-direction:column;gap:var(--euclid-spacing-4)}.section-header{display:flex;justify-content:space-between;align-items:center}.section-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.pool-selector{cursor:pointer}.pool-selector:hover{opacity:0.8}.selected-pool{display:flex;align-items:center;gap:var(--euclid-spacing-4);padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface);transition:all var(--euclid-transition-duration-fast)}.select-pool-button{display:flex;align-items:center;justify-content:center;gap:var(--euclid-spacing-2);padding:var(--euclid-spacing-4) var(--euclid-spacing-6);border:2px dashed var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface-secondary);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-medium);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.select-pool-button:hover{border-color:var(--euclid-border-hover)}.pool-tokens{display:flex;align-items:center}.token-pair{display:flex;align-items:center}.token-logo{width:2rem;height:2rem;border-radius:50%;background:var(--euclid-surface-secondary);border:2px solid var(--euclid-surface)}.token-logo--overlap{margin-left:-0.5rem}.pool-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1)}.pool-name{font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary)}.pool-fee{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.pool-stats{display:flex;gap:var(--euclid-spacing-6)}.stat{display:flex;flex-direction:column;gap:var(--euclid-spacing-1)}.stat-label{font-size:var(--euclid-text-size-xs);color:var(--euclid-text-muted)}.stat-value{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.position-info{padding:var(--euclid-spacing-4);background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-xl)}.position-header{margin-bottom:var(--euclid-spacing-3)}.position-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.position-details{display:flex;flex-direction:column;gap:var(--euclid-spacing-3)}.position-row{display:flex;justify-content:space-between;align-items:center}.position-item-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.position-item-value{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.liquidity-inputs{display:flex;flex-direction:column;gap:var(--euclid-spacing-4)}.token-input-section{position:relative}.input-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--euclid-spacing-2)}.input-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.balance-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-muted);cursor:pointer;transition:color var(--euclid-transition-duration-fast)}.balance-label:hover{color:var(--euclid-text-secondary)}.plus-icon{position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);z-index:10;width:2rem;height:2rem;background:var(--euclid-surface);border:2px solid var(--euclid-border);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--euclid-text-secondary)}.plus-icon svg{width:1rem;height:1rem}.token-selector{cursor:pointer}.token-selector:hover{opacity:0.8}.selected-token{display:flex;align-items:center;gap:var(--euclid-spacing-3);padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface)}.select-token-button{display:flex;align-items:center;justify-content:center;gap:var(--euclid-spacing-2);padding:var(--euclid-spacing-4) var(--euclid-spacing-6);border:2px dashed var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface-secondary);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-medium);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.select-token-button:hover{border-color:var(--euclid-border-hover)}.token-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1);flex:1}.token-symbol{font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary)}.token-name{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.dropdown-arrow{color:var(--euclid-text-muted);transition:transform var(--euclid-transition-duration-fast)}.dropdown-arrow--open{transform:rotate(180deg)}.remove-liquidity{display:flex;flex-direction:column;gap:var(--euclid-spacing-4)}.percentage-section{display:flex;flex-direction:column;gap:var(--euclid-spacing-3)}.percentage-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.percentage-buttons{display:flex;gap:var(--euclid-spacing-2)}.percentage-btn{flex:1;padding:var(--euclid-spacing-3);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);background:var(--euclid-surface);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.percentage-btn:hover{border-color:var(--euclid-border-hover);color:var(--euclid-text-primary)}.percentage-btn--active{border-color:var(--euclid-interactive-primary);background:var(--euclid-primary-50);color:var(--euclid-primary-700)}.lp-token-display{display:flex;align-items:center;gap:var(--euclid-spacing-3);padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface-secondary)}.lp-token-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1);flex:1}.lp-symbol{font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary)}.quote-info{padding:var(--euclid-spacing-4);background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-xl)}.quote-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--euclid-spacing-2)}.quote-row:last-child{margin-bottom:0}.quote-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.quote-value{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.quote-value--warning{color:var(--euclid-warning-600)}.quote-value--danger{color:var(--euclid-danger-600)}.advanced-section{border-top:1px solid var(--euclid-border);padding-top:var(--euclid-spacing-4)}.advanced-toggle{display:flex;align-items:center;gap:var(--euclid-spacing-2);padding:var(--euclid-spacing-2) 0;background:transparent;border:none;color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);cursor:pointer;transition:color var(--euclid-transition-duration-fast)}.advanced-toggle:hover{color:var(--euclid-text-primary)}.advanced-panel{margin-top:var(--euclid-spacing-4);padding:var(--euclid-spacing-4);background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg)}.setting-item{display:flex;flex-direction:column;gap:var(--euclid-spacing-2)}.setting-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.slippage-controls{display:flex;gap:var(--euclid-spacing-2);align-items:center}.slippage-btn{padding:var(--euclid-spacing-2) var(--euclid-spacing-3);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.slippage-btn:hover{border-color:var(--euclid-border-hover);color:var(--euclid-text-primary)}.slippage-btn--active{border-color:var(--euclid-interactive-primary);background:var(--euclid-primary-50);color:var(--euclid-primary-700)}.slippage-input{padding:var(--euclid-spacing-2) var(--euclid-spacing-3);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-primary);font-size:var(--euclid-text-size-sm);width:80px;text-align:center}.slippage-input:focus{outline:none;border-color:var(--euclid-border-focus);box-shadow:0 0 0 3px rgba(37, 99, 235, 0.1)}@media (max-width: 480px){.liquidity-card{padding:var(--euclid-spacing-4);gap:var(--euclid-spacing-4)}.liquidity-header{flex-direction:column;gap:var(--euclid-spacing-3);align-items:flex-start}.mode-toggle{width:100%}.mode-button{flex:1;text-align:center}.pool-stats{flex-direction:column;gap:var(--euclid-spacing-3)}.percentage-buttons{flex-wrap:wrap}.percentage-btn{min-width:calc(50% - var(--euclid-spacing-1))}.slippage-controls{flex-wrap:wrap;gap:var(--euclid-spacing-2)}.selected-pool,.selected-token,.lp-token-display{flex-direction:column;align-items:flex-start;gap:var(--euclid-spacing-2)}.pool-tokens{order:-1}.token-pair{gap:var(--euclid-spacing-2)}.token-logo--overlap{margin-left:0}.pool-info,.token-info,.lp-token-info{width:100%}}@media (prefers-reduced-motion: reduce){.mode-button,.pool-selector,.token-selector,.percentage-btn,.slippage-btn{transition:none}}.token-selector:focus-within,.pool-selector:focus-within{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.mode-button:focus{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.percentage-btn:focus,.slippage-btn:focus{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.quote-info.loading{position:relative;pointer-events:none}.quote-info.loading::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:1.5rem;height:1.5rem;border:2px solid var(--euclid-border);border-top:2px solid var(--euclid-interactive-primary);border-radius:50%;animation:euclid-spin 1s linear infinite}@media (prefers-contrast: high){.liquidity-card,.selected-pool,.selected-token,.lp-token-display,.position-info,.quote-info,.advanced-panel{border-width:2px;border-color:var(--euclid-text-primary)}.mode-button--active,.percentage-btn--active,.slippage-btn--active{border-color:var(--euclid-text-primary);background:var(--euclid-text-primary);color:var(--euclid-surface)}}";

const EuclidLiquidityCard$1 = /*@__PURE__*/ proxyCustomElement(class EuclidLiquidityCard extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.liquidityAdded = createEvent(this, "liquidityAdded");
        this.liquidityRemoved = createEvent(this, "liquidityRemoved");
        this.poolSelected = createEvent(this, "poolSelected");
        this.quoteRequested = createEvent(this, "quoteRequested");
        /**
         * Available tokens for liquidity provision (legacy - use store instead)
         * @deprecated Use marketStore instead
         */
        this.tokens = [];
        /**
         * Available pools (legacy - use store instead)
         * @deprecated Use marketStore instead
         */
        this.pools = [];
        /**
         * User's liquidity positions
         */
        this.positions = [];
        // Store data (automatically synced like pools-list)
        this.storePools = [];
        this.storeTokens = [];
        this.storeLoading = false;
        // Selected pool from store data (this is what we actually use)
        this.selectedStorePool = null;
        /**
         * Selected pool for liquidity operations
         */
        this.selectedPool = null;
        /**
         * Current mode: 'add' or 'remove'
         */
        this.mode = 'add';
        /**
         * Token A amount input
         */
        this.tokenAAmount = '';
        /**
         * Token B amount input
         */
        this.tokenBAmount = '';
        /**
         * LP token amount for removal
         */
        this.lpTokenAmount = '';
        /**
         * Whether the component is in loading state
         */
        this.loading = false;
        /**
         * Whether the liquidity functionality is disabled
         */
        this.disabled = false;
        /**
         * Connected wallet address
         */
        this.walletAddress = '';
        /**
         * Default slippage tolerance (0.5 = 0.5%)
         */
        this.defaultSlippage = 0.5;
        /**
         * Card title
         */
        this.cardTitle = 'Manage Liquidity';
        // Internal state
        this.isPoolSelectorOpen = false;
        // Token selector type removed - no individual token selection needed
        this.currentQuote = null;
        this.removeQuote = null;
        this.isQuoting = false;
        this.slippage = this.defaultSlippage;
        this.isAdvancedOpen = false;
        this.lpPercentage = 0;
        // Quote update timer
        this.quoteTimer = null;
        this.handleModeChange = (newMode) => {
            this.mode = newMode;
            this.resetAmounts();
            this.currentQuote = null;
            this.removeQuote = null;
        };
        this.resetAmounts = () => {
            this.tokenAAmount = '';
            this.tokenBAmount = '';
            this.lpTokenAmount = '';
            this.lpPercentage = 0;
        };
        // Token selection is not needed - tokens are determined by pool selection
        this.openPoolSelector = () => {
            this.isPoolSelectorOpen = true;
        };
        // Legacy selectPool method removed - use selectStorePool instead
        this.selectStorePool = (pool) => {
            // Store the selected pool directly - no conversion needed!
            this.selectedStorePool = pool;
            this.isPoolSelectorOpen = false;
            this.resetAmounts();
            // Emit the pool selection event with actual store data
            this.poolSelected.emit(pool);
            console.log('🎯 Pool selected:', {
                poolId: pool.pool_id,
                token1: pool.token_1,
                token2: pool.token_2,
                totalLiquidity: pool.total_liquidity,
                apr: pool.apr
            });
        };
        this.handleMaxClick = (type) => {
            if (type === 'tokenA' && this.selectedPool?.tokenA.balance) {
                this.tokenAAmount = this.selectedPool.tokenA.balance;
                this.calculateTokenBFromA();
            }
            else if (type === 'tokenB' && this.selectedPool?.tokenB.balance) {
                this.tokenBAmount = this.selectedPool.tokenB.balance;
                this.calculateTokenAFromB();
            }
            else if (type === 'lp') {
                const position = this.getUserPosition();
                if (position) {
                    this.lpTokenAmount = position.lpTokenBalance;
                    this.startQuoteTimer();
                }
            }
        };
        this.handlePercentageClick = (percentage) => {
            this.lpPercentage = percentage;
            const position = this.getUserPosition();
            if (position) {
                const amount = (parseFloat(position.lpTokenBalance) * percentage / 100).toFixed(6);
                this.lpTokenAmount = amount;
                this.startQuoteTimer();
            }
        };
        this.handleLiquidity = () => {
            // Check if we need to connect wallets first
            if (!this.isWalletConnectedForLiquidity()) {
                // Determine which chain to connect to
                const chainUID = this.getFirstDisconnectedChain();
                appStore.openWalletModal(chainUID);
                return;
            }
            if (!this.selectedPool)
                return;
            // Update liquidity store - convert to api.types.PoolInfo format
            const apiPool = {
                pool_id: this.selectedPool.address,
                id: this.selectedPool.address,
                token_1: this.selectedPool.tokenA.address,
                token_2: this.selectedPool.tokenB.address,
                token1: this.selectedPool.tokenA.address, // legacy compatibility
                token2: this.selectedPool.tokenB.address, // legacy compatibility
                total_liquidity: this.selectedPool.totalSupply
            };
            liquidityStore.setSelectedPool(apiPool);
            if (this.mode === 'add' && this.currentQuote) {
                // Set liquidity store values
                liquidityStore.setToken1Amount(this.tokenAAmount);
                liquidityStore.setToken2Amount(this.tokenBAmount);
                // Trigger add liquidity execution
                dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.ADD_REQUEST);
                // Emit legacy event for backward compatibility
                this.liquidityAdded.emit({
                    pool: this.selectedPool,
                    tokenAAmount: this.tokenAAmount,
                    tokenBAmount: this.tokenBAmount,
                    expectedLpTokens: this.currentQuote.lpTokensReceived,
                    slippage: this.slippage,
                });
            }
            else if (this.mode === 'remove' && this.removeQuote) {
                // Trigger remove liquidity execution
                dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.REMOVE_REQUEST, {
                    poolId: this.selectedPool.address,
                    lpTokenAmount: this.lpTokenAmount,
                });
                // Emit legacy event for backward compatibility
                this.liquidityRemoved.emit({
                    pool: this.selectedPool,
                    lpTokenAmount: this.lpTokenAmount,
                    expectedTokenA: this.removeQuote.tokenAReceived,
                    expectedTokenB: this.removeQuote.tokenBReceived,
                    slippage: this.slippage,
                });
            }
        };
    }
    componentWillLoad() {
        // Connect to market store for automatic data updates
        this.syncWithStore();
        // Listen for store changes
        marketStore.onChange('pools', () => {
            this.syncWithStore();
        });
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
        });
    }
    componentDidLoad() {
        // Auto-quote when inputs change
        this.startQuoteTimer();
    }
    disconnectedCallback() {
        if (this.quoteTimer) {
            clearTimeout(this.quoteTimer);
        }
    }
    syncWithStore() {
        // Use store data if available, fallback to legacy props
        this.storePools = marketStore.state.pools.length > 0 ? marketStore.state.pools : [];
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : [];
        this.storeLoading = marketStore.state.loading;
        console.log('🔄 Liquidity card store sync:', {
            storePools: this.storePools.length,
            storeTokens: this.storeTokens.length,
            storeLoading: this.storeLoading
        });
    }
    handleInputChange(event) {
        const inputId = event.target.id;
        if (inputId === 'token-a-input') {
            this.tokenAAmount = event.detail.value;
            this.calculateTokenBFromA();
        }
        else if (inputId === 'token-b-input') {
            this.tokenBAmount = event.detail.value;
            this.calculateTokenAFromB();
        }
        else if (inputId === 'lp-token-input') {
            this.lpTokenAmount = event.detail.value;
            this.startQuoteTimer();
        }
    }
    // Token selection removed - pools determine tokens
    handleModalClose() {
        this.isPoolSelectorOpen = false;
    }
    // findPoolWithToken method removed - pool selection is direct
    calculateTokenBFromA() {
        if (!this.selectedPool || !this.tokenAAmount || parseFloat(this.tokenAAmount) <= 0) {
            this.tokenBAmount = '';
            return;
        }
        const pool = this.selectedPool;
        const reserveA = parseFloat(pool.reserveA);
        const reserveB = parseFloat(pool.reserveB);
        const amountA = parseFloat(this.tokenAAmount);
        // Calculate proportional amount for token B
        const amountB = (amountA * reserveB) / reserveA;
        this.tokenBAmount = amountB.toFixed(6);
        this.startQuoteTimer();
    }
    calculateTokenAFromB() {
        if (!this.selectedPool || !this.tokenBAmount || parseFloat(this.tokenBAmount) <= 0) {
            this.tokenAAmount = '';
            return;
        }
        const pool = this.selectedPool;
        const reserveA = parseFloat(pool.reserveA);
        const reserveB = parseFloat(pool.reserveB);
        const amountB = parseFloat(this.tokenBAmount);
        // Calculate proportional amount for token A
        const amountA = (amountB * reserveA) / reserveB;
        this.tokenAAmount = amountA.toFixed(6);
        this.startQuoteTimer();
    }
    startQuoteTimer() {
        if (this.quoteTimer) {
            clearTimeout(this.quoteTimer);
        }
        if (this.shouldRequestQuote()) {
            this.quoteTimer = setTimeout(() => {
                this.requestQuote();
            }, 800);
        }
        else {
            this.currentQuote = null;
            this.removeQuote = null;
        }
    }
    shouldRequestQuote() {
        if (!this.selectedPool)
            return false;
        if (this.mode === 'add') {
            return !!(this.tokenAAmount && this.tokenBAmount &&
                parseFloat(this.tokenAAmount) > 0 && parseFloat(this.tokenBAmount) > 0);
        }
        else {
            return !!(this.lpTokenAmount && parseFloat(this.lpTokenAmount) > 0);
        }
    }
    async requestQuote() {
        if (!this.selectedPool)
            return;
        this.isQuoting = true;
        // Convert LiquidityPoolInfo to PoolInfo format for the event
        const apiPool = {
            pool_id: this.selectedPool.address,
            id: this.selectedPool.address,
            token_1: this.selectedPool.tokenA.address,
            token_2: this.selectedPool.tokenB.address,
            token1: this.selectedPool.tokenA.address, // legacy compatibility
            token2: this.selectedPool.tokenB.address, // legacy compatibility
            total_liquidity: this.selectedPool.totalSupply
        };
        this.quoteRequested.emit({
            pool: apiPool,
            tokenAAmount: this.mode === 'add' ? this.tokenAAmount : undefined,
            tokenBAmount: this.mode === 'add' ? this.tokenBAmount : undefined,
            lpTokenAmount: this.mode === 'remove' ? this.lpTokenAmount : undefined,
            mode: this.mode,
        });
        // Simulate quote response
        setTimeout(() => {
            if (this.selectedPool) {
                if (this.mode === 'add' && this.tokenAAmount && this.tokenBAmount) {
                    const pool = this.selectedPool;
                    const totalSupply = parseFloat(pool.totalSupply);
                    const reserveA = parseFloat(pool.reserveA);
                    const amountA = parseFloat(this.tokenAAmount);
                    // Calculate LP tokens to be received
                    const lpTokensReceived = totalSupply > 0
                        ? (amountA / reserveA) * totalSupply
                        : Math.sqrt(parseFloat(this.tokenAAmount) * parseFloat(this.tokenBAmount));
                    this.currentQuote = {
                        tokenAAmount: this.tokenAAmount,
                        tokenBAmount: this.tokenBAmount,
                        lpTokensReceived: lpTokensReceived.toFixed(6),
                        shareOfPool: (lpTokensReceived / (totalSupply + lpTokensReceived)) * 100,
                        priceImpact: Math.random() * 0.5, // Mock price impact
                        minimumLpReceived: (lpTokensReceived * (1 - this.slippage / 100)).toFixed(6),
                    };
                }
                else if (this.mode === 'remove' && this.lpTokenAmount) {
                    const pool = this.selectedPool;
                    const totalSupply = parseFloat(pool.totalSupply);
                    const lpAmount = parseFloat(this.lpTokenAmount);
                    const shareRemoved = (lpAmount / totalSupply) * 100;
                    const tokenAReceived = (lpAmount / totalSupply) * parseFloat(pool.reserveA);
                    const tokenBReceived = (lpAmount / totalSupply) * parseFloat(pool.reserveB);
                    this.removeQuote = {
                        lpTokenAmount: this.lpTokenAmount,
                        tokenAReceived: tokenAReceived.toFixed(6),
                        tokenBReceived: tokenBReceived.toFixed(6),
                        shareRemoved,
                        minimumTokenAReceived: (tokenAReceived * (1 - this.slippage / 100)).toFixed(6),
                        minimumTokenBReceived: (tokenBReceived * (1 - this.slippage / 100)).toFixed(6),
                    };
                }
            }
            this.isQuoting = false;
        }, 1000);
    }
    getUserPosition() {
        if (!this.selectedPool)
            return null;
        return this.positions.find(pos => pos.poolAddress === this.selectedPool.address) || null;
    }
    getFirstDisconnectedChain() {
        if (!this.selectedPool)
            return 'ethereum';
        const tokenAConnected = walletStore.isWalletConnected(this.selectedPool.tokenA.chainUID);
        if (!tokenAConnected)
            return this.selectedPool.tokenA.chainUID;
        return this.selectedPool.tokenB.chainUID;
    }
    canExecute() {
        if (!this.selectedPool || !this.walletAddress || this.loading || this.disabled || this.isQuoting) {
            return false;
        }
        if (this.mode === 'add') {
            return !!(this.currentQuote && this.tokenAAmount && this.tokenBAmount);
        }
        else {
            return !!(this.removeQuote && this.lpTokenAmount);
        }
    }
    getButtonText() {
        // Check wallet connection for required chains
        if (!this.isWalletConnectedForLiquidity()) {
            const chainName = this.getRequiredChainName();
            return `Connect ${chainName}`;
        }
        if (!this.selectedPool)
            return 'Select Pool';
        if (this.mode === 'add') {
            if (!this.tokenAAmount || !this.tokenBAmount)
                return 'Enter Amounts';
            if (this.isQuoting)
                return 'Getting Quote...';
            if (this.loading)
                return 'Adding Liquidity...';
            return 'Add Liquidity';
        }
        else {
            if (!this.lpTokenAmount)
                return 'Enter LP Amount';
            if (this.isQuoting)
                return 'Getting Quote...';
            if (this.loading)
                return 'Removing Liquidity...';
            return 'Remove Liquidity';
        }
    }
    isWalletConnectedForLiquidity() {
        if (!this.selectedPool)
            return false;
        // For liquidity operations, we need wallets connected for both token chains
        const tokenAConnected = walletStore.isWalletConnected(this.selectedPool.tokenA.chainUID);
        const tokenBConnected = walletStore.isWalletConnected(this.selectedPool.tokenB.chainUID);
        return tokenAConnected && tokenBConnected;
    }
    getRequiredChainName() {
        if (!this.selectedPool)
            return 'Wallet';
        // Check which chains need connection
        const tokenAConnected = walletStore.isWalletConnected(this.selectedPool.tokenA.chainUID);
        const tokenBConnected = walletStore.isWalletConnected(this.selectedPool.tokenB.chainUID);
        if (!tokenAConnected && !tokenBConnected) {
            return 'Wallets';
        }
        else if (!tokenAConnected) {
            return this.getChainDisplayName(this.selectedPool.tokenA.chainUID);
        }
        else if (!tokenBConnected) {
            return this.getChainDisplayName(this.selectedPool.tokenB.chainUID);
        }
        return 'Wallet';
    }
    getChainDisplayName(chainUID) {
        // Simple mapping - in production this would come from chain config
        const chainNames = {
            'ethereum': 'Ethereum',
            'polygon': 'Polygon',
            'arbitrum': 'Arbitrum',
            'optimism': 'Optimism',
            'cosmoshub-4': 'Cosmos Hub',
            'osmosis-1': 'Osmosis',
        };
        return chainNames[chainUID] || 'Wallet';
    }
    render() {
        const position = this.getUserPosition();
        return (h("div", { key: 'fbb27ab9ab7899320d28a125a7357c4e32fee744', class: "liquidity-card" }, h("div", { key: 'fbf92028cdeb8d065f319cd3a3f09727020c7bcb', class: "liquidity-header" }, h("h3", { key: '0457fcaa0a2682fa39e52c7693f944645e965c92', class: "liquidity-title" }, this.cardTitle), h("div", { key: 'd7a84e7900bb5fe29487733a1dccace61ba2a22d', class: "mode-toggle" }, h("button", { key: '4707d6117de7765b50a8c59149863fc368aafd40', class: {
                'mode-button': true,
                'mode-button--active': this.mode === 'add',
            }, onClick: () => this.handleModeChange('add'), type: "button" }, "Add"), h("button", { key: 'b8d4416d3be73a432f7d48c510e2e4cc64bd112a', class: {
                'mode-button': true,
                'mode-button--active': this.mode === 'remove',
            }, onClick: () => this.handleModeChange('remove'), type: "button" }, "Remove"))), h("div", { key: '56b5cf2bc51ca11c2dedfe9e947809644267ac5f', class: "pool-section" }, h("div", { key: 'fd6487086cfaaac4c86d0f54f6e34dea309e6f18', class: "section-header" }, h("span", { key: 'eee09fb8655432b11db1f34ef830474671c96cd7', class: "section-label" }, "Pool")), h("div", { key: 'fb48fc9f17857c928f4a621ec17d5af1d28bbf4c', class: "pool-selector", onClick: this.openPoolSelector }, this.selectedStorePool ? (h("div", { class: "selected-pool" }, h("div", { class: "pool-tokens" }, h("div", { class: "token-pair" }), h("div", { class: "pool-info" }, h("span", { class: "pool-name" }, this.selectedStorePool.token_1.toUpperCase(), "/", this.selectedStorePool.token_2.toUpperCase()), h("span", { class: "pool-fee" }, "Pool Fee"))), h("div", { class: "pool-stats" }, h("div", { class: "stat" }, h("span", { class: "stat-label" }, "APR"), h("span", { class: "stat-value" }, this.selectedStorePool.apr || 'N/A')), h("div", { class: "stat" }, h("span", { class: "stat-label" }, "TVL"), h("span", { class: "stat-value" }, "$", parseFloat(this.selectedStorePool.total_liquidity || '0').toLocaleString()))))) : (h("div", { class: "select-pool-button" }, h("span", null, "Select Pool"), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" })))))), this.mode === 'remove' && position && (h("div", { key: 'f1d3724de38d34aa7aa7790551963a175f33080c', class: "position-info" }, h("div", { key: 'b793920b80f4cb11354869133be1dbb3368ee079', class: "position-header" }, h("span", { key: '6a039b02cd1a9f74104ee34f682b9e64a9889e0b', class: "position-label" }, "Your Position")), h("div", { key: 'c97baf92a9754ae2fca115e03200e1f30bd1d448', class: "position-details" }, h("div", { key: 'd5fec46738c36828ef1ae3e6733a3cfa6a3a5039', class: "position-row" }, h("span", { key: '66ccbf9254ef55c51816ea721eaada7277acb54e', class: "position-item-label" }, "LP Tokens"), h("span", { key: '01d82005a28686c26139b6a93f9db14e16484bc6', class: "position-item-value" }, parseFloat(position.lpTokenBalance).toLocaleString())), h("div", { key: 'cbaa6637710172da8508e32cb411ee9a883a5751', class: "position-row" }, h("span", { key: '66de96f4f417063e59ed9482bfcaef9d0a91fb89', class: "position-item-label" }, "Pool Share"), h("span", { key: '520510c337fa67835da8f4a63e3d81ebc9ab5673', class: "position-item-value" }, position.shareOfPool.toFixed(4), "%")), h("div", { key: 'f8a5a350c9967d11fccac64b96dab8f9179cfcc9', class: "position-row" }, h("span", { key: '12317d6dcc609599a8453b45ab7ea87eecd69f8d', class: "position-item-label" }, this.selectedPool?.tokenA.symbol), h("span", { key: 'bf590312d1c965a3bdaef81b7ac96be2310a90d8', class: "position-item-value" }, parseFloat(position.tokenAAmount).toLocaleString())), h("div", { key: 'b227ba9463e21849bf88e354cc93b4fc23c823b5', class: "position-row" }, h("span", { key: 'e6e685d3a93801063d8848dacd4fba95c0ab9a6a', class: "position-item-label" }, this.selectedPool?.tokenB.symbol), h("span", { key: '64a27461ccffb52c6d0f629f36bc9335bbab6177', class: "position-item-value" }, parseFloat(position.tokenBAmount).toLocaleString()))))), this.mode === 'add' ? this.renderAddLiquidity() : this.renderRemoveLiquidity(), (this.currentQuote || this.removeQuote) && (h("div", { key: 'ef7494271ae36f29070fa062d7d43100ba49d7e9', class: "quote-info" }, this.mode === 'add' && this.currentQuote ? (h("div", null, h("div", { class: "quote-row" }, h("span", { class: "quote-label" }, "LP Tokens Received"), h("span", { class: "quote-value" }, parseFloat(this.currentQuote.lpTokensReceived).toLocaleString())), h("div", { class: "quote-row" }, h("span", { class: "quote-label" }, "Pool Share"), h("span", { class: "quote-value" }, this.currentQuote.shareOfPool.toFixed(4), "%")), this.currentQuote.priceImpact > 0.1 && (h("div", { class: "quote-row" }, h("span", { class: "quote-label" }, "Price Impact"), h("span", { class: {
                'quote-value': true,
                'quote-value--warning': this.currentQuote.priceImpact > 1,
                'quote-value--danger': this.currentQuote.priceImpact > 3,
            } }, this.currentQuote.priceImpact.toFixed(3), "%"))))) : this.mode === 'remove' && this.removeQuote ? (h("div", null, h("div", { class: "quote-row" }, h("span", { class: "quote-label" }, "Pool Share Removed"), h("span", { class: "quote-value" }, this.removeQuote.shareRemoved.toFixed(4), "%")), h("div", { class: "quote-row" }, h("span", { class: "quote-label" }, this.selectedPool?.tokenA.symbol, " Received"), h("span", { class: "quote-value" }, parseFloat(this.removeQuote.tokenAReceived).toLocaleString())), h("div", { class: "quote-row" }, h("span", { class: "quote-label" }, this.selectedPool?.tokenB.symbol, " Received"), h("span", { class: "quote-value" }, parseFloat(this.removeQuote.tokenBReceived).toLocaleString())))) : null)), h("div", { key: '612805e4dddc9b1d1503b2476c0835b537e45968', class: "advanced-section" }, h("button", { key: 'ad062b6527a84920b912099a6d07c1613b71b4f3', class: "advanced-toggle", onClick: () => this.isAdvancedOpen = !this.isAdvancedOpen, type: "button" }, h("span", { key: 'b239f7a654cfacfdd225029d7cdea88429635350' }, "Advanced Settings"), h("svg", { key: '2aca2842f79e015832b8fb9c4a594b852a9ba81a', class: {
                'dropdown-arrow': true,
                'dropdown-arrow--open': this.isAdvancedOpen,
            }, viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: '8f4ae78087449d10dbde50628e78f179e224deee', d: "M7 10l5 5 5-5z" }))), this.isAdvancedOpen && (h("div", { key: 'b909234c6b44aac120d18cb0f797435b0ab8245d', class: "advanced-panel" }, h("div", { key: '7342fd5ea77e7d945feec2f4510b3a309e3e95aa', class: "setting-item" }, h("label", { key: 'b97fd6799eb2975469fb3e08c82eef62126d277f', class: "setting-label" }, "Slippage Tolerance"), h("div", { key: 'ee935980b4cfa704266d03c2f9864ebbef1089f1', class: "slippage-controls" }, [0.1, 0.5, 1.0].map((value) => (h("button", { class: {
                'slippage-btn': true,
                'slippage-btn--active': this.slippage === value,
            }, onClick: () => this.slippage = value, type: "button" }, value, "%"))), h("input", { key: 'c3be315b32b031876d88b469fd30f31c4587942f', class: "slippage-input", type: "number", min: "0", max: "50", step: "0.1", value: this.slippage, onInput: (e) => this.slippage = parseFloat(e.target.value), placeholder: "Custom" })))))), h("euclid-button", { key: '5944b56e76e00b59e4c672263de5eb2664a711f8', variant: "primary", size: "lg", "full-width": true, loading: this.loading, disabled: !this.canExecute(), onClick: this.handleLiquidity }, this.getButtonText()), this.isPoolSelectorOpen && (h("div", { key: '978c72fc4bbc424f2a0973540ceb27395bb34218', class: "pool-selector-dropdown" }, h("div", { key: '5ce5d143a9531899947f2a41a26647828a4f7f0f', class: "dropdown-header" }, h("h4", { key: '1218a0301d481810ae011c6e781ef1f10584709b' }, "Select Pool"), h("button", { key: '36927bc8368749e8b4cf3a740d6f99d26b55c57e', class: "close-button", onClick: () => this.isPoolSelectorOpen = false }, "\u00D7")), h("div", { key: 'f8bd7d24e6ff2e0780558293ca574d0405cf1b22', class: "pool-list" }, this.storePools.length > 0 ? (this.storePools.map(pool => (h("div", { key: pool.pool_id, class: "pool-item", onClick: () => this.selectStorePool(pool) }, h("div", { class: "pool-tokens" }, h("span", { class: "pool-name" }, pool.token_1.toUpperCase(), "/", pool.token_2.toUpperCase())), h("div", { class: "pool-stats" }, h("span", { class: "apr" }, "APR: ", pool.apr || '0.00%'), h("span", { class: "tvl" }, "TVL: $", parseFloat(pool.total_liquidity || '0').toLocaleString())))))) : (h("div", { class: "no-pools" }, "No pools available")))))));
    }
    renderAddLiquidity() {
        return (h("div", { class: "liquidity-inputs" }, h("div", { class: "token-input-section" }, h("div", { class: "input-header" }, h("span", { class: "input-label" }, "First Token"), this.selectedPool?.tokenA.balance && (h("span", { class: "balance-label", onClick: () => this.handleMaxClick('tokenA') }, "Balance: ", parseFloat(this.selectedPool.tokenA.balance).toLocaleString()))), h("euclid-token-input", { id: "token-a-input", value: this.tokenAAmount, placeholder: "0.0", "show-max": !!this.selectedPool?.tokenA.balance, onMaxClick: () => this.handleMaxClick('tokenA') }, h("div", { slot: "token", class: "token-display" }, this.selectedStorePool ? (h("div", { class: "selected-token" }, h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, this.selectedStorePool.token_1.toUpperCase()), h("span", { class: "token-name" }, this.selectedStorePool.token_1)))) : (h("div", { class: "no-pool-selected" }, h("span", { class: "token-symbol" }, "TOKEN"), h("span", { class: "token-name" }, "Select pool first")))))), h("div", { class: "token-input-section" }, h("div", { class: "input-header" }, h("span", { class: "input-label" }, "Second Token"), this.selectedPool?.tokenB.balance && (h("span", { class: "balance-label", onClick: () => this.handleMaxClick('tokenB') }, "Balance: ", parseFloat(this.selectedPool.tokenB.balance).toLocaleString()))), h("euclid-token-input", { id: "token-b-input", value: this.tokenBAmount, placeholder: "0.0", "show-max": !!this.selectedPool?.tokenB.balance, onMaxClick: () => this.handleMaxClick('tokenB') }, h("div", { slot: "token", class: "token-display" }, this.selectedStorePool ? (h("div", { class: "selected-token" }, h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, this.selectedStorePool.token_2.toUpperCase()), h("span", { class: "token-name" }, this.selectedStorePool.token_2)))) : (h("div", { class: "no-pool-selected" }, h("span", { class: "token-symbol" }, "TOKEN"), h("span", { class: "token-name" }, "Select pool first"))))))));
    }
    renderRemoveLiquidity() {
        const position = this.getUserPosition();
        return (h("div", { class: "remove-liquidity" }, h("div", { class: "percentage-section" }, h("div", { class: "percentage-label" }, "Amount to Remove"), h("div", { class: "percentage-buttons" }, [25, 50, 75, 100].map((percent) => (h("button", { class: {
                'percentage-btn': true,
                'percentage-btn--active': this.lpPercentage === percent,
            }, onClick: () => this.handlePercentageClick(percent), type: "button" }, percent, "%"))))), h("div", { class: "token-input-section" }, h("div", { class: "input-header" }, h("span", { class: "input-label" }, "LP Tokens to Remove"), position && (h("span", { class: "balance-label", onClick: () => this.handleMaxClick('lp') }, "Balance: ", parseFloat(position.lpTokenBalance).toLocaleString()))), h("euclid-token-input", { id: "lp-token-input", value: this.lpTokenAmount, placeholder: "0.0", "show-max": !!position, onMaxClick: () => this.handleMaxClick('lp') }, h("div", { slot: "token", class: "lp-token-display" }, this.selectedPool ? (h("div", { class: "lp-token-info" }, h("div", { class: "token-pair" }, this.selectedPool.tokenA.logoUrl && (h("img", { src: this.selectedPool.tokenA.logoUrl, alt: this.selectedPool.tokenA.symbol, class: "token-logo" })), this.selectedPool.tokenB.logoUrl && (h("img", { src: this.selectedPool.tokenB.logoUrl, alt: this.selectedPool.tokenB.symbol, class: "token-logo token-logo--overlap" }))), h("span", { class: "lp-symbol" }, this.selectedPool.lpTokenSymbol))) : (h("span", null, "Select Pool")))))));
    }
    get element() { return this; }
    static get style() { return euclidLiquidityCardCss; }
}, [257, "euclid-liquidity-card", {
        "tokens": [16],
        "pools": [16],
        "positions": [16],
        "selectedPool": [1040],
        "mode": [1025],
        "tokenAAmount": [1025, "token-a-amount"],
        "tokenBAmount": [1025, "token-b-amount"],
        "lpTokenAmount": [1025, "lp-token-amount"],
        "loading": [4],
        "disabled": [4],
        "walletAddress": [1, "wallet-address"],
        "defaultSlippage": [2, "default-slippage"],
        "cardTitle": [1, "card-title"],
        "storePools": [32],
        "storeTokens": [32],
        "storeLoading": [32],
        "selectedStorePool": [32],
        "isPoolSelectorOpen": [32],
        "currentQuote": [32],
        "removeQuote": [32],
        "isQuoting": [32],
        "slippage": [32],
        "isAdvancedOpen": [32],
        "lpPercentage": [32]
    }, [[0, "valueChange", "handleInputChange"], [0, "modalClose", "handleModalClose"]]]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-liquidity-card", "euclid-button", "euclid-token-input"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-liquidity-card":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidLiquidityCard$1);
            }
            break;
        case "euclid-button":
            if (!customElements.get(tagName)) {
                defineCustomElement$3();
            }
            break;
        case "euclid-token-input":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const EuclidLiquidityCard = EuclidLiquidityCard$1;
const defineCustomElement = defineCustomElement$1;

export { EuclidLiquidityCard, defineCustomElement };
//# sourceMappingURL=euclid-liquidity-card.js.map

//# sourceMappingURL=euclid-liquidity-card.js.map