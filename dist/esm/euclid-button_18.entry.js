import { r as registerInstance, h, H as Host, c as createEvent, d as getElement } from './index-DQPEQJEF.js';
import { w as walletStore } from './wallet.store--j01c46J.js';
import { a as appStore } from './app.store-DFrncGaU.js';
import { l as liquidityStore, m as marketStore, a as apiClient, D as DEFAULTS } from './constants-BDGHnWrB.js';
import { d as dispatchEuclidEvent, E as EUCLID_EVENTS } from './events-CKexLjV3.js';

const euclidButtonCss = ":host{display:inline-block}.euclid-button{display:inline-flex;align-items:center;justify-content:center;gap:var(--euclid-space-2);font-family:var(--euclid-font-sans);font-weight:var(--euclid-button-font-weight);text-decoration:none;cursor:pointer;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;transition:var(--euclid-button-transition);border:var(--euclid-border-1) solid transparent;border-radius:var(--euclid-button-border-radius);position:relative;overflow:hidden;outline:none;vertical-align:middle}.euclid-button:focus-visible{outline:2px solid var(--euclid-interactive-primary);outline-offset:2px}.euclid-button--sm{padding:var(--euclid-space-2) var(--euclid-space-3);font-size:var(--euclid-text-sm);min-height:var(--euclid-space-8);line-height:var(--euclid-leading-tight)}.euclid-button--md{padding:var(--euclid-space-3) var(--euclid-space-4);font-size:var(--euclid-text-base);min-height:var(--euclid-space-10);line-height:var(--euclid-leading-normal)}.euclid-button--lg{padding:var(--euclid-space-4) var(--euclid-space-6);font-size:var(--euclid-text-lg);min-height:var(--euclid-space-12);line-height:var(--euclid-leading-normal)}.euclid-button--primary{background-color:var(--euclid-interactive-primary);color:var(--euclid-text-inverse);box-shadow:var(--euclid-button-shadow)}.euclid-button--primary:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-interactive-primary-hover);box-shadow:var(--euclid-button-shadow-hover);transform:translateY(-1px)}.euclid-button--primary:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-interactive-primary-active);transform:translateY(0);box-shadow:var(--euclid-button-shadow)}.euclid-button--secondary{background-color:var(--euclid-surface);color:var(--euclid-text-primary);border-color:var(--euclid-border);box-shadow:var(--euclid-button-shadow)}.euclid-button--secondary:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover);box-shadow:var(--euclid-button-shadow-hover);transform:translateY(-1px)}.euclid-button--secondary:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-background-secondary);transform:translateY(0)}.euclid-button--danger{background-color:var(--euclid-danger-600);color:var(--euclid-text-inverse);box-shadow:var(--euclid-button-shadow)}.euclid-button--danger:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-danger-700);box-shadow:var(--euclid-button-shadow-hover);transform:translateY(-1px)}.euclid-button--danger:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-danger-700);transform:translateY(0);box-shadow:var(--euclid-button-shadow)}.euclid-button--ghost{background-color:transparent;color:var(--euclid-text-secondary);border-color:transparent}.euclid-button--ghost:hover:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-surface-secondary);color:var(--euclid-text-primary)}.euclid-button--ghost:active:not(.euclid-button--disabled):not(.euclid-button--loading){background-color:var(--euclid-background-secondary)}.euclid-button--disabled{opacity:0.5;cursor:not-allowed;transform:none !important;box-shadow:none !important}.euclid-button--loading{cursor:default;pointer-events:none}.euclid-button--full-width{width:100%}.euclid-button__content{display:flex;align-items:center;justify-content:center;gap:var(--euclid-space-2);transition:opacity var(--euclid-transition-fast)}.euclid-button__content--hidden{opacity:0}.euclid-button__spinner{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);display:flex;align-items:center;justify-content:center}.euclid-button__spinner-icon{width:1rem;height:1rem;animation:euclid-spin 1s linear infinite;border:2px solid currentColor;border-top-color:transparent;border-radius:var(--euclid-radius-full)}.euclid-button--sm .euclid-button__spinner-icon{width:0.875rem;height:0.875rem}.euclid-button--lg .euclid-button__spinner-icon{width:1.25rem;height:1.25rem}@media (prefers-contrast: high){.euclid-button{border-width:var(--euclid-border-2)}.euclid-button--primary{border-color:var(--euclid-interactive-primary)}.euclid-button--secondary{border-color:var(--euclid-text-primary)}.euclid-button--danger{border-color:var(--euclid-danger-600)}}@media (prefers-reduced-motion: reduce){.euclid-button{transition:none}.euclid-button:hover{transform:none}.euclid-button__spinner-icon{animation:none}}@media (pointer: coarse){.euclid-button--sm{min-height:var(--euclid-space-10);padding:var(--euclid-space-2_5) var(--euclid-space-4)}.euclid-button--md{min-height:var(--euclid-space-12);padding:var(--euclid-space-3_5) var(--euclid-space-5)}.euclid-button--lg{min-height:var(--euclid-space-16);padding:var(--euclid-space-5) var(--euclid-space-7)}}";

const EuclidButton = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.variant = 'primary';
        this.size = 'md';
        this.loading = false;
        this.disabled = false;
        this.fullWidth = false;
        this.type = 'button';
        this.handleClick = (event) => {
            if (this.disabled || this.loading) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        };
    }
    render() {
        const classes = {
            'euclid-button': true,
            [`euclid-button--${this.variant}`]: true,
            [`euclid-button--${this.size}`]: true,
            'euclid-button--loading': this.loading,
            'euclid-button--disabled': this.disabled,
            'euclid-button--full-width': this.fullWidth,
        };
        const commonProps = {
            class: classes,
            disabled: this.disabled || this.loading,
            onClick: this.handleClick,
            'aria-busy': this.loading ? 'true' : 'false',
        };
        // If href is provided, render as a link
        if (this.href && !this.disabled && !this.loading) {
            return (h(Host, null, h("a", { href: this.href, class: classes, role: "button", "aria-busy": this.loading ? 'true' : 'false' }, this.loading && (h("span", { class: "euclid-button__spinner", "aria-hidden": "true" }, h("svg", { viewBox: "0 0 24 24", class: "euclid-button__spinner-icon" }, h("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", "stroke-width": "2", fill: "none", "stroke-linecap": "round", "stroke-dasharray": "60", "stroke-dashoffset": "60" })))), h("span", { class: { 'euclid-button__content': true, 'euclid-button__content--hidden': this.loading } }, h("slot", null)))));
        }
        // Render as button
        return (h(Host, null, h("button", { type: this.type, ...commonProps }, this.loading && (h("span", { class: "euclid-button__spinner", "aria-hidden": "true" }, h("svg", { viewBox: "0 0 24 24", class: "euclid-button__spinner-icon" }, h("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", "stroke-width": "2", fill: "none", "stroke-linecap": "round", "stroke-dasharray": "60", "stroke-dashoffset": "60" })))), h("span", { class: { 'euclid-button__content': true, 'euclid-button__content--hidden': this.loading } }, h("slot", null)))));
    }
};
EuclidButton.style = euclidButtonCss;

const euclidLiquidityCardCss = ":host{display:contents}.liquidity-card{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);padding:var(--euclid-spacing-6);max-width:480px;width:100%;box-shadow:var(--euclid-shadow-xl);display:flex;flex-direction:column;gap:var(--euclid-spacing-6)}.liquidity-header{display:flex;justify-content:space-between;align-items:center}.liquidity-title{font-size:var(--euclid-text-size-xl);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary);margin:0}.mode-toggle{display:flex;background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg);padding:var(--euclid-spacing-1)}.mode-button{padding:var(--euclid-spacing-2) var(--euclid-spacing-4);border:none;background:transparent;color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);cursor:pointer;border-radius:var(--euclid-radius-md);transition:all var(--euclid-transition-duration-fast)}.mode-button--active{background:var(--euclid-surface);color:var(--euclid-text-primary);box-shadow:var(--euclid-shadow-sm)}.mode-button:hover:not(.mode-button--active){color:var(--euclid-text-primary)}.pool-section{display:flex;flex-direction:column;gap:var(--euclid-spacing-4)}.section-header{display:flex;justify-content:space-between;align-items:center}.section-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.pool-selector{cursor:pointer}.pool-selector:hover{opacity:0.8}.selected-pool{display:flex;align-items:center;gap:var(--euclid-spacing-4);padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface);transition:all var(--euclid-transition-duration-fast)}.select-pool-button{display:flex;align-items:center;justify-content:center;gap:var(--euclid-spacing-2);padding:var(--euclid-spacing-4) var(--euclid-spacing-6);border:2px dashed var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface-secondary);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-medium);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.select-pool-button:hover{border-color:var(--euclid-border-hover)}.pool-tokens{display:flex;align-items:center}.token-pair{display:flex;align-items:center}.token-logo{width:2rem;height:2rem;border-radius:50%;background:var(--euclid-surface-secondary);border:2px solid var(--euclid-surface)}.token-logo--overlap{margin-left:-0.5rem}.pool-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1)}.pool-name{font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary)}.pool-fee{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.pool-stats{display:flex;gap:var(--euclid-spacing-6)}.stat{display:flex;flex-direction:column;gap:var(--euclid-spacing-1)}.stat-label{font-size:var(--euclid-text-size-xs);color:var(--euclid-text-muted)}.stat-value{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.position-info{padding:var(--euclid-spacing-4);background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-xl)}.position-header{margin-bottom:var(--euclid-spacing-3)}.position-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.position-details{display:flex;flex-direction:column;gap:var(--euclid-spacing-3)}.position-row{display:flex;justify-content:space-between;align-items:center}.position-item-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.position-item-value{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.liquidity-inputs{display:flex;flex-direction:column;gap:var(--euclid-spacing-4)}.token-input-section{position:relative}.input-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--euclid-spacing-2)}.input-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.balance-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-muted);cursor:pointer;transition:color var(--euclid-transition-duration-fast)}.balance-label:hover{color:var(--euclid-text-secondary)}.plus-icon{position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);z-index:10;width:2rem;height:2rem;background:var(--euclid-surface);border:2px solid var(--euclid-border);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--euclid-text-secondary)}.plus-icon svg{width:1rem;height:1rem}.token-selector{cursor:pointer}.token-selector:hover{opacity:0.8}.selected-token{display:flex;align-items:center;gap:var(--euclid-spacing-3);padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface)}.select-token-button{display:flex;align-items:center;justify-content:center;gap:var(--euclid-spacing-2);padding:var(--euclid-spacing-4) var(--euclid-spacing-6);border:2px dashed var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface-secondary);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-medium);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.select-token-button:hover{border-color:var(--euclid-border-hover)}.token-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1);flex:1}.token-symbol{font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary)}.token-name{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.dropdown-arrow{color:var(--euclid-text-muted);transition:transform var(--euclid-transition-duration-fast)}.dropdown-arrow--open{transform:rotate(180deg)}.remove-liquidity{display:flex;flex-direction:column;gap:var(--euclid-spacing-4)}.percentage-section{display:flex;flex-direction:column;gap:var(--euclid-spacing-3)}.percentage-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.percentage-buttons{display:flex;gap:var(--euclid-spacing-2)}.percentage-btn{flex:1;padding:var(--euclid-spacing-3);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);background:var(--euclid-surface);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.percentage-btn:hover{border-color:var(--euclid-border-hover);color:var(--euclid-text-primary)}.percentage-btn--active{border-color:var(--euclid-interactive-primary);background:var(--euclid-primary-50);color:var(--euclid-primary-700)}.lp-token-display{display:flex;align-items:center;gap:var(--euclid-spacing-3);padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface-secondary)}.lp-token-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1);flex:1}.lp-symbol{font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary)}.quote-info{padding:var(--euclid-spacing-4);background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-xl)}.quote-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--euclid-spacing-2)}.quote-row:last-child{margin-bottom:0}.quote-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.quote-value{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.quote-value--warning{color:var(--euclid-warning-600)}.quote-value--danger{color:var(--euclid-danger-600)}.advanced-section{border-top:1px solid var(--euclid-border);padding-top:var(--euclid-spacing-4)}.advanced-toggle{display:flex;align-items:center;gap:var(--euclid-spacing-2);padding:var(--euclid-spacing-2) 0;background:transparent;border:none;color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);cursor:pointer;transition:color var(--euclid-transition-duration-fast)}.advanced-toggle:hover{color:var(--euclid-text-primary)}.advanced-panel{margin-top:var(--euclid-spacing-4);padding:var(--euclid-spacing-4);background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg)}.setting-item{display:flex;flex-direction:column;gap:var(--euclid-spacing-2)}.setting-label{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary)}.slippage-controls{display:flex;gap:var(--euclid-spacing-2);align-items:center}.slippage-btn{padding:var(--euclid-spacing-2) var(--euclid-spacing-3);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.slippage-btn:hover{border-color:var(--euclid-border-hover);color:var(--euclid-text-primary)}.slippage-btn--active{border-color:var(--euclid-interactive-primary);background:var(--euclid-primary-50);color:var(--euclid-primary-700)}.slippage-input{padding:var(--euclid-spacing-2) var(--euclid-spacing-3);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-primary);font-size:var(--euclid-text-size-sm);width:80px;text-align:center}.slippage-input:focus{outline:none;border-color:var(--euclid-border-focus);box-shadow:0 0 0 3px rgba(37, 99, 235, 0.1)}@media (max-width: 480px){.liquidity-card{padding:var(--euclid-spacing-4);gap:var(--euclid-spacing-4)}.liquidity-header{flex-direction:column;gap:var(--euclid-spacing-3);align-items:flex-start}.mode-toggle{width:100%}.mode-button{flex:1;text-align:center}.pool-stats{flex-direction:column;gap:var(--euclid-spacing-3)}.percentage-buttons{flex-wrap:wrap}.percentage-btn{min-width:calc(50% - var(--euclid-spacing-1))}.slippage-controls{flex-wrap:wrap;gap:var(--euclid-spacing-2)}.selected-pool,.selected-token,.lp-token-display{flex-direction:column;align-items:flex-start;gap:var(--euclid-spacing-2)}.pool-tokens{order:-1}.token-pair{gap:var(--euclid-spacing-2)}.token-logo--overlap{margin-left:0}.pool-info,.token-info,.lp-token-info{width:100%}}@media (prefers-reduced-motion: reduce){.mode-button,.pool-selector,.token-selector,.percentage-btn,.slippage-btn{transition:none}}.token-selector:focus-within,.pool-selector:focus-within{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.mode-button:focus{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.percentage-btn:focus,.slippage-btn:focus{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.quote-info.loading{position:relative;pointer-events:none}.quote-info.loading::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:1.5rem;height:1.5rem;border:2px solid var(--euclid-border);border-top:2px solid var(--euclid-interactive-primary);border-radius:50%;animation:euclid-spin 1s linear infinite}@media (prefers-contrast: high){.liquidity-card,.selected-pool,.selected-token,.lp-token-display,.position-info,.quote-info,.advanced-panel{border-width:2px;border-color:var(--euclid-text-primary)}.mode-button--active,.percentage-btn--active,.slippage-btn--active{border-color:var(--euclid-text-primary);background:var(--euclid-text-primary);color:var(--euclid-surface)}}";

const EuclidLiquidityCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
    get element() { return getElement(this); }
};
EuclidLiquidityCard.style = euclidLiquidityCardCss;

const EuclidMarketDataController = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isInitialized = false;
    }
    async componentDidLoad() {
        await this.initialize();
    }
    disconnectedCallback() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
    async initialize() {
        console.log('📊 Initializing Market Data Controller...');
        // Load initial market data
        await this.loadInitialData();
        // Set up periodic market data refresh
        this.setupPeriodicRefresh();
        this.isInitialized = true;
        console.log('📊 Market Data Controller initialized');
    }
    async loadInitialData() {
        try {
            marketStore.setLoading(true);
            console.log('📊 Loading initial market data...');
            // Load chains
            const chainsResponse = await apiClient.getAllChains(false);
            if (chainsResponse.success && chainsResponse.data) {
                // Store the EuclidChainConfig[] data directly
                marketStore.setChains(chainsResponse.data);
                console.log('📡 Loaded chains:', chainsResponse.data.length);
            }
            else {
                console.warn('Failed to load chains:', chainsResponse.error);
            }
            // Load tokens
            const tokensResponse = await apiClient.getAllTokens();
            if (tokensResponse.success && tokensResponse.data) {
                // Store the TokenMetadata[] data directly
                marketStore.setTokens(tokensResponse.data);
                console.log('🪙 Loaded tokens:', tokensResponse.data.length);
            }
            else {
                console.warn('Failed to load tokens:', tokensResponse.error);
            }
            // Load pools
            const poolsResponse = await apiClient.getAllPools();
            if (poolsResponse.success && poolsResponse.data) {
                marketStore.setPools(poolsResponse.data);
                console.log('🏊 Loaded pools:', poolsResponse.data.length);
            }
            else {
                console.warn('Failed to load pools:', poolsResponse.error);
            }
        }
        catch (error) {
            console.error('Failed to load initial market data:', error);
        }
        finally {
            marketStore.setLoading(false);
        }
    }
    setupPeriodicRefresh() {
        // Refresh market data every 5 minutes
        this.refreshInterval = window.setInterval(async () => {
            if (marketStore.isDataStale()) {
                console.log('🔄 Refreshing stale market data...');
                await this.refreshMarketData();
            }
        }, DEFAULTS.MARKET_DATA_REFRESH_INTERVAL);
    }
    async refreshMarketData() {
        try {
            marketStore.setLoading(true);
            // Refresh chains data
            const chainsResponse = await apiClient.getAllChains(false);
            if (chainsResponse.success && chainsResponse.data) {
                marketStore.setChains(chainsResponse.data);
            }
            // Refresh tokens data
            const tokensResponse = await apiClient.getAllTokens();
            if (tokensResponse.success && tokensResponse.data) {
                marketStore.setTokens(tokensResponse.data);
            }
            console.log('✅ Market data refreshed successfully');
        }
        catch (error) {
            console.error('❌ Failed to refresh market data:', error);
        }
        finally {
            marketStore.setLoading(false);
        }
    }
    async handleInitialDataLoad() {
        console.log('📊 Loading initial market data...');
        await this.loadInitialData();
    }
    async handleRefreshRequest() {
        console.log('🔄 Manual market data refresh requested');
        await this.refreshMarketData();
    }
    async handleTokenDetailsRequest(event) {
        const { tokenId } = event.detail;
        console.log('📋 Loading token details for:', tokenId);
        try {
            // Get token denominations across all chains
            const denomsResponse = await apiClient.getTokenDenoms(tokenId);
            if (denomsResponse.success && denomsResponse.data) {
                const denoms = denomsResponse.data.router.token_denoms.denoms;
                // Emit token details loaded event
                dispatchEuclidEvent(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_SUCCESS, {
                    tokenId,
                    data: { denoms }
                });
            }
            // Get escrow information
            const escrowsResponse = await apiClient.getEscrows(tokenId);
            if (escrowsResponse.success && escrowsResponse.data) {
                const escrows = escrowsResponse.data.router.escrows;
                // Emit escrow info loaded event
                dispatchEuclidEvent(EUCLID_EVENTS.MARKET.ESCROWS_LOADED, {
                    tokenId,
                    data: { escrows }
                });
            }
        }
        catch (error) {
            console.error('Failed to load token details:', error);
            dispatchEuclidEvent(EUCLID_EVENTS.MARKET.TOKEN_DETAILS_FAILED, {
                tokenId,
                error: error.message
            });
        }
    }
    async handleChainDetailsRequest(event) {
        const { chainUID } = event.detail;
        console.log('🔗 Loading chain details for:', chainUID);
        try {
            // Get chain-specific data
            const chain = marketStore.getChain(chainUID);
            if (chain) {
                // Emit chain details loaded event
                dispatchEuclidEvent(EUCLID_EVENTS.MARKET.CHAIN_DETAILS_SUCCESS, {
                    chainUID,
                    data: { chain }
                });
            }
            else {
                // Refresh chains if not found
                await this.refreshMarketData();
            }
        }
        catch (error) {
            console.error('Failed to load chain details:', error);
            dispatchEuclidEvent(EUCLID_EVENTS.MARKET.CHAIN_DETAILS_FAILED, {
                chainUID,
                error: error.message
            });
        }
    }
    render() {
        // This is a headless controller - no visual output
        return null;
    }
};

const euclidModalCss = ":host{display:contents}.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:var(--euclid-z-modal-backdrop);background:var(--euclid-surface-overlay);display:flex;align-items:center;justify-content:center;padding:var(--euclid-space-4);animation:fadeIn var(--euclid-transition-base);isolation:isolate}.modal-container{background:var(--euclid-surface);border-radius:var(--euclid-radius-2xl);box-shadow:var(--euclid-shadow-2xl);border:var(--euclid-border-1) solid var(--euclid-border);max-width:var(--euclid-modal-max-width-base);width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;animation:slideUp var(--euclid-transition-base);outline:none;position:relative}.modal-header{display:flex;justify-content:space-between;align-items:center;padding:var(--euclid-space-6);border-bottom:var(--euclid-border-1) solid var(--euclid-border)}.modal-title{margin:0;font-size:var(--euclid-text-lg);font-weight:var(--euclid-font-semibold);color:var(--euclid-text-primary)}.close-button{display:flex;align-items:center;justify-content:center;width:var(--euclid-space-8);height:var(--euclid-space-8);background:transparent;border:none;border-radius:var(--euclid-radius-lg);color:var(--euclid-text-tertiary);cursor:pointer;transition:all var(--euclid-transition-fast)}.close-button:hover{background:var(--euclid-surface-secondary);color:var(--euclid-text-secondary)}.close-button svg{width:var(--euclid-space-4);height:var(--euclid-space-4)}.modal-content{padding:var(--euclid-space-6);overflow-y:auto;flex:1}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(var(--euclid-space-8))}to{opacity:1;transform:translateY(0)}}@media (max-width: 640px){.modal-overlay{padding:var(--euclid-space-2)}.modal-container{max-width:100%}.modal-header,.modal-content{padding:var(--euclid-space-4)}}@media (max-width: 480px){.modal-container{width:100%;height:100%;max-height:100vh;border-radius:0}.modal-header{padding:var(--euclid-space-3) var(--euclid-space-4)}.modal-title{font-size:var(--euclid-text-base)}.modal-content{padding:var(--euclid-space-3) var(--euclid-space-4)}}.close-button:focus-visible{outline:2px solid var(--euclid-border-focus);outline-offset:2px}@media (prefers-reduced-motion: reduce){.modal-overlay,.modal-container{animation:none}}";

const EuclidModal = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.appState = appStore.state;
        this.previousActiveElement = null;
        this.previousBodyOverflow = '';
        this.previousBodyPaddingRight = '';
        this.scrollBarWidth = 0;
        this.handleOverlayClick = (event) => {
            if (event.target === event.currentTarget) {
                this.closeModal();
            }
        };
    }
    componentWillLoad() {
        console.log('🚀 Modal componentWillLoad');
        console.log('📊 Initial appState:', this.appState);
        console.log('📊 Initial store state:', appStore.state);
        // Calculate scrollbar width for body scroll prevention
        this.scrollBarWidth = this.getScrollBarWidth();
        console.log('📏 Scrollbar width:', this.scrollBarWidth);
        appStore.onChange('walletModalOpen', () => {
            console.log('👛 Wallet modal state changed:', appStore.state.walletModalOpen);
            const wasOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
            const newState = { ...appStore.state };
            const isNowOpen = newState.walletModalOpen || newState.tokenModalOpen;
            this.appState = newState;
            console.log('👛 Wallet modal state transition:', { wasOpen, isNowOpen });
            this.handleModalStateChange(wasOpen, isNowOpen);
        });
        appStore.onChange('tokenModalOpen', () => {
            console.log('🪙 Token modal state changed:', appStore.state.tokenModalOpen);
            const wasOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
            const newState = { ...appStore.state };
            const isNowOpen = newState.walletModalOpen || newState.tokenModalOpen;
            this.appState = newState;
            console.log('🪙 Token modal state transition:', { wasOpen, isNowOpen });
            this.handleModalStateChange(wasOpen, isNowOpen);
        });
    }
    componentDidLoad() {
        console.log('🎬 componentDidLoad called');
        // Handle initial state if modal is already open
        const isOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
        console.log('🎬 componentDidLoad isOpen:', isOpen);
        if (isOpen) {
            console.log('🎬 componentDidLoad calling onModalOpen');
            this.onModalOpen();
        }
    }
    disconnectedCallback() {
        // Cleanup when component is removed
        this.onModalClose();
    }
    handleKeyDown(event) {
        const isOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
        if (!isOpen)
            return;
        if (event.key === 'Escape') {
            this.closeModal();
        }
        // Focus trapping
        if (event.key === 'Tab') {
            this.handleTabKey(event);
        }
    }
    closeModal() {
        appStore.closeWalletModal();
        appStore.closeTokenModal();
    }
    /**
     * Calculate scrollbar width for cross-framework compatibility
     */
    getScrollBarWidth() {
        if (typeof window === 'undefined')
            return 0;
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);
        const inner = document.createElement('div');
        outer.appendChild(inner);
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        document.body.removeChild(outer);
        return scrollbarWidth;
    }
    /**
     * Handle modal state changes (opening/closing)
     */
    handleModalStateChange(wasOpen, isNowOpen) {
        console.log('🔄 handleModalStateChange:', { wasOpen, isNowOpen });
        if (!wasOpen && isNowOpen) {
            console.log('▶️ Opening modal');
            this.onModalOpen();
        }
        else if (wasOpen && !isNowOpen) {
            console.log('⏹️ Closing modal');
            this.onModalClose();
        }
        else {
            console.log('➡️ No state change needed');
        }
    }
    /**
     * SIMPLE AS FUCK body scroll prevention
     */
    onModalOpen() {
        console.log('🔒 onModalOpen called');
        if (typeof window === 'undefined') {
            console.log('❌ No window, returning');
            return;
        }
        try {
            // Store current active element
            this.previousActiveElement = document.activeElement;
            console.log('💾 Stored active element:', this.previousActiveElement);
            // SIMPLE: Just lock the fucking body scroll
            const body = document.body;
            this.previousBodyOverflow = body.style.overflow || '';
            body.style.overflow = 'hidden';
            console.log('🔒 BODY SCROLL LOCKED!', {
                previousOverflow: this.previousBodyOverflow,
                newOverflow: body.style.overflow
            });
            // Focus the modal container
            requestAnimationFrame(() => {
                const modalContainer = this.el.shadowRoot?.querySelector('.modal-container');
                if (modalContainer) {
                    modalContainer.focus();
                    console.log('🎯 Modal focused');
                }
            });
        }
        catch (error) {
            console.error('❌ Error in onModalOpen:', error);
        }
    }
    /**
     * SIMPLE AS FUCK restore body scroll
     */
    onModalClose() {
        console.log('🔓 onModalClose called');
        if (typeof window === 'undefined') {
            console.log('❌ No window, returning');
            return;
        }
        try {
            // SIMPLE: Just restore the fucking body scroll
            const body = document.body;
            body.style.overflow = this.previousBodyOverflow;
            console.log('🔓 BODY SCROLL RESTORED!', {
                restoredOverflow: this.previousBodyOverflow,
                currentOverflow: body.style.overflow
            });
            // Restore focus to previous element
            if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
                this.previousActiveElement.focus();
                console.log('🎯 Focus restored to:', this.previousActiveElement);
            }
            this.previousActiveElement = null;
        }
        catch (error) {
            console.error('❌ Error in onModalClose:', error);
        }
    }
    /**
     * Focus trapping for accessibility
     */
    handleTabKey(event) {
        const shadowRoot = this.el.shadowRoot;
        if (!shadowRoot)
            return;
        const modal = shadowRoot.querySelector('.modal-container');
        if (!modal)
            return;
        // Get all focusable elements within the modal (including shadow DOM elements)
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0)
            return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        // Check if current active element is within our shadow DOM
        const activeElement = shadowRoot.activeElement || document.activeElement;
        if (event.shiftKey) {
            // Shift + Tab (backwards)
            if (activeElement === firstElement || !modal.contains(activeElement)) {
                lastElement?.focus();
                event.preventDefault();
            }
        }
        else {
            // Tab (forwards)
            if (activeElement === lastElement || !modal.contains(activeElement)) {
                firstElement?.focus();
                event.preventDefault();
            }
        }
    }
    render() {
        const isOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
        console.log('🎭 Modal render called:', {
            isOpen,
            walletOpen: this.appState.walletModalOpen,
            tokenOpen: this.appState.tokenModalOpen
        });
        if (!isOpen) {
            console.log('🚫 Modal not open, returning null');
            // Make sure scroll is restored if modal is closed
            if (document.body.style.overflow === 'hidden') {
                console.log('🔓 FORCE restoring scroll on closed modal');
                document.body.style.overflow = this.previousBodyOverflow || '';
            }
            return null;
        }
        // FORCE scroll lock if modal is open (backup safety net)
        if (document.body.style.overflow !== 'hidden') {
            console.log('🔒 FORCE locking scroll in render');
            this.previousBodyOverflow = document.body.style.overflow || '';
            document.body.style.overflow = 'hidden';
        }
        let title = '';
        let content = null;
        if (this.appState.walletModalOpen) {
            title = 'Connect Wallet';
            content = h("euclid-wallet-content", null);
            console.log('👛 Rendering wallet modal');
        }
        else if (this.appState.tokenModalOpen) {
            title = 'Select Token';
            content = h("euclid-token-content", null);
            console.log('🪙 Rendering token modal');
        }
        return (h("div", { class: "modal-overlay", onClick: this.handleOverlayClick, role: "dialog", "aria-modal": "true", "aria-hidden": "false" }, h("div", { class: "modal-container", role: "document", tabindex: "-1", "aria-labelledby": "modal-title", "aria-describedby": "modal-content" }, h("div", { class: "modal-header" }, h("h2", { id: "modal-title", class: "modal-title" }, title), h("button", { class: "close-button", onClick: () => this.closeModal(), type: "button", "aria-label": "Close modal" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" }, h("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" })))), h("div", { id: "modal-content", class: "modal-content" }, content))));
    }
    get el() { return getElement(this); }
};
EuclidModal.style = euclidModalCss;

const euclidPoolsListCss = ":host{display:block;width:100%;font-family:var(--euclid-font-family, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)}.pools-list{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);overflow:hidden;box-shadow:var(--euclid-shadow-sm)}.pools-header{padding:24px;border-bottom:1px solid var(--euclid-border);background:var(--euclid-surface-secondary)}.pools-title{margin:0;font-size:20px;font-weight:600;color:var(--euclid-text-primary)}.pools-content{min-height:400px}.pools-grid{display:flex;flex-direction:column;gap:12px;padding:24px}.empty-state{display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 24px;text-align:center}.empty-state svg{width:48px;height:48px;color:var(--euclid-text-secondary)}.empty-state span{color:var(--euclid-text-secondary);font-size:16px}.clear-filters-btn{padding:12px 24px;background:var(--euclid-interactive-primary);color:white;border:none;border-radius:var(--euclid-radius-lg);font-size:14px;font-weight:500;cursor:pointer;transition:background-color 0.2s ease}.clear-filters-btn:hover{background:var(--euclid-interactive-primary-hover)}.pagination{display:flex;justify-content:center;align-items:center;padding:20px 24px;gap:8px;background:var(--euclid-surface-secondary);border-top:1px solid var(--euclid-border)}.pagination-btn{padding:8px 16px;background:transparent;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s ease}.pagination-btn:hover:not(:disabled){background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.pagination-btn:disabled{opacity:0.5;cursor:not-allowed}.pagination-pages{display:flex;gap:4px;margin:0 16px}.pagination-page{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s ease}.pagination-page:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.pagination-page--active{background:var(--euclid-interactive-primary);border-color:var(--euclid-interactive-primary);color:white}.pagination-page--active:hover{background:var(--euclid-interactive-primary);border-color:var(--euclid-interactive-primary)}@media (max-width: 768px){.pools-header{padding:16px}.pools-grid{padding:16px;gap:8px}.pagination{padding:16px}.pagination-pages{margin:0 8px}}@media (max-width: 640px){.pools-title{font-size:18px}.empty-state{padding:40px 16px}}";

const EuclidPoolsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.poolSelected = createEvent(this, "poolSelected");
        this.addLiquidity = createEvent(this, "addLiquidity");
        this.removeLiquidity = createEvent(this, "removeLiquidity");
        this.stakeTokens = createEvent(this, "stakeTokens");
        this.claimRewards = createEvent(this, "claimRewards");
        this.filtersChanged = createEvent(this, "filtersChanged");
        /**
         * Available pools data (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.pools = [];
        /**
         * Token metadata for logos and display names (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.tokenMetadata = [];
        /**
         * User's positions in pools
         */
        this.positions = [];
        /**
         * Whether the component is in loading state (overrides store loading)
         */
        this.loading = false;
        /**
         * Connected wallet address
         */
        this.walletAddress = '';
        /**
         * Items per page for pagination
         */
        this.itemsPerPage = 10;
        /**
         * Card title
         */
        this.cardTitle = 'Liquidity Pools';
        // Internal state
        this.filteredPools = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.filters = {
            search: '',
            sortBy: 'apr',
            sortOrder: 'desc',
            showMyPools: false,
        };
        // Store data (automatically synced)
        this.storePools = [];
        this.storeTokens = [];
        this.storeLoading = false;
        this.handleFiltersChanged = (event) => {
            this.filters = event.detail;
            this.currentPage = 1;
            this.applyFilters();
        };
        this.handlePageChange = (page) => {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        };
    }
    componentWillLoad() {
        // Connect to market store for automatic data updates
        this.syncWithStore();
        // Listen for store changes
        marketStore.onChange('pools', () => {
            this.syncWithStore();
            this.applyFilters();
        });
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
        });
        // Initialize filters
        this.applyFilters();
    }
    syncWithStore() {
        // Use store data if available, fallback to props
        this.storePools = marketStore.state.pools.length > 0 ? marketStore.state.pools : this.pools;
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : this.tokenMetadata;
        this.storeLoading = marketStore.state.loading;
        // Debug logging
        console.log('🔄 Store sync:', {
            storePools: this.storePools.length,
            storeTokens: this.storeTokens.length,
            storeLoading: this.storeLoading,
            marketStorePools: marketStore.state.pools.length,
            marketStoreTokens: marketStore.state.tokens.length,
            marketStoreLoading: marketStore.state.loading
        });
    }
    watchPoolsChange() {
        this.applyFilters();
    }
    watchPositionsChange() {
        this.applyFilters();
    }
    applyFilters() {
        // Use store data first, fallback to props for backward compatibility
        const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
        let filtered = [...activePools];
        // Apply search filter
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(pool => {
                const token1Meta = this.getTokenMetadata(pool.token_1);
                const token2Meta = this.getTokenMetadata(pool.token_2);
                const token1Name = token1Meta?.displayName || pool.token_1;
                const token2Name = token2Meta?.displayName || pool.token_2;
                return pool.token_1.toLowerCase().includes(searchLower) ||
                    pool.token_2.toLowerCase().includes(searchLower) ||
                    token1Name.toLowerCase().includes(searchLower) ||
                    token2Name.toLowerCase().includes(searchLower) ||
                    pool.pool_id.toLowerCase().includes(searchLower);
            });
        }
        // Apply my pools filter
        if (this.filters.showMyPools && this.walletAddress) {
            const myPoolIds = this.positions.map(pos => pos.poolId);
            filtered = filtered.filter(pool => myPoolIds.includes(pool.pool_id));
        }
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (this.filters.sortBy) {
                case 'apr':
                    aValue = parseFloat((a.apr || '0%').replace('%', ''));
                    bValue = parseFloat((b.apr || '0%').replace('%', ''));
                    break;
                case 'tvl':
                    aValue = parseFloat(a.total_liquidity || '0');
                    bValue = parseFloat(b.total_liquidity || '0');
                    break;
                case 'volume':
                    aValue = parseFloat(a.volume_24h || '0');
                    bValue = parseFloat(b.volume_24h || '0');
                    break;
                case 'fees':
                    aValue = parseFloat(a.fees_24h || '0');
                    bValue = parseFloat(b.fees_24h || '0');
                    break;
                case 'myLiquidity': {
                    const aPosition = this.positions.find(pos => pos.poolId === a.pool_id);
                    const bPosition = this.positions.find(pos => pos.poolId === b.pool_id);
                    aValue = aPosition ? aPosition.value : 0;
                    bValue = bPosition ? bPosition.value : 0;
                    break;
                }
                default:
                    aValue = parseFloat((a.apr || '0%').replace('%', ''));
                    bValue = parseFloat((b.apr || '0%').replace('%', ''));
            }
            if (this.filters.sortOrder === 'asc') {
                return aValue - bValue;
            }
            else {
                return bValue - aValue;
            }
        });
        // Update state only if changed
        const newFilteredLength = filtered.length;
        const currentFilteredLength = this.filteredPools.length;
        const hasChanged = newFilteredLength !== currentFilteredLength ||
            !filtered.every((pool, index) => this.filteredPools[index]?.pool_id === pool.pool_id);
        if (hasChanged) {
            this.filteredPools = filtered;
        }
        const newTotalPages = Math.ceil(filtered.length / this.itemsPerPage);
        if (this.totalPages !== newTotalPages) {
            this.totalPages = newTotalPages;
        }
        // Reset to first page if current page is out of bounds
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }
        this.filtersChanged.emit(this.filters);
    }
    getTokenMetadata(tokenId) {
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
        return activeTokens.find(token => token.tokenId === tokenId) || null;
    }
    getUserPosition(poolId) {
        return this.positions.find(pos => pos.poolId === poolId) || null;
    }
    getTokensWithPools() {
        const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
        // Get unique token IDs that appear in pools
        const tokenIdsInPools = new Set();
        activePools.forEach(pool => {
            tokenIdsInPools.add(pool.token_1);
            tokenIdsInPools.add(pool.token_2);
        });
        // Return only tokens that have pools, with their metadata
        return Array.from(tokenIdsInPools)
            .map(tokenId => {
            const tokenMeta = activeTokens.find(t => t.tokenId === tokenId);
            return {
                tokenId,
                displayName: tokenMeta?.displayName || tokenId.toUpperCase()
            };
        })
            .sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
    getPaginatedPools() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredPools.slice(startIndex, endIndex);
    }
    render() {
        const activePools = this.storePools.length > 0 ? this.storePools : this.pools;
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokenMetadata;
        const isLoading = (this.storeLoading || this.loading) && activePools.length === 0;
        const paginatedPools = this.getPaginatedPools();
        const totalTvl = activePools.reduce((sum, pool) => sum + parseFloat(pool.total_liquidity || '0'), 0);
        // Debug logging
        console.log('🎨 Render state:', {
            activePools: activePools.length,
            activeTokens: activeTokens.length,
            filteredPools: this.filteredPools.length,
            paginatedPools: paginatedPools.length,
            isLoading,
            storeLoading: this.storeLoading,
            loading: this.loading
        });
        return (h("div", { key: 'ee8cd3221635ae068a8d7707c128ccc51ad98bdf', class: "pools-list" }, h("div", { key: '8c5a36dff34b3662a569719e700229587ec4cd08', class: "pools-header" }, h("h3", { key: '49ca59d21d81ff5b17209ce984fc080002ec64e0', class: "pools-title" }, this.cardTitle)), h("pools-filters", { key: '9d006a402943b6c13ee75b1f4207b2799a5baed2', filters: this.filters, walletAddress: this.walletAddress, onFiltersChanged: this.handleFiltersChanged }), h("pools-stats", { key: 'b26ac8b9520425a46cd58748cf227043154ae434', totalPools: activePools.length, filteredPools: this.filteredPools.length, totalTvl: totalTvl, userPositions: this.positions.length, walletAddress: this.walletAddress }), h("div", { key: '9ec301d9c1053070d22f5a69981ee9dd80da3a98', class: "pools-content" }, isLoading ? (h("pools-loading", { count: 6 })) : paginatedPools.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 64 64", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z" })), h("span", null, "No pools found matching your criteria"), h("button", { class: "clear-filters-btn", onClick: () => {
                this.filters = {
                    search: '',
                    sortBy: 'apr',
                    sortOrder: 'desc',
                    showMyPools: false,
                };
                this.currentPage = 1;
                this.applyFilters();
            }, type: "button" }, "Clear Filters"))) : (h("div", { class: "pools-grid" }, paginatedPools.map(pool => (h("pool-item", { key: pool.pool_id, pool: pool, tokens: activeTokens, position: this.getUserPosition(pool.pool_id), walletAddress: this.walletAddress, onAddLiquidity: (event) => this.addLiquidity.emit(event.detail), onRemoveLiquidity: (event) => this.removeLiquidity.emit(event.detail), onStakeTokens: (event) => this.stakeTokens.emit(event.detail), onClaimRewards: (event) => this.claimRewards.emit(event.detail) })))))), this.totalPages > 1 && (h("div", { key: '00ef8872b32c0a7026641101bd5c141dad963efa', class: "pagination" }, h("button", { key: '515f5f02ee25ad9002bab9480fe3094fbbf2a9bb', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage - 1), disabled: this.currentPage === 1, type: "button" }, "Previous"), h("div", { key: 'a02e9fd63fa1ecbc01ffd6a89f1760e708ecb1a5', class: "pagination-pages" }, Array.from({ length: this.totalPages }, (_, i) => i + 1).map(page => (h("button", { key: page, class: {
                'pagination-page': true,
                'pagination-page--active': page === this.currentPage,
            }, onClick: () => this.handlePageChange(page), type: "button" }, page)))), h("button", { key: 'a1a783aa40ef3a16416a35e804aa1d25608c82a5', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage + 1), disabled: this.currentPage === this.totalPages, type: "button" }, "Next")))));
    }
    static get watchers() { return {
        "pools": ["watchPoolsChange"],
        "positions": ["watchPositionsChange"]
    }; }
};
EuclidPoolsList.style = euclidPoolsListCss;

const euclidPortfolioOverviewCss = ":host{display:block;width:100%;font-family:var(--euclid-font-family, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)}.portfolio-overview{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);overflow:hidden;box-shadow:var(--euclid-shadow-sm)}.portfolio-overview.loading,.portfolio-overview.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;text-align:center;color:var(--euclid-text-secondary)}.loading-spinner{display:inline-block;width:32px;height:32px;border:3px solid var(--euclid-border);border-top-color:var(--euclid-interactive-primary);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px}@keyframes spin{to{transform:rotate(360deg)}}.empty-state{display:flex;flex-direction:column;align-items:center;gap:16px}.empty-state svg{width:64px;height:64px;color:var(--euclid-text-muted, #9ca3af)}.empty-state span{font-size:18px;color:var(--euclid-text-secondary)}.portfolio-header{display:flex;justify-content:space-between;align-items:center;padding:24px;border-bottom:1px solid var(--euclid-border);background:var(--euclid-surface-secondary)}.portfolio-title{margin:0;font-size:24px;font-weight:600;color:var(--euclid-text-primary)}.wallet-info{display:flex;align-items:center;gap:8px}.wallet-address{padding:6px 12px;background:var(--euclid-bg-tertiary, #f1f5f9);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace;font-size:14px;color:var(--euclid-text-secondary)}.portfolio-tabs{display:flex;border-bottom:1px solid var(--euclid-border);background:var(--euclid-surface-secondary);overflow-x:auto}.tab-btn{padding:16px 24px;background:transparent;border:none;border-bottom:2px solid transparent;color:var(--euclid-text-secondary);font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s ease;white-space:nowrap}.tab-btn:hover{background:var(--euclid-surface-secondary);color:var(--euclid-text-primary)}.tab-btn--active{color:var(--euclid-interactive-primary);border-bottom-color:var(--euclid-interactive-primary);background:var(--euclid-interactive-primary)}.portfolio-content{padding:24px}.overview-tab{display:flex;flex-direction:column;gap:32px}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px}.stat-card{padding:20px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);display:flex;flex-direction:column;gap:8px}.stat-label{font-size:14px;color:var(--euclid-text-muted, #6b7280);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}.stat-value{font-size:24px;font-weight:700;color:var(--euclid-text-primary);line-height:1.2}.stat-value--positive{color:var(--euclid-success-color, #10b981)}.stat-value--negative{color:var(--euclid-error-color, #ef4444)}.stat-change{font-size:12px;font-weight:500}.stat-change--positive{color:var(--euclid-success-color, #10b981)}.stat-change--negative{color:var(--euclid-error-color, #ef4444)}.chart-section{display:flex;flex-direction:column;gap:16px}.chart-header{display:flex;justify-content:space-between;align-items:center}.chart-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.time-period-selector{display:flex;gap:4px;background:var(--euclid-bg-tertiary, #f1f5f9);border-radius:var(--euclid-radius-lg);padding:4px}.period-btn{padding:6px 12px;background:transparent;border:none;border-radius:var(--euclid-border-radius-sm, 6px);color:var(--euclid-text-secondary);font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s ease}.period-btn:hover{background:var(--euclid-surface-secondary);color:var(--euclid-text-primary)}.period-btn--active{background:var(--euclid-interactive-primary);color:white}.chart-container{height:200px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);padding:20px;display:flex;align-items:center;justify-content:center}.allocation-section{display:flex;flex-direction:column;gap:16px}.allocation-section h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.allocation-grid{display:flex;flex-direction:column;gap:12px}.allocation-item{display:flex;align-items:center;justify-content:space-between;padding:16px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);transition:background-color 0.2s ease}.allocation-item:hover{background:var(--euclid-surface-secondary)}.token-info{display:flex;align-items:center;gap:12px;flex:1}.token-logo{width:32px;height:32px;border-radius:50%}.token-details{display:flex;flex-direction:column;gap:2px}.token-symbol{font-weight:600;color:var(--euclid-text-primary);font-size:14px}.token-balance{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.token-value{display:flex;flex-direction:column;align-items:flex-end;gap:2px;margin-right:20px}.value-primary{font-weight:600;color:var(--euclid-text-primary);font-size:14px}.allocation-percent{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.price-change{font-size:12px;font-weight:500;min-width:60px;text-align:right}.price-change--positive{color:var(--euclid-success-color, #10b981)}.price-change--negative{color:var(--euclid-error-color, #ef4444)}.positions-tab{display:flex;flex-direction:column;gap:20px}.positions-header{display:flex;justify-content:space-between;align-items:center}.positions-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.sort-controls{display:flex;gap:8px}.sort-btn{display:flex;align-items:center;gap:4px;padding:8px 12px;background:transparent;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s ease}.sort-btn:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.sort-btn--active{background:var(--euclid-interactive-primary);border-color:var(--euclid-interactive-primary);color:white}.sort-arrow{width:12px;height:12px;transition:transform 0.2s ease}.sort-arrow--desc{transform:rotate(180deg)}.positions-list{display:flex;flex-direction:column;gap:16px}.position-card{padding:20px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);cursor:pointer;transition:all 0.2s ease}.position-card:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover);box-shadow:var(--euclid-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.07))}.position-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.token-pair{display:flex;align-items:center;gap:8px}.token-logo--overlap{margin-left:-8px}.pair-name{font-weight:600;color:var(--euclid-text-primary);font-size:16px}.position-value{font-size:18px;font-weight:700;color:var(--euclid-text-primary)}.position-details{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-bottom:16px}.detail-item{display:flex;flex-direction:column;gap:4px}.detail-label{font-size:12px;color:var(--euclid-text-muted, #6b7280);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}.detail-value{font-size:14px;font-weight:600;color:var(--euclid-text-primary)}.detail-value--positive{color:var(--euclid-success-color, #10b981)}.detail-value--negative{color:var(--euclid-error-color, #ef4444)}.apy-value{color:var(--euclid-success-color, #10b981)}.rewards-section{padding:12px 0;border-top:1px solid var(--euclid-border);border-bottom:1px solid var(--euclid-border);margin-bottom:16px}.reward-item{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--euclid-text-secondary);margin-bottom:8px}.reward-item:last-child{margin-bottom:0}.position-actions{display:flex;gap:8px;justify-content:flex-end}.staking-tab{display:flex;flex-direction:column;gap:20px}.staking-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.staking-list{display:flex;flex-direction:column;gap:16px}.staking-card{padding:20px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl)}.staking-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.token-symbol{font-weight:600;color:var(--euclid-text-primary);font-size:16px}.token-name{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.staking-value{font-size:18px;font-weight:700;color:var(--euclid-text-primary)}.staking-details{display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:16px;margin-bottom:20px}.staking-actions{display:flex;gap:8px;flex-wrap:wrap}.transactions-tab{display:flex;flex-direction:column;gap:20px}.transactions-header h3{margin:0;font-size:18px;font-weight:600;color:var(--euclid-text-primary)}.transactions-list{display:flex;flex-direction:column;gap:12px}.transaction-card{padding:16px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);cursor:pointer;transition:all 0.2s ease}.transaction-card:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.transaction-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.transaction-type{display:flex;align-items:center;gap:8px}.type-label{font-weight:500;color:var(--euclid-text-primary);font-size:14px}.status-badge{padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}.status-badge--pending{background:var(--euclid-warning-color-10, rgba(245, 158, 11, 0.1));color:var(--euclid-warning-color, #f59e0b)}.status-badge--confirmed{background:var(--euclid-success-color-10, rgba(16, 185, 129, 0.1));color:var(--euclid-success-color, #10b981)}.status-badge--failed{background:var(--euclid-error-color-10, rgba(239, 68, 68, 0.1));color:var(--euclid-error-color, #ef4444)}.transaction-value{font-weight:600;color:var(--euclid-text-primary);font-size:14px}.transaction-details{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}.transaction-time{font-size:12px;color:var(--euclid-text-muted, #6b7280)}.token-amounts{font-size:12px;color:var(--euclid-text-secondary);font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace}.transaction-hash{font-family:'Monaco', 'Menlo', 'Ubuntu Mono', monospace;font-size:11px;color:var(--euclid-text-muted, #6b7280);padding:4px 8px;background:var(--euclid-bg-tertiary, #f1f5f9);border-radius:var(--euclid-border-radius-sm, 6px);display:inline-block}@media (max-width: 1024px){.stats-grid{grid-template-columns:repeat(2, 1fr)}.position-details{grid-template-columns:repeat(2, 1fr)}.staking-details{grid-template-columns:1fr}}@media (max-width: 768px){.portfolio-header{padding:16px;flex-direction:column;align-items:flex-start;gap:12px}.portfolio-content{padding:16px}.stats-grid{grid-template-columns:1fr;gap:12px}.chart-header{flex-direction:column;align-items:flex-start;gap:12px}.time-period-selector{align-self:stretch;justify-content:center}.positions-header{flex-direction:column;align-items:flex-start;gap:12px}.sort-controls{align-self:stretch;justify-content:center}.position-details{grid-template-columns:1fr;gap:12px}.position-actions,.staking-actions{flex-direction:column}.allocation-item{padding:12px}.token-value{margin-right:8px}}@media (max-width: 640px){.portfolio-title{font-size:20px}.tab-btn{padding:12px 16px;font-size:12px}.stat-card{padding:16px}.stat-value{font-size:20px}.position-card,.staking-card,.transaction-card{padding:16px}.position-header{flex-direction:column;align-items:flex-start;gap:8px}.token-pair{gap:6px}.pair-name{font-size:14px}.position-value,.staking-value{font-size:16px}}";

const EuclidPortfolioOverview = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.positionSelected = createEvent(this, "positionSelected");
        this.managePosition = createEvent(this, "managePosition");
        this.stakeMore = createEvent(this, "stakeMore");
        this.unstake = createEvent(this, "unstake");
        this.claimRewards = createEvent(this, "claimRewards");
        this.viewTransaction = createEvent(this, "viewTransaction");
        this.timePeriodChanged = createEvent(this, "timePeriodChanged");
        /**
         * User's token balances
         */
        this.tokenBalances = [];
        /**
         * User's liquidity pool positions
         */
        this.poolPositions = [];
        /**
         * User's staking positions
         */
        this.stakingPositions = [];
        /**
         * Recent transactions
         */
        this.transactions = [];
        /**
         * Portfolio statistics
         */
        this.portfolioStats = null;
        /**
         * Chart data for portfolio value over time
         */
        this.chartData = [];
        /**
         * Connected wallet address
         */
        this.walletAddress = '';
        /**
         * Whether the component is in loading state
         */
        this.loading = false;
        /**
         * Card title
         */
        this.cardTitle = 'Portfolio Overview';
        /**
         * Whether to show detailed analytics
         */
        this.showAnalytics = true;
        /**
         * Time period for charts and stats
         */
        this.timePeriod = '1W';
        // Internal state
        this.activeTab = 'overview';
        this.selectedPosition = null;
        this.showChartTooltip = false;
        this.chartTooltipData = null;
        this.sortBy = 'value';
        this.sortOrder = 'desc';
        this.handleTabChange = (tab) => {
            this.activeTab = tab;
        };
        this.handleTimePeriodChange = (period) => {
            this.timePeriod = period;
            this.timePeriodChanged.emit(period);
        };
        this.handleSortChange = (sortBy) => {
            if (this.sortBy === sortBy) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            }
            else {
                this.sortBy = sortBy;
                this.sortOrder = 'desc';
            }
        };
        this.handlePositionClick = (position) => {
            this.selectedPosition = position;
            this.positionSelected.emit(position);
        };
        this.handleManagePosition = (position) => {
            this.managePosition.emit(position);
        };
        this.handleClaimRewards = (position) => {
            this.claimRewards.emit(position);
        };
        this.handleStakeMore = (position) => {
            this.stakeMore.emit(position);
        };
        this.handleUnstake = (position) => {
            this.unstake.emit(position);
        };
        this.handleViewTransaction = (transaction) => {
            this.viewTransaction.emit(transaction);
        };
    }
    componentDidLoad() {
        this.setupChart();
    }
    handleResize() {
        this.setupChart();
    }
    setupChart() {
        // Simple chart setup - in a real implementation, you'd use a charting library
        if (this.chartData.length > 0 && this.showAnalytics) {
            this.renderChart();
        }
    }
    renderChart() {
        // This is a simplified chart implementation
        // In practice, you'd integrate with libraries like Chart.js, D3, or similar
        const chartContainer = this.element.shadowRoot?.querySelector('.chart-container');
        if (!chartContainer)
            return;
        // Clear previous chart
        chartContainer.innerHTML = '';
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '200');
        svg.setAttribute('viewBox', '0 0 800 200');
        const data = this.chartData;
        if (data.length === 0)
            return;
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;
        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = data
            .map((point, index) => {
            const x = (index / (data.length - 1)) * 800;
            const y = 180 - ((point.value - minValue) / valueRange) * 160;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
            .join(' ');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', 'var(--euclid-primary-color, #3b82f6)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        chartContainer.appendChild(svg);
    }
    formatNumber(value, decimals = 2) {
        if (value >= 1e9) {
            return `${(value / 1e9).toFixed(decimals)}B`;
        }
        else if (value >= 1e6) {
            return `${(value / 1e6).toFixed(decimals)}M`;
        }
        else if (value >= 1e3) {
            return `${(value / 1e3).toFixed(decimals)}K`;
        }
        return value.toFixed(decimals);
    }
    formatPercent(value, decimals = 2) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
    }
    getSortedPositions() {
        const sorted = [...this.poolPositions].sort((a, b) => {
            let aValue, bValue;
            switch (this.sortBy) {
                case 'value':
                    aValue = a.totalValue;
                    bValue = b.totalValue;
                    break;
                case 'pnl':
                    aValue = a.impermanentLoss;
                    bValue = b.impermanentLoss;
                    break;
                case 'apy':
                    aValue = a.apy;
                    bValue = b.apy;
                    break;
                case 'allocation':
                    aValue = this.portfolioStats ? (a.totalValue / this.portfolioStats.totalValue) * 100 : 0;
                    bValue = this.portfolioStats ? (b.totalValue / this.portfolioStats.totalValue) * 100 : 0;
                    break;
                default:
                    aValue = a.totalValue;
                    bValue = b.totalValue;
            }
            return this.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
        return sorted;
    }
    renderOverviewTab() {
        const stats = this.portfolioStats;
        if (!stats)
            return null;
        return (h("div", { class: "overview-tab" }, h("div", { class: "stats-grid" }, h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total Value"), h("div", { class: "stat-value" }, "$", this.formatNumber(stats.totalValue)), h("div", { class: {
                'stat-change': true,
                'stat-change--positive': stats.dayChange >= 0,
                'stat-change--negative': stats.dayChange < 0,
            } }, this.formatPercent(stats.dayChangePercent), " (24h)")), h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total P&L"), h("div", { class: {
                'stat-value': true,
                'stat-value--positive': stats.totalPnL >= 0,
                'stat-value--negative': stats.totalPnL < 0,
            } }, "$", this.formatNumber(stats.totalPnL)), h("div", { class: {
                'stat-change': true,
                'stat-change--positive': stats.totalPnLPercent >= 0,
                'stat-change--negative': stats.totalPnLPercent < 0,
            } }, this.formatPercent(stats.totalPnLPercent))), h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total Rewards"), h("div", { class: "stat-value" }, "$", this.formatNumber(stats.totalRewards)), h("div", { class: "stat-change" }, stats.activePositions, " active positions")), h("div", { class: "stat-card" }, h("div", { class: "stat-label" }, "Total Staked"), h("div", { class: "stat-value" }, "$", this.formatNumber(stats.totalStaked)), h("div", { class: "stat-change" }, this.stakingPositions.length, " staking positions"))), this.showAnalytics && (h("div", { class: "chart-section" }, h("div", { class: "chart-header" }, h("h3", null, "Portfolio Value"), h("div", { class: "time-period-selector" }, ['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(period => (h("button", { key: period, class: {
                'period-btn': true,
                'period-btn--active': period === this.timePeriod,
            }, onClick: () => this.handleTimePeriodChange(period), type: "button" }, period))))), h("div", { class: "chart-container" }))), h("div", { class: "allocation-section" }, h("h3", null, "Asset Allocation"), h("div", { class: "allocation-grid" }, this.tokenBalances
            .filter(token => token.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map(token => (h("div", { key: token.symbol, class: "allocation-item" }, h("div", { class: "token-info" }, token.logoUrl && (h("img", { src: token.logoUrl, alt: token.symbol, class: "token-logo" })), h("div", { class: "token-details" }, h("div", { class: "token-symbol" }, token.symbol), h("div", { class: "token-balance" }, parseFloat(token.balance).toFixed(4)))), h("div", { class: "token-value" }, h("div", { class: "value-primary" }, "$", this.formatNumber(token.value)), h("div", { class: "allocation-percent" }, token.allocation.toFixed(1), "%")), h("div", { class: {
                'price-change': true,
                'price-change--positive': token.priceChange24h >= 0,
                'price-change--negative': token.priceChange24h < 0,
            } }, this.formatPercent(token.priceChange24h)))))))));
    }
    renderPositionsTab() {
        const sortedPositions = this.getSortedPositions();
        return (h("div", { class: "positions-tab" }, h("div", { class: "positions-header" }, h("h3", null, "Liquidity Positions"), h("div", { class: "sort-controls" }, h("button", { class: {
                'sort-btn': true,
                'sort-btn--active': this.sortBy === 'value',
            }, onClick: () => this.handleSortChange('value'), type: "button" }, "Value", this.sortBy === 'value' && (h("svg", { class: {
                'sort-arrow': true,
                'sort-arrow--desc': this.sortOrder === 'desc',
            }, viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" })))), h("button", { class: {
                'sort-btn': true,
                'sort-btn--active': this.sortBy === 'apy',
            }, onClick: () => this.handleSortChange('apy'), type: "button" }, "APY"))), h("div", { class: "positions-list" }, sortedPositions.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "No liquidity positions found"))) : (sortedPositions.map(position => (h("div", { key: position.poolId, class: "position-card", onClick: () => this.handlePositionClick(position) }, h("div", { class: "position-header" }, h("div", { class: "token-pair" }, position.tokenA.logoUrl && (h("img", { src: position.tokenA.logoUrl, alt: position.tokenA.symbol, class: "token-logo" })), position.tokenB.logoUrl && (h("img", { src: position.tokenB.logoUrl, alt: position.tokenB.symbol, class: "token-logo token-logo--overlap" })), h("span", { class: "pair-name" }, position.tokenA.symbol, "/", position.tokenB.symbol)), h("div", { class: "position-value" }, "$", this.formatNumber(position.totalValue))), h("div", { class: "position-details" }, h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "APY"), h("span", { class: "detail-value apy-value" }, position.apy.toFixed(2), "%")), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Share"), h("span", { class: "detail-value" }, position.shareOfPool.toFixed(4), "%")), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "IL"), h("span", { class: {
                'detail-value': true,
                'detail-value--positive': position.impermanentLoss >= 0,
                'detail-value--negative': position.impermanentLoss < 0,
            } }, this.formatPercent(position.impermanentLoss)))), (position.unclaimedRewards || position.stakingRewards) && (h("div", { class: "rewards-section" }, position.unclaimedRewards && position.unclaimedRewards > 0 && (h("div", { class: "reward-item" }, h("span", null, "Unclaimed: $", this.formatNumber(position.unclaimedRewards)), h("euclid-button", { variant: "ghost", size: "sm", onClick: (e) => {
                e.stopPropagation();
                this.handleClaimRewards(position);
            } }, "Claim"))), position.stakingRewards && position.stakingRewards > 0 && (h("div", { class: "reward-item" }, h("span", null, "Staking: $", this.formatNumber(position.stakingRewards)))))), h("div", { class: "position-actions" }, h("euclid-button", { variant: "secondary", size: "sm", onClick: (e) => {
                e.stopPropagation();
                this.handleManagePosition(position);
            } }, "Manage")))))))));
    }
    renderStakingTab() {
        return (h("div", { class: "staking-tab" }, h("div", { class: "staking-header" }, h("h3", null, "Staking Positions")), h("div", { class: "staking-list" }, this.stakingPositions.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "No staking positions found"))) : (this.stakingPositions.map(position => (h("div", { key: position.id, class: "staking-card" }, h("div", { class: "staking-header" }, h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, position.tokenSymbol), h("span", { class: "token-name" }, position.tokenName)), h("div", { class: "staking-value" }, "$", this.formatNumber(position.stakedValue))), h("div", { class: "staking-details" }, h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Staked Amount"), h("span", { class: "detail-value" }, parseFloat(position.stakedAmount).toFixed(4), " ", position.tokenSymbol)), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "APR"), h("span", { class: "detail-value apy-value" }, position.apr.toFixed(2), "%")), h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Rewards"), h("span", { class: "detail-value" }, "$", this.formatNumber(position.rewards))), position.unlockDate && (h("div", { class: "detail-item" }, h("span", { class: "detail-label" }, "Unlock Date"), h("span", { class: "detail-value" }, position.unlockDate.toLocaleDateString())))), h("div", { class: "staking-actions" }, h("euclid-button", { variant: "primary", size: "sm", onClick: () => this.handleStakeMore(position) }, "Stake More"), h("euclid-button", { variant: "secondary", size: "sm", onClick: () => this.handleUnstake(position), disabled: position.unlockDate ? position.unlockDate > new Date() : false }, "Unstake"), position.rewards > 0 && (h("euclid-button", { variant: "ghost", size: "sm", onClick: () => this.handleClaimRewards(position) }, "Claim"))))))))));
    }
    renderTransactionsTab() {
        const recentTransactions = this.transactions.slice(0, 20);
        return (h("div", { class: "transactions-tab" }, h("div", { class: "transactions-header" }, h("h3", null, "Recent Transactions")), h("div", { class: "transactions-list" }, recentTransactions.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "No transactions found"))) : (recentTransactions.map(transaction => (h("div", { key: transaction.id, class: "transaction-card", onClick: () => this.handleViewTransaction(transaction) }, h("div", { class: "transaction-header" }, h("div", { class: "transaction-type" }, h("span", { class: "type-label" }, transaction.type.replace('_', ' ').toUpperCase()), h("span", { class: {
                'status-badge': true,
                [`status-badge--${transaction.status}`]: true,
            } }, transaction.status)), h("div", { class: "transaction-value" }, "$", this.formatNumber(transaction.value))), h("div", { class: "transaction-details" }, h("div", { class: "transaction-time" }, transaction.timestamp.toLocaleDateString(), " ", transaction.timestamp.toLocaleTimeString()), transaction.tokenA && (h("div", { class: "token-amounts" }, h("span", null, parseFloat(transaction.amountA || '0').toFixed(4), " ", transaction.tokenA.symbol), transaction.tokenB && transaction.amountB && (h("span", null, "\u2192 ", parseFloat(transaction.amountB).toFixed(4), " ", transaction.tokenB.symbol))))), h("div", { class: "transaction-hash" }, transaction.hash.slice(0, 10), "...", transaction.hash.slice(-8)))))))));
    }
    render() {
        if (this.loading) {
            return (h("div", { class: "portfolio-overview loading" }, h("div", { class: "loading-spinner" }), h("span", null, "Loading portfolio data...")));
        }
        if (!this.walletAddress) {
            return (h("div", { class: "portfolio-overview empty" }, h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5C12.8,10.5 13.5,9.8 13.5,9C13.5,8.2 12.8,7.5 12,7.5C11.2,7.5 10.5,8.2 10.5,9C10.5,9.8 11.2,10.5 12,10.5Z" })), h("span", null, "Connect your wallet to view portfolio"))));
        }
        return (h("div", { class: "portfolio-overview" }, h("div", { class: "portfolio-header" }, h("h2", { class: "portfolio-title" }, this.cardTitle), h("div", { class: "wallet-info" }, h("span", { class: "wallet-address" }, this.walletAddress.slice(0, 6), "...", this.walletAddress.slice(-4)))), h("div", { class: "portfolio-tabs" }, h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'overview',
            }, onClick: () => this.handleTabChange('overview'), type: "button" }, "Overview"), h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'positions',
            }, onClick: () => this.handleTabChange('positions'), type: "button" }, "Positions (", this.poolPositions.length, ")"), h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'staking',
            }, onClick: () => this.handleTabChange('staking'), type: "button" }, "Staking (", this.stakingPositions.length, ")"), h("button", { class: {
                'tab-btn': true,
                'tab-btn--active': this.activeTab === 'transactions',
            }, onClick: () => this.handleTabChange('transactions'), type: "button" }, "Transactions")), h("div", { class: "portfolio-content" }, this.activeTab === 'overview' && this.renderOverviewTab(), this.activeTab === 'positions' && this.renderPositionsTab(), this.activeTab === 'staking' && this.renderStakingTab(), this.activeTab === 'transactions' && this.renderTransactionsTab())));
    }
    get element() { return getElement(this); }
};
EuclidPortfolioOverview.style = euclidPortfolioOverviewCss;

const euclidSwapCardCss = ":host{display:contents}.swap-card{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-2xl);padding:var(--euclid-spacing-6);max-width:420px;width:100%;box-shadow:var(--euclid-shadow-xl);display:flex;flex-direction:column;gap:var(--euclid-spacing-4)}.swap-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--euclid-spacing-2)}.swap-title{font-size:var(--euclid-text-size-xl);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary);margin:0}.settings-button{display:flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.settings-button:hover{background:var(--euclid-surface-tertiary);color:var(--euclid-text-primary);border-color:var(--euclid-border-hover)}.settings-button:focus{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.settings-button svg{width:1.25rem;height:1.25rem}.settings-panel{background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);padding:var(--euclid-spacing-4);margin-bottom:var(--euclid-spacing-2)}.setting-item{margin-bottom:var(--euclid-spacing-4)}.setting-item:last-child{margin-bottom:0}.setting-label{display:block;font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-secondary);margin-bottom:var(--euclid-spacing-2)}.slippage-buttons{display:flex;gap:var(--euclid-spacing-2);align-items:center}.slippage-btn{padding:var(--euclid-spacing-2) var(--euclid-spacing-3);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-sm);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.slippage-btn:hover{border-color:var(--euclid-interactive-primary);color:var(--euclid-interactive-primary)}.slippage-btn--active{background:var(--euclid-interactive-primary);color:var(--euclid-white);border-color:var(--euclid-interactive-primary)}.slippage-input{padding:var(--euclid-spacing-2) var(--euclid-spacing-3);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-primary);font-size:var(--euclid-text-size-sm);width:80px;text-align:center}.slippage-input:focus{outline:none;border-color:var(--euclid-border-focus);box-shadow:0 0 0 2px rgba(37, 99, 235, 0.25)}.deadline-input{display:flex;align-items:center;gap:var(--euclid-spacing-2)}.deadline-input input{padding:var(--euclid-spacing-2) var(--euclid-spacing-3);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-primary);font-size:var(--euclid-text-size-sm);width:100px}.deadline-input input:focus{outline:none;border-color:var(--euclid-border-focus);box-shadow:0 0 0 2px rgba(37, 99, 235, 0.25)}.deadline-input span{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.token-input-section{position:relative}.input-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--euclid-spacing-2)}.input-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.balance-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-muted);cursor:pointer;transition:color var(--euclid-transition-duration-fast)}.balance-label:hover{color:var(--euclid-text-secondary)}.token-selector{cursor:pointer}.token-selector:hover{opacity:0.8}.selected-token{display:flex;align-items:center;gap:var(--euclid-spacing-3);padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface)}.select-token-button{display:flex;align-items:center;justify-content:center;gap:var(--euclid-spacing-2);padding:var(--euclid-spacing-4) var(--euclid-spacing-6);border:2px dashed var(--euclid-border);border-radius:var(--euclid-radius-xl);background:var(--euclid-surface-secondary);color:var(--euclid-text-secondary);font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-medium);cursor:pointer;transition:all var(--euclid-transition-duration-fast)}.select-token-button:hover{border-color:var(--euclid-border-hover)}.token-logo{width:2rem;height:2rem;border-radius:50%;background:var(--euclid-surface-secondary)}.token-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1);flex:1}.token-symbol{font-size:var(--euclid-text-size-base);font-weight:var(--euclid-font-weight-semibold);color:var(--euclid-text-primary)}.token-name{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.dropdown-arrow{color:var(--euclid-text-muted);transition:transform var(--euclid-transition-duration-fast)}.token-selector:hover .dropdown-arrow{color:var(--euclid-text-secondary)}.swap-direction{display:flex;justify-content:center;margin:var(--euclid-spacing-2) 0;position:relative}.swap-button{display:flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;background:var(--euclid-surface);border:2px solid var(--euclid-border);border-radius:50%;color:var(--euclid-text-secondary);cursor:pointer;transition:all var(--euclid-transition-duration-fast);z-index:10}.swap-button:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover);color:var(--euclid-text-primary);transform:rotate(180deg)}.swap-button:focus{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.swap-button svg{width:1.25rem;height:1.25rem}.quote-info{padding:var(--euclid-spacing-4);background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-xl)}.quote-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--euclid-spacing-2)}.quote-row:last-child{margin-bottom:0}.quote-label{font-size:var(--euclid-text-size-sm);color:var(--euclid-text-secondary)}.quote-value{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.quote-value--warning{color:var(--euclid-warning-600)}.quote-value--danger{color:var(--euclid-danger-600)}@media (max-width: 480px){.swap-card{padding:var(--euclid-spacing-4);gap:var(--euclid-spacing-3)}.swap-header{margin-bottom:var(--euclid-spacing-2)}.settings-panel{padding:var(--euclid-spacing-3)}.slippage-buttons{flex-wrap:wrap}.deadline-input{flex-direction:column;align-items:flex-start;gap:var(--euclid-spacing-1)}.deadline-input input{width:100%}.selected-token{flex-direction:column;align-items:flex-start;gap:var(--euclid-spacing-2)}.token-info{width:100%}.quote-info{padding:var(--euclid-spacing-3)}}@media (prefers-reduced-motion: reduce){.settings-button,.slippage-btn,.token-selector,.swap-button,.dropdown-arrow{transition:none}.swap-button:hover{transform:none}}.token-selector:focus-within{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.quote-info.loading{position:relative;pointer-events:none}.quote-info.loading::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:1.5rem;height:1.5rem;border:2px solid var(--euclid-border);border-top:2px solid var(--euclid-interactive-primary);border-radius:50%;animation:euclid-spin 1s linear infinite}@media (prefers-contrast: high){.swap-card,.settings-panel,.selected-token,.quote-info{border-width:2px;border-color:var(--euclid-text-primary)}.slippage-btn--active{border-color:var(--euclid-text-primary);background:var(--euclid-text-primary)}}";

const EuclidSwapCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.swapInitiated = createEvent(this, "swapInitiated");
        this.tokenSelect = createEvent(this, "tokenSelect");
        this.quoteRequested = createEvent(this, "quoteRequested");
        this.settingsChanged = createEvent(this, "settingsChanged");
        /**
         * Available tokens for swapping (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.tokens = [];
        // Store data (automatically synced)
        this.storeTokens = [];
        this.storeLoading = false;
        /**
         * Currently selected input token
         */
        this.inputToken = null;
        /**
         * Currently selected output token
         */
        this.outputToken = null;
        /**
         * Input amount value
         */
        this.inputAmount = '';
        /**
         * Whether the component is in loading state
         */
        this.loading = false;
        /**
         * Whether the swap functionality is disabled
         */
        this.disabled = false;
        /**
         * Connected wallet address
         */
        this.walletAddress = '';
        /**
         * Whether to show advanced settings
         */
        this.showAdvanced = false;
        /**
         * Default slippage tolerance (0.1 = 0.1%)
         */
        this.defaultSlippage = 0.5;
        /**
         * Card title
         */
        this.cardTitle = 'Swap Tokens';
        // Internal state
        this.outputAmount = '';
        this.isSettingsOpen = false;
        this.tokenSelectorType = 'input';
        this.currentQuote = null;
        this.isQuoting = false;
        this.swapSettings = {
            slippage: this.defaultSlippage,
            deadline: 20,
            infiniteApproval: false,
        };
        // Quote update timer
        this.quoteTimer = null;
        this.handleSwapTokens = () => {
            const tempToken = this.inputToken;
            const tempAmount = this.inputAmount;
            this.inputToken = this.outputToken;
            this.outputToken = tempToken;
            this.inputAmount = this.outputAmount;
            this.outputAmount = tempAmount;
            this.startQuoteTimer();
        };
        this.handleMaxClick = () => {
            if (this.inputToken?.balance) {
                this.inputAmount = this.inputToken.balance;
                this.startQuoteTimer();
            }
        };
        this.openTokenSelector = (type) => {
            console.log('🔧 Opening token selector for:', type);
            this.tokenSelectorType = type;
            appStore.openTokenModal(type);
        };
        this.toggleSettings = () => {
            this.isSettingsOpen = !this.isSettingsOpen;
        };
        this.handleSlippageChange = (slippage) => {
            this.swapSettings = { ...this.swapSettings, slippage };
            this.settingsChanged.emit(this.swapSettings);
            this.startQuoteTimer(); // Recalculate with new slippage
        };
        this.handleSwap = () => {
            // Check if we need to connect wallet first
            if (!this.inputToken || !this.isWalletConnectedForSwap()) {
                // Open wallet modal with chain filter
                appStore.openWalletModal(this.inputToken?.chainUID);
                return;
            }
            if (!this.outputToken || !this.currentQuote)
                return;
            // Emit event to trigger swap execution
            dispatchEuclidEvent(EUCLID_EVENTS.SWAP.EXECUTE_REQUEST);
            // Emit the swap event with all the data for external listeners
            this.swapInitiated.emit({
                inputToken: this.inputToken,
                outputToken: this.outputToken,
                inputAmount: this.inputAmount,
                outputAmount: this.outputAmount,
                settings: this.swapSettings,
                quote: this.currentQuote,
            });
        };
    }
    componentWillLoad() {
        // Connect to market store for automatic token updates
        this.syncWithStore();
    }
    componentDidLoad() {
        // Listen for store changes
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
        });
        // Auto-quote when inputs change
        this.startQuoteTimer();
    }
    syncWithStore() {
        // Use store data if available, fallback to props
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : [];
        this.storeLoading = marketStore.state.loading;
    }
    /**
     * Get available tokens for swap selection
     * Combines store tokens with legacy prop tokens for compatibility
     */
    getAvailableTokens() {
        // Use store tokens if available, fallback to props
        const sourceTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        return sourceTokens.map(token => {
            // Check if this is TokenMetadata from store or legacy SwapToken from props
            if ('tokenId' in token && 'displayName' in token && 'coinDecimal' in token) {
                // Store token format (TokenMetadata)
                return {
                    id: token.tokenId,
                    symbol: token.symbol || token.displayName.toUpperCase(),
                    name: token.displayName,
                    address: token.address || token.tokenId,
                    chainUID: token.chainUID || token.chain_uid || token.chain_uids?.[0] || '',
                    decimals: token.coinDecimal,
                    logoUrl: token.logo || token.image || undefined,
                    balance: undefined, // Would need to fetch from wallet
                    price: token.price ? parseFloat(token.price) : undefined,
                };
            }
            else {
                // Legacy prop format (SwapToken)
                return token;
            }
        });
    }
    /**
     * Get unique chains from available tokens
     */
    getAvailableChains() {
        const tokens = this.getAvailableTokens();
        const chainMap = new Map();
        tokens.forEach(token => {
            if (!chainMap.has(token.chainUID)) {
                chainMap.set(token.chainUID, {
                    chain_uid: token.chainUID,
                    display_name: this.getChainDisplayName(token.chainUID),
                });
            }
        });
        return Array.from(chainMap.values());
    }
    disconnectedCallback() {
        if (this.quoteTimer) {
            clearTimeout(this.quoteTimer);
        }
    }
    handleInputChange(event) {
        if (event.target === this.element.querySelector('#input-amount')) {
            this.inputAmount = event.detail.value;
            this.startQuoteTimer();
        }
    }
    handleTokenModalSelect(event) {
        // Only handle events from the token modal with proper structure
        if (!event.detail || !event.detail.token || !event.detail.selectorType) {
            return;
        }
        console.log('🔧 Swap - received token selection:', event.detail);
        const { token, selectorType } = event.detail;
        // Convert TokenInfo to SwapToken format
        const selectedToken = {
            id: token.tokenId || token.id,
            symbol: token.symbol,
            name: token.name || token.displayName,
            address: token.address || token.tokenId,
            chainUID: token.chainUID || token.chain_uid,
            decimals: token.decimals || token.coinDecimal,
            logoUrl: token.logoUrl || token.logo,
            balance: token.balance,
            price: token.price,
        };
        if (selectorType === 'input') {
            // If we're selecting the same token that's already in output, swap them
            if (this.outputToken && selectedToken.address === this.outputToken.address) {
                this.outputToken = this.inputToken;
            }
            this.inputToken = selectedToken;
        }
        else {
            // If we're selecting the same token that's already in input, swap them
            if (this.inputToken && selectedToken.address === this.inputToken.address) {
                this.inputToken = this.outputToken;
            }
            this.outputToken = selectedToken;
        }
        // Emit event for external listeners
        this.tokenSelect.emit({
            type: selectorType,
            token: selectedToken,
        });
        // Start quote timer if we have both tokens
        this.startQuoteTimer();
    }
    startQuoteTimer() {
        if (this.quoteTimer) {
            clearTimeout(this.quoteTimer);
        }
        if (this.inputToken && this.outputToken && this.inputAmount && parseFloat(this.inputAmount) > 0) {
            this.quoteTimer = setTimeout(() => {
                this.requestQuote();
            }, 800); // Debounce for 800ms
        }
        else {
            this.outputAmount = '';
            this.currentQuote = null;
        }
    }
    async requestQuote() {
        if (!this.inputToken || !this.outputToken || !this.inputAmount)
            return;
        this.isQuoting = true;
        this.quoteRequested.emit({
            inputToken: this.inputToken,
            outputToken: this.outputToken,
            inputAmount: this.inputAmount,
        });
        // Simulate quote response (in real app, this would be handled by parent component)
        setTimeout(() => {
            if (this.inputToken && this.outputToken && this.inputAmount) {
                const mockRate = 1.2 + Math.random() * 0.3; // Mock exchange rate
                const calculatedOutput = (parseFloat(this.inputAmount) * mockRate).toFixed(6);
                this.currentQuote = {
                    inputAmount: this.inputAmount,
                    outputAmount: calculatedOutput,
                    exchangeRate: mockRate,
                    priceImpact: Math.random() * 2, // 0-2% impact
                    minimumReceived: (parseFloat(calculatedOutput) * (1 - this.swapSettings.slippage / 100)).toFixed(6),
                    gasEstimate: (0.001 + Math.random() * 0.002).toFixed(4), // Mock gas
                    route: [
                        {
                            protocol: 'Euclid Protocol',
                            poolAddress: '0x123...abc',
                            fee: 0.3,
                            inputToken: this.inputToken.symbol,
                            outputToken: this.outputToken.symbol,
                        },
                    ],
                };
                this.outputAmount = calculatedOutput;
            }
            this.isQuoting = false;
        }, 1000);
    }
    canSwap() {
        // First check if we need wallet connection
        if (!this.inputToken || !this.isWalletConnectedForSwap()) {
            return true; // Button should be clickable for connection
        }
        return !!(this.inputToken &&
            this.outputToken &&
            this.inputAmount &&
            parseFloat(this.inputAmount) > 0 &&
            this.currentQuote &&
            !this.isQuoting &&
            !this.loading &&
            !this.disabled);
    }
    getSwapButtonText() {
        // Check wallet connection for required chain
        if (!this.inputToken || !this.isWalletConnectedForSwap()) {
            const chainName = this.inputToken?.chainUID ?
                this.getChainDisplayName(this.inputToken.chainUID) : 'Wallet';
            return `Connect ${chainName}`;
        }
        if (!this.inputToken)
            return 'Select Input Token';
        if (!this.outputToken)
            return 'Select Output Token';
        if (!this.inputAmount || parseFloat(this.inputAmount) <= 0)
            return 'Enter Amount';
        if (this.isQuoting)
            return 'Getting Quote...';
        if (this.loading)
            return 'Swapping...';
        if (!this.currentQuote)
            return 'Unable to Quote';
        return `Swap ${this.inputToken.symbol} for ${this.outputToken.symbol}`;
    }
    isWalletConnectedForSwap() {
        if (!this.inputToken)
            return false;
        return walletStore.isWalletConnected(this.inputToken.chainUID);
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
        return (h("div", { key: '5ccf05caa379b87edb753dfae18eb9bb5f20c62b', class: "swap-card" }, h("div", { key: '7f2e41e4dad27e696d22668e91fbc3a9306955ba', class: "swap-header" }, h("h3", { key: '4bcd02d6ce02f97f8f6567af5fdd15fdcdab92dd', class: "swap-title" }, this.cardTitle), h("button", { key: '19f18da33e30257979024612e8f96ec884cc71b2', class: "settings-button", onClick: this.toggleSettings, type: "button", "aria-label": "Swap settings" }, h("svg", { key: '8c976b3ee17c14867ebb713f96274809c382af5b', viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: 'ceb5ee42a4b96203aa1e0572c6cb82329b986329', d: "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" })))), this.isSettingsOpen && (h("div", { key: 'c53e695401705e1745445077ae97aa907bd3b435', class: "settings-panel" }, h("div", { key: '4451f4f0e34592aea5184b133c50673189a6b546', class: "setting-item" }, h("label", { key: 'fdedfd88828c25cf3c2c2635c743f38818593249', class: "setting-label" }, "Slippage Tolerance"), h("div", { key: '02f4fbb41303e0646841d577648fbcd5a1ac947d', class: "slippage-buttons" }, [0.1, 0.5, 1.0].map((value) => (h("button", { class: {
                'slippage-btn': true,
                'slippage-btn--active': this.swapSettings.slippage === value,
            }, onClick: () => this.handleSlippageChange(value), type: "button" }, value, "%"))), h("input", { key: 'bcf94b157512ba0325953e290c274d22a641e292', class: "slippage-input", type: "number", min: "0", max: "50", step: "0.1", value: this.swapSettings.slippage, onInput: (e) => this.handleSlippageChange(parseFloat(e.target.value)), placeholder: "Custom" }))), h("div", { key: '9b21e42077482bd5d7ba74ce11178c5791ec2d0e', class: "setting-item" }, h("label", { key: '03b4cb73fa483d2911a657c183d368ceecc991b8', class: "setting-label" }, "Transaction Deadline"), h("div", { key: '2f9c19f67d93eea7dd8dcabb119d9fb02da428c0', class: "deadline-input" }, h("input", { key: 'f4d7eee46ea9e96fbccb3d5a95c83cd93ba03686', type: "number", min: "1", max: "4320", value: this.swapSettings.deadline, onInput: (e) => (this.swapSettings = {
                ...this.swapSettings,
                deadline: parseInt(e.target.value),
            }) }), h("span", { key: '556bb04c97045abd921652d89969587da3f56ea2' }, "minutes"))))), h("div", { key: '37622af2d6a7636b83158a7b30f52501d11b9fae', class: "token-input-section" }, h("div", { key: '3c40f0c66a1cee84d7d835af3998e52471988d97', class: "input-header" }, h("span", { key: '7ba473eeed5d4309544397a8b55ff8dfaa561835', class: "input-label" }, "From"), this.inputToken?.balance && (h("span", { key: '32cd4284ceb8ade0d671449194e814af5ac503d6', class: "balance-label" }, "Balance: ", parseFloat(this.inputToken.balance).toLocaleString()))), h("euclid-token-input", { key: '5c60ba44280e556489a3677b31572059dcffcee0', id: "input-amount", value: this.inputAmount, placeholder: "0.0", "show-max": !!this.inputToken?.balance, "token-selectable": false, onMaxClick: this.handleMaxClick }, h("div", { key: '73bd918a4f6ad94027cff39c139b443626642eaa', slot: "token", class: "token-selector", onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openTokenSelector('input');
            } }, this.inputToken ? (h("div", { class: "selected-token" }, this.inputToken.logoUrl && (h("img", { src: this.inputToken.logoUrl, alt: this.inputToken.symbol, class: "token-logo" })), h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, this.inputToken.symbol), h("span", { class: "token-name" }, this.inputToken.name)), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" })))) : (h("div", { class: "select-token-button" }, h("span", null, "Select Token"), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" }))))))), h("div", { key: '3c175a7880a418b3ccd88d584302ef9d896158de', class: "swap-direction" }, h("button", { key: 'd99311933510229a6036e44602d9a818e0e2fcd4', class: "swap-button", onClick: this.handleSwapTokens, type: "button", "aria-label": "Swap token directions" }, h("svg", { key: '75d0986cb8630b792b1995379c73234921b3aec7', viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: 'e3a7341a4fc43aa909ef04f77b344743c7b2a11f', d: "M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" })))), h("div", { key: '5c8078fcc608db80029cf2f316c315758b7db88b', class: "token-input-section" }, h("div", { key: 'af5c0e3fb08a20794351977bbab1b7c43fa3a679', class: "input-header" }, h("span", { key: '5512edeb1d9bd56d0bc7d09534fdc79e3f2ca496', class: "input-label" }, "To"), this.outputToken?.balance && (h("span", { key: '3c7b2dde2f246d35a5bbab44f634c8dcdf50ea97', class: "balance-label" }, "Balance: ", parseFloat(this.outputToken.balance).toLocaleString()))), h("euclid-token-input", { key: 'dd4369d960e2c493495a3472f9b47b5b4b6bbb5a', id: "output-amount", value: this.outputAmount, placeholder: "0.0", disabled: true, loading: this.isQuoting, "token-selectable": false }, h("div", { key: '409a15ad3bbbec15b736298c53256b2c5b87179e', slot: "token", class: "token-selector", onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openTokenSelector('output');
            } }, this.outputToken ? (h("div", { class: "selected-token" }, this.outputToken.logoUrl && (h("img", { src: this.outputToken.logoUrl, alt: this.outputToken.symbol, class: "token-logo" })), h("div", { class: "token-info" }, h("span", { class: "token-symbol" }, this.outputToken.symbol), h("span", { class: "token-name" }, this.outputToken.name)), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" })))) : (h("div", { class: "select-token-button" }, h("span", null, "Select Token"), h("svg", { class: "dropdown-arrow", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { d: "M7 10l5 5 5-5z" }))))))), this.currentQuote && (h("div", { key: '453abad05c15148a151b5fbcd3a37978b6089017', class: "quote-info" }, h("div", { key: 'ab610db9496354b9c11069a0d3d7a69581b1279d', class: "quote-row" }, h("span", { key: '83a830f209c7db7b5174792afc933102ad07d401', class: "quote-label" }, "Rate"), h("span", { key: '816b977644262173b60a17cdf2b99d196d2a1de6', class: "quote-value" }, "1 ", this.inputToken?.symbol, " = ", this.currentQuote.exchangeRate.toFixed(6), " ", this.outputToken?.symbol)), this.currentQuote.priceImpact > 0.1 && (h("div", { key: '5f0e90855a9c77f106ab5c3282e586c7f61a6133', class: "quote-row" }, h("span", { key: '67f963c6ffa0c5b9bbd90781e0232e4bfc067fe2', class: "quote-label" }, "Price Impact"), h("span", { key: 'cdb8dbaf6111a9c9f5a7a65fff03f92642a315d2', class: {
                'quote-value': true,
                'quote-value--warning': this.currentQuote.priceImpact > 3,
                'quote-value--danger': this.currentQuote.priceImpact > 15,
            } }, this.currentQuote.priceImpact.toFixed(2), "%"))), h("div", { key: 'e810fccea9c8fd965097e55f030a42041fff79b3', class: "quote-row" }, h("span", { key: 'e978d45bdbdf50f6290b41949bed931e61c052d1', class: "quote-label" }, "Minimum Received"), h("span", { key: 'acbdf1315c438c297dd98e1c53e4461151b23892', class: "quote-value" }, this.currentQuote.minimumReceived, " ", this.outputToken?.symbol)), h("div", { key: '151a44694c6e2ca171231da32196fb6d4e22b9f6', class: "quote-row" }, h("span", { key: 'c8152bdd70e13cbe0108dfc05a8307a591b5c7c3', class: "quote-label" }, "Network Fee"), h("span", { key: '491098c5a4618446a0f51075fbcd8cdd855f9da3', class: "quote-value" }, this.currentQuote.gasEstimate, " ETH")))), h("euclid-button", { key: '2f1e5369a380a16b083f813196818510c08610cc', variant: "primary", size: "lg", "full-width": true, loading: this.loading, disabled: !this.canSwap(), onClick: this.handleSwap }, this.getSwapButtonText())));
    }
    get element() { return getElement(this); }
};
EuclidSwapCard.style = euclidSwapCardCss;

const euclidTokenContentCss = ":host{display:block}.token-content{width:100%;max-height:60vh;display:flex;flex-direction:column}.search-section{padding:var(--euclid-space-4) 0;border-bottom:var(--euclid-border-1) solid var(--euclid-border);margin-bottom:var(--euclid-space-4)}.search-input-container{position:relative}.search-input{width:100%;padding:var(--euclid-space-3) var(--euclid-space-4) var(--euclid-space-3) var(--euclid-space-10);background:var(--euclid-surface-secondary);border:var(--euclid-border-1) solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-primary);font-size:var(--euclid-text-sm);line-height:var(--euclid-leading-normal);outline:none;transition:all var(--euclid-transition-fast);box-sizing:border-box}.search-input:focus{border-color:var(--euclid-border-focus);box-shadow:var(--euclid-shadow-focus)}.search-input::placeholder{color:var(--euclid-text-muted)}.search-icon{position:absolute;left:var(--euclid-space-3);top:50%;transform:translateY(-50%);width:var(--euclid-space-4);height:var(--euclid-space-4);color:var(--euclid-text-muted)}.loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--euclid-space-12) var(--euclid-space-6);gap:var(--euclid-space-3);color:var(--euclid-text-secondary)}.loading-spinner{width:var(--euclid-space-6);height:var(--euclid-space-6);border:2px solid var(--euclid-border);border-top:2px solid var(--euclid-interactive-primary);border-radius:50%;animation:spin var(--euclid-duration-1000) linear infinite}.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--euclid-space-12) var(--euclid-space-6);gap:var(--euclid-space-3);color:var(--euclid-text-secondary);text-align:center}.empty-state svg{width:var(--euclid-space-12);height:var(--euclid-space-12);color:var(--euclid-text-muted);opacity:0.5}.token-list{flex:1;overflow-y:auto;padding:0;margin:0}.token-item{display:flex;align-items:center;gap:var(--euclid-space-3);padding:var(--euclid-space-3) 0;background:transparent;border:none;width:100%;cursor:pointer;transition:all var(--euclid-transition-fast);text-align:left;font-family:inherit}.token-item:hover{background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg)}.token-item:focus-visible{outline:2px solid var(--euclid-border-focus);outline-offset:-2px;border-radius:var(--euclid-radius-lg)}.token-logo{width:var(--euclid-space-8);height:var(--euclid-space-8);border-radius:50%;background:var(--euclid-surface-tertiary);display:flex;align-items:center;justify-content:center;font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-semibold);color:var(--euclid-text-primary);flex-shrink:0;overflow:hidden}.token-logo img{width:100%;height:100%;border-radius:50%;object-fit:cover}.token-info{flex:1;min-width:0}.token-symbol{font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-semibold);color:var(--euclid-text-primary);margin:0 0 var(--euclid-space-0_5) 0}.token-name{font-size:var(--euclid-text-xs);color:var(--euclid-text-secondary);margin:0}.token-balance{font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-medium);color:var(--euclid-text-primary)}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.token-list::-webkit-scrollbar{width:6px}.token-list::-webkit-scrollbar-track{background:var(--euclid-surface-secondary)}.token-list::-webkit-scrollbar-thumb{background:var(--euclid-border);border-radius:3px}.token-list::-webkit-scrollbar-thumb:hover{background:var(--euclid-border-hover)}@media (max-width: 640px){.token-item{padding:var(--euclid-space-2_5) 0}.token-logo{width:var(--euclid-space-7);height:var(--euclid-space-7);font-size:var(--euclid-text-xs)}.token-symbol{font-size:var(--euclid-text-sm)}.token-name{font-size:var(--euclid-text-xs)}}@media (prefers-reduced-motion: reduce){.loading-spinner{animation:none}.search-input,.token-item{transition:none}}.search-input:focus-visible,.token-item:focus-visible{outline:2px solid var(--euclid-border-focus);outline-offset:2px}.token-list::-webkit-scrollbar{width:6px}.token-list::-webkit-scrollbar-track{background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-sm)}.token-list::-webkit-scrollbar-thumb{background:var(--euclid-border);border-radius:var(--euclid-radius-sm)}.token-list::-webkit-scrollbar-thumb:hover{background:var(--euclid-border-hover)}";

const EuclidTokenContent = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.tokenSelect = createEvent(this, "tokenSelect");
        this.searchQuery = '';
        this.storeTokens = [];
        this.storeLoading = false;
        this.filteredTokens = [];
        this.handleSearchInput = (event) => {
            const target = event.target;
            this.searchQuery = target.value || '';
            this.updateFilteredTokens();
        };
        this.handleTokenSelect = (token) => {
            const selectorType = appStore.state.tokenSelectorType || 'input';
            this.tokenSelect.emit({
                token,
                selectorType
            });
            appStore.closeTokenModal();
        };
    }
    componentWillLoad() {
        this.syncWithStore();
    }
    componentDidLoad() {
        // Listen for store changes
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
        });
    }
    syncWithStore() {
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : [];
        this.storeLoading = marketStore.state.loading;
        this.updateFilteredTokens();
    }
    convertStoreTokenToTokenInfo(token) {
        return {
            tokenId: token.tokenId,
            symbol: token.symbol || token.displayName.toUpperCase(),
            name: token.displayName,
            decimals: token.coinDecimal,
            logoUrl: token.logo || token.image,
            balance: '0', // Would need to fetch from wallet
            displayName: token.displayName,
            coinDecimal: token.coinDecimal,
            chain_uid: token.chain_uid || token.chain_uids?.[0] || '',
            chainUID: token.chainUID || token.chain_uid || token.chain_uids?.[0] || '',
            address: token.address || token.tokenId,
            logo: token.logo || token.image,
            price: token.price ? parseFloat(token.price) : undefined,
            priceUsd: token.price,
        };
    }
    getAvailableTokens() {
        return this.storeTokens.map(token => this.convertStoreTokenToTokenInfo(token));
    }
    updateFilteredTokens() {
        let tokens = this.getAvailableTokens();
        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            tokens = tokens.filter(token => token.symbol.toLowerCase().includes(query) ||
                token.name.toLowerCase().includes(query) ||
                (token.address && token.address.toLowerCase().includes(query)));
        }
        // Sort tokens: those with balances first, then by market cap/price
        tokens.sort((a, b) => {
            const balanceA = parseFloat(a.balance || '0');
            const balanceB = parseFloat(b.balance || '0');
            // Prioritize tokens with balances
            if (balanceA > 0 && balanceB === 0)
                return -1;
            if (balanceA === 0 && balanceB > 0)
                return 1;
            // Then sort by price (higher first)
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            if (priceA !== priceB)
                return priceB - priceA;
            // Finally alphabetically
            return a.symbol.localeCompare(b.symbol);
        });
        this.filteredTokens = tokens;
    }
    render() {
        // Show loading only if we're loading AND don't have tokens yet
        const isLoading = this.storeLoading && this.storeTokens.length === 0;
        return (h("div", { key: '53ce19e56ea47206d417d9a2400664b5a7a5b20b', class: "token-content" }, h("div", { key: '64d7ec6ed2ebb3d275a1d7d88e271e6fcd07a143', class: "search-section" }, h("div", { key: '672bf6ba1cab8061c03fcfc93f7431022ff57ac9', class: "search-input-container" }, h("svg", { key: '9b8cc389149d64e2b22c538452e6a1ab9dbc0f5d', class: "search-icon", viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: '7a5deb8aa8b63167540a8d6813675ba5bfe7f8a0', d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" })), h("input", { key: 'f5e82fd1abbb66389da77bba5db07b700ad75c98', type: "text", class: "search-input", placeholder: "Search tokens...", value: this.searchQuery, onInput: this.handleSearchInput }))), isLoading ? (h("div", { class: "loading-state" }, h("div", { class: "loading-spinner" }), h("span", null, "Loading tokens..."))) : this.filteredTokens.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 64 64", fill: "currentColor" }, h("path", { d: "M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z" })), h("span", null, "No tokens found"))) : (h("div", { class: "token-list" }, this.filteredTokens.map(token => (h("button", { key: token.tokenId, class: "token-item", onClick: () => this.handleTokenSelect(token), type: "button" }, h("div", { class: "token-logo" }, token.logoUrl ? (h("img", { src: token.logoUrl, alt: token.symbol })) : (token.symbol.substring(0, 2).toUpperCase())), h("div", { class: "token-info" }, h("div", { class: "token-symbol" }, token.symbol), h("div", { class: "token-name" }, token.name)), token.balance && parseFloat(token.balance) > 0 && (h("div", { class: "token-balance" }, this.formatBalance(token.balance))))))))));
    }
    formatBalance(balance) {
        const num = parseFloat(balance || '0');
        if (isNaN(num) || num === 0)
            return '0';
        if (num < 0.001)
            return '<0.001';
        if (num < 1)
            return num.toFixed(6);
        if (num < 1000)
            return num.toFixed(3);
        if (num < 1000000)
            return (num / 1000).toFixed(2) + 'K';
        return (num / 1000000).toFixed(2) + 'M';
    }
};
EuclidTokenContent.style = euclidTokenContentCss;

const euclidTokenInputCss = ":host{display:block;width:100%}.token-input-wrapper{width:100%}.token-input-label{display:block;font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-medium);color:var(--euclid-text-secondary);margin-bottom:var(--euclid-space-2)}.token-input{position:relative;background:var(--euclid-surface);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);transition:all var(--euclid-transition-fast);overflow:hidden}.token-input:hover:not(.token-input--disabled){border-color:var(--euclid-border-hover)}.token-input--focused{border-color:var(--euclid-interactive-primary);box-shadow:0 0 0 3px rgba(37, 99, 235, 0.1)}.token-input--disabled{background:var(--euclid-surface-secondary);border-color:var(--euclid-border);opacity:0.6;cursor:not-allowed}.token-input--error{border-color:var(--euclid-danger-500);box-shadow:0 0 0 3px rgba(239, 68, 68, 0.1)}.token-input--loading{pointer-events:none}.token-input-main{display:flex;align-items:center;min-height:3.5rem;padding:var(--euclid-space-3) var(--euclid-space-4)}.input-section{flex:1;position:relative;display:flex;align-items:center}.amount-input{width:100%;background:transparent;border:none;outline:none;font-size:var(--euclid-text-lg);font-weight:var(--euclid-font-medium);color:var(--euclid-text-primary);padding:0;margin:0}.amount-input::placeholder{color:var(--euclid-text-muted);font-weight:var(--euclid-font-normal)}.amount-input:disabled{cursor:not-allowed}.loading-spinner{position:absolute;right:0;display:flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem}.spinner{width:1rem;height:1rem;border:2px solid var(--euclid-border);border-top:2px solid var(--euclid-interactive-primary);border-radius:50%;animation:euclid-spin 1s linear infinite}.token-selector{display:flex;align-items:center;margin-left:var(--euclid-space-4);padding:var(--euclid-space-2) var(--euclid-space-3);border-radius:var(--euclid-radius-lg);background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);transition:all var(--euclid-transition-fast);min-width:120px;justify-content:center}.token-selector--clickable{cursor:pointer}.token-selector--clickable:hover:not(.token-selector--empty){background:var(--euclid-surface-secondary);transform:translateY(-1px)}.token-selector--empty{border-style:dashed;color:var(--euclid-text-muted)}.token-selector--clickable.token-selector--empty:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-interactive-primary);color:var(--euclid-interactive-primary)}.token-info{display:flex;align-items:center;gap:var(--euclid-space-2);font-weight:var(--euclid-font-medium);color:var(--euclid-text-primary)}.token-logo{width:var(--euclid-space-6);height:var(--euclid-space-6);border-radius:50%;background:var(--euclid-surface-secondary)}.token-symbol{font-size:var(--euclid-text-base);font-weight:var(--euclid-font-semibold)}.select-token{display:flex;align-items:center;gap:var(--euclid-space-2);font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-medium)}.chevron-icon{width:1rem;height:1rem;transition:transform var(--euclid-transition-fast);color:var(--euclid-text-muted)}.token-selector--clickable:hover .chevron-icon{color:var(--euclid-interactive-primary);transform:translateY(1px)}.token-input-footer{display:flex;align-items:center;justify-content:space-between;padding:var(--euclid-space-2) var(--euclid-space-4);background:var(--euclid-surface-secondary);border-top:1px solid var(--euclid-border)}.balance-section{display:flex;align-items:center;gap:var(--euclid-space-1);font-size:var(--euclid-text-sm)}.balance-label{color:var(--euclid-text-secondary);font-weight:var(--euclid-font-normal)}.balance-value{color:var(--euclid-text-primary);font-weight:var(--euclid-font-medium)}.max-button{padding:var(--euclid-space-1) var(--euclid-space-3);background:var(--euclid-interactive-primary);color:var(--euclid-white);border:none;border-radius:var(--euclid-radius-lg);font-size:var(--euclid-text-sm);font-weight:var(--euclid-font-semibold);cursor:pointer;transition:all var(--euclid-transition-fast)}.max-button:hover:not(:disabled){background:var(--euclid-interactive-primary-hover);transform:translateY(-1px)}.max-button:active:not(:disabled){transform:translateY(0)}.max-button:disabled{background:var(--euclid-text-muted);cursor:not-allowed;transform:none}.error-message{margin-top:var(--euclid-space-2);font-size:var(--euclid-text-sm);color:var(--euclid-danger-500);font-weight:var(--euclid-font-medium)}@media (max-width: 640px){.token-input-main{min-height:3rem;flex-direction:column;align-items:stretch;gap:var(--euclid-space-3)}.input-section{order:2}.token-selector{order:1;margin-left:0;justify-content:flex-start}}@media (prefers-reduced-motion: reduce){.token-selector,.max-button,.spinner,.chevron-icon{animation:none !important;transition:none !important}}.token-selector--clickable:focus-visible,.max-button:focus-visible{outline:2px solid var(--euclid-interactive-primary);outline-offset:2px}.amount-input:focus-visible{outline:none}@media (prefers-color-scheme: dark){:host{--gray-100:#212529;--gray-200:#343a40;--gray-300:#495057;--gray-400:#6c757d;--gray-500:#adb5bd;--gray-600:#ced4da;--gray-700:#dee2e6;--gray-800:#e9ecef;--gray-900:#f8f9fa;--white-color:#212529;--dark-color:#f8f9fa}}.token-input-wrapper{width:100%}.token-input-label{display:block;font-size:var(--font-size-sm);font-weight:var(--font-weight-medium);color:var(--gray-700);margin-bottom:0.5rem}.token-input{position:relative;background:var(--white-color);border:2px solid var(--gray-300);border-radius:var(--border-radius-lg);transition:all var(--transition-fast);overflow:hidden}.token-input:hover:not(.token-input--disabled){border-color:var(--gray-400)}.token-input--focused{border-color:var(--primary-color);box-shadow:0 0 0 3px rgba(0, 123, 255, 0.1)}.token-input--disabled{background:var(--gray-100);border-color:var(--gray-200);opacity:0.6;cursor:not-allowed}.token-input--error{border-color:var(--danger-color);box-shadow:0 0 0 3px rgba(220, 53, 69, 0.1)}.token-input--loading{pointer-events:none}.token-input-main{display:flex;align-items:center;min-height:3.5rem;padding:0.75rem 1rem}.input-section{flex:1;position:relative;display:flex;align-items:center}.amount-input{width:100%;background:transparent;border:none;outline:none;font-size:var(--font-size-lg);font-weight:var(--font-weight-medium);color:var(--gray-900);padding:0;margin:0}.amount-input::placeholder{color:var(--gray-400);font-weight:var(--font-weight-normal)}.amount-input:disabled{cursor:not-allowed}.loading-spinner{position:absolute;right:0;display:flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem}.spinner{width:1rem;height:1rem;border:2px solid var(--gray-300);border-top:2px solid var(--primary-color);border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.token-selector{display:flex;align-items:center;margin-left:1rem;padding:0.5rem 0.75rem;border-radius:var(--border-radius);background:var(--gray-100);border:1px solid var(--gray-200);transition:all var(--transition-fast);min-width:120px;justify-content:center}.token-selector--clickable{cursor:pointer}.token-selector--clickable:hover:not(.token-selector--empty){background:var(--gray-200);transform:translateY(-1px)}.token-selector--empty{border-style:dashed;color:var(--gray-500)}.token-selector--clickable.token-selector--empty:hover{background:var(--gray-200);border-color:var(--primary-color);color:var(--primary-color)}.token-info{display:flex;align-items:center;gap:0.5rem;font-weight:var(--font-weight-medium);color:var(--gray-900)}.token-logo{width:1.5rem;height:1.5rem;border-radius:50%;background:var(--gray-200)}.token-symbol{font-size:var(--font-size-base);font-weight:var(--font-weight-semibold)}.select-token{display:flex;align-items:center;gap:0.5rem;font-size:var(--font-size-sm);font-weight:var(--font-weight-medium)}.chevron-icon{width:1rem;height:1rem;transition:transform var(--transition-fast);color:var(--gray-500)}.token-selector--clickable:hover .chevron-icon{color:var(--primary-color);transform:translateY(1px)}.token-input-footer{display:flex;align-items:center;justify-content:space-between;padding:0.5rem 1rem;background:var(--gray-50);border-top:1px solid var(--gray-200)}@media (prefers-color-scheme: dark){.token-input-footer{background:var(--gray-200)}}.balance-section{display:flex;align-items:center;gap:0.25rem;font-size:var(--font-size-sm)}.balance-label{color:var(--gray-600);font-weight:var(--font-weight-normal)}.balance-value{color:var(--gray-900);font-weight:var(--font-weight-medium)}.max-button{padding:0.25rem 0.75rem;background:var(--primary-color);color:var(--white-color);border:none;border-radius:var(--border-radius);font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);cursor:pointer;transition:all var(--transition-fast)}.max-button:hover:not(:disabled){background:var(--primary-color-dark);transform:translateY(-1px)}.max-button:active:not(:disabled){transform:translateY(0)}.max-button:disabled{background:var(--gray-400);cursor:not-allowed;transform:none}.error-message{margin-top:0.5rem;font-size:var(--font-size-sm);color:var(--danger-color);font-weight:var(--font-weight-medium)}@media (max-width: 640px){.token-input-main{flex-direction:column;align-items:stretch;gap:0.75rem;padding:1rem}.input-section{order:2}.token-selector{order:1;margin-left:0;justify-content:space-between;min-width:auto}.token-input-footer{flex-direction:column;gap:0.5rem;align-items:stretch}.balance-section{justify-content:center}.max-button{align-self:stretch}}@media (prefers-contrast: high){.token-input{border-width:3px}.token-input--focused{box-shadow:0 0 0 4px rgba(0, 123, 255, 0.3)}.token-input--error{box-shadow:0 0 0 4px rgba(220, 53, 69, 0.3)}}@media (prefers-reduced-motion: reduce){*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}.spinner{animation:none}}.token-selector--clickable:focus-visible,.max-button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.amount-input:focus-visible{outline:none;}";

const EuclidTokenInput = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.valueChange = createEvent(this, "valueChange");
        this.tokenSelect = createEvent(this, "tokenSelect");
        this.maxClick = createEvent(this, "maxClick");
        /**
         * The input value (amount)
         */
        this.value = '';
        /**
         * Placeholder text for the input
         */
        this.placeholder = '0.0';
        /**
         * Whether the input is disabled
         */
        this.disabled = false;
        /**
         * Whether to show the balance
         */
        this.showBalance = true;
        /**
         * Whether to show the max button
         */
        this.showMax = true;
        /**
         * Loading state
         */
        this.loading = false;
        /**
         * Whether the token selector is clickable
         */
        this.tokenSelectable = true;
        this.focused = false;
        this.hasError = false;
        this.handleInputChange = (event) => {
            const target = event.target;
            let value = target.value;
            // Allow only numbers and decimal point
            value = value.replace(/[^0-9.]/g, '');
            // Prevent multiple decimal points
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Limit decimal places based on token decimals
            if (this.token?.decimals && parts.length === 2) {
                const decimalPart = parts[1];
                if (decimalPart.length > this.token.decimals) {
                    value = parts[0] + '.' + decimalPart.slice(0, this.token.decimals);
                }
            }
            this.value = value;
            target.value = value;
            this.valueChange.emit(value);
        };
        this.handleInputFocus = () => {
            this.focused = true;
        };
        this.handleInputBlur = () => {
            this.focused = false;
        };
        this.handleTokenClick = () => {
            if (this.tokenSelectable && !this.disabled) {
                this.tokenSelect.emit();
            }
        };
        this.handleMaxClick = () => {
            if (this.token?.balance && !this.disabled) {
                this.value = this.token.balance;
                if (this.inputRef) {
                    this.inputRef.value = this.token.balance;
                }
                this.valueChange.emit(this.token.balance);
                this.maxClick.emit();
            }
        };
    }
    onValueChange(newValue) {
        this.validateInput(newValue);
    }
    onErrorChange(newError) {
        this.hasError = !!newError;
    }
    onTokenChange() {
        this.updateUserBalance();
    }
    componentWillLoad() {
        this.setupStoreSubscriptions();
        this.updateUserBalance();
    }
    disconnectedCallback() {
        // Cleanup store subscriptions if needed
    }
    setupStoreSubscriptions() {
        // Subscribe to wallet balance changes
        walletStore.onChange('balances', () => {
            this.updateUserBalance();
        });
    }
    updateUserBalance() {
        if (this.token?.symbol) {
            // Get balance from wallet store for current token
            // Note: This requires knowing which chain - for now, get from primary connected wallet
            const connectedWallets = walletStore.getAllConnectedWallets();
            if (connectedWallets.length > 0) {
                const primaryChain = connectedWallets[0].chainUID;
                const balance = walletStore.getWalletBalance(primaryChain, this.token.symbol);
                this.userBalance = balance?.amount || '0';
            }
            else {
                this.userBalance = '0';
            }
        }
    }
    validateInput(value) {
        // Reset error state
        this.hasError = false;
        if (!value)
            return;
        // Check if it's a valid number
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
            this.hasError = true;
            return;
        }
        // Check balance if available
        if (this.token?.balance && this.showBalance) {
            const balance = parseFloat(this.token.balance);
            if (numValue > balance) {
                this.hasError = true;
                return;
            }
        }
    }
    formatBalance(balance) {
        const num = parseFloat(balance);
        if (isNaN(num))
            return '0';
        if (num < 0.001)
            return '<0.001';
        if (num < 1)
            return num.toFixed(6);
        if (num < 1000)
            return num.toFixed(3);
        if (num < 1000000)
            return (num / 1000).toFixed(2) + 'K';
        return (num / 1000000).toFixed(2) + 'M';
    }
    render() {
        const containerClass = {
            'token-input': true,
            'token-input--focused': this.focused,
            'token-input--disabled': this.disabled,
            'token-input--error': this.hasError || !!this.error,
            'token-input--loading': this.loading,
        };
        const tokenSelectorClass = {
            'token-selector': true,
            'token-selector--clickable': this.tokenSelectable && !this.disabled,
            'token-selector--empty': !this.token,
        };
        return (h("div", { key: '5b44f7b2a92848b3e1fc0937350372b916289bd3', class: "token-input-wrapper" }, this.label && (h("label", { key: '7859f020522d1cd3cbbd6dc284a7daaf4281b3a2', class: "token-input-label" }, this.label)), h("div", { key: '94cb16b07de2c98fec464954011a04a60aeee752', class: containerClass }, h("div", { key: '722496353b8b140481bb4bcf798e7791c46e86e6', class: "token-input-main" }, h("div", { key: '9e95f7e623d9707a404e84e30fa4379af569309b', class: "input-section" }, h("input", { key: '5066ac03e0c13ee715a940c422a51402d28ab171', ref: (el) => this.inputRef = el, type: "text", inputMode: "decimal", placeholder: this.placeholder, value: this.value, disabled: this.disabled, onInput: this.handleInputChange, onFocus: this.handleInputFocus, onBlur: this.handleInputBlur, class: "amount-input" }), this.loading && (h("div", { key: '96754332ea2d72e8b4e9a2b5c7b522ed7837f898', class: "loading-spinner" }, h("div", { key: 'd65acc61de231819959528a921428a4a5230f6bb', class: "spinner" })))), h("div", { key: '40ee299ae0e3cb977cdeef96e719c9eec4a70a65', class: tokenSelectorClass, onClick: this.tokenSelectable && !this.disabled ? this.handleTokenClick : undefined }, h("slot", { key: '55ed37a54af107f20ee38bd921b5913dd3a5525d', name: "token" }, this.token ? (h("div", { class: "token-info" }, this.token.logoUrl && (h("img", { src: this.token.logoUrl, alt: this.token.symbol, class: "token-logo" })), h("span", { class: "token-symbol" }, this.token.symbol), this.tokenSelectable && !this.disabled && (h("svg", { class: "chevron-icon", viewBox: "0 0 20 20", fill: "currentColor" }, h("path", { "fill-rule": "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", "clip-rule": "evenodd" }))))) : (h("div", { class: "select-token" }, h("span", null, "Select Token"), this.tokenSelectable && !this.disabled && (h("svg", { class: "chevron-icon", viewBox: "0 0 20 20", fill: "currentColor" }, h("path", { "fill-rule": "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", "clip-rule": "evenodd" })))))))), (this.showBalance || this.showMax) && this.token && (h("div", { key: '429b26ee893b93c3e065d51dac8d60f0cd4352ad', class: "token-input-footer" }, this.showBalance && (this.userBalance || this.token.balance) && (h("div", { key: '916d3f57dfb0eb9b60d77c25cb6c844df367ecc3', class: "balance-section" }, h("span", { key: 'fef002f0c3672f74166a03cc486a3871a27f4890', class: "balance-label" }, "Balance:"), h("span", { key: '664189d28b9f3f5bcb65dc49ae91e8fb226ad6ba', class: "balance-value" }, this.formatBalance(this.userBalance || this.token.balance || '0'), " ", this.token.symbol))), this.showMax && this.token.balance && (h("button", { key: '069b22a4b4bd2093cbb1a0896c1a97ae020f76df', class: "max-button", onClick: this.handleMaxClick, disabled: this.disabled, type: "button" }, "MAX"))))), (this.error || this.hasError) && (h("div", { key: 'f336014eaaac08df2ecd267ad610347abf7dc0aa', class: "error-message" }, this.error || 'Invalid amount'))));
    }
    static get watchers() { return {
        "value": ["onValueChange"],
        "error": ["onErrorChange"],
        "token": ["onTokenChange"]
    }; }
};
EuclidTokenInput.style = euclidTokenInputCss;

const euclidTokensListCss = ":host{display:block}.tokens-list{display:flex;flex-direction:column;gap:24px;padding:24px;background:var(--euclid-surface);border-radius:var(--euclid-radius-xl);border:1px solid var(--euclid-border)}.tokens-header{display:flex;justify-content:space-between;align-items:center}.tokens-title{margin:0;font-size:24px;font-weight:700;color:var(--euclid-text-primary)}.tokens-stats{display:flex;gap:32px;padding:16px 20px;background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg);border:1px solid var(--euclid-border)}.stat-item{display:flex;flex-direction:column;gap:4px;text-align:center}.stat-label{font-size:12px;color:var(--euclid-text-secondary);text-transform:uppercase;letter-spacing:0.5px;font-weight:500}.stat-value{font-size:18px;font-weight:700;color:var(--euclid-text-primary)}.tokens-content{min-height:400px}.tokens-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:16px}.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:60px 20px;text-align:center;color:var(--euclid-text-secondary)}.empty-state svg{width:64px;height:64px;opacity:0.5}.empty-state span{font-size:16px;font-weight:500}.pagination{display:flex;justify-content:center;align-items:center;gap:8px;padding:20px 0}.pagination-btn{padding:8px 16px;border:1px solid var(--euclid-border);background:var(--euclid-surface);color:var(--euclid-text-primary);border-radius:var(--euclid-radius-md);cursor:pointer;font-weight:500;transition:all 0.2s ease}.pagination-btn:hover:not(:disabled){background:var(--euclid-surface-hover);border-color:var(--euclid-border-hover)}.pagination-btn:disabled{opacity:0.5;cursor:not-allowed}.pagination-pages{display:flex;gap:4px}.pagination-page{width:40px;height:40px;border:1px solid var(--euclid-border);background:var(--euclid-surface);color:var(--euclid-text-primary);border-radius:var(--euclid-radius-md);cursor:pointer;font-weight:500;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center}.pagination-page:hover{background:var(--euclid-surface-hover);border-color:var(--euclid-border-hover)}.pagination-page--active{background:var(--euclid-primary);color:white;border-color:var(--euclid-primary)}@media (max-width: 768px){.tokens-list{padding:16px;gap:16px}.tokens-stats{gap:16px;padding:12px 16px}.tokens-grid{grid-template-columns:1fr;gap:12px}.pagination{flex-wrap:wrap;gap:4px}.pagination-btn{padding:6px 12px;font-size:14px}.pagination-page{width:36px;height:36px}}";

const EuclidTokensList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.tokenSelected = createEvent(this, "tokenSelected");
        this.filtersChanged = createEvent(this, "filtersChanged");
        /**
         * Available tokens data (gets from market store automatically)
         * @deprecated Use store instead
         */
        this.tokens = [];
        /**
         * Whether the component is in loading state (overrides store loading)
         */
        this.loading = false;
        /**
         * Items per page for pagination
         */
        this.itemsPerPage = 20;
        /**
         * Card title
         */
        this.cardTitle = 'Available Tokens';
        // Internal state
        this.filteredTokens = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.filters = {
            search: '',
            sortBy: 'name',
            sortOrder: 'asc',
            showFavorites: false,
            chainFilter: '',
        };
        // Store data (automatically synced)
        this.storeTokens = [];
        this.storeLoading = false;
        this.handleFiltersChanged = (event) => {
            this.filters = event.detail;
            this.currentPage = 1;
            this.applyFilters();
        };
        this.handlePageChange = (page) => {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        };
        this.handleTokenClick = (token) => {
            this.tokenSelected.emit(token);
        };
    }
    componentWillLoad() {
        // Connect to market store for automatic data updates
        this.syncWithStore();
        // Listen for store changes
        marketStore.onChange('tokens', () => {
            this.syncWithStore();
            this.applyFilters();
        });
        // Initialize filters
        this.applyFilters();
    }
    syncWithStore() {
        // Use store data if available, fallback to props
        this.storeTokens = marketStore.state.tokens.length > 0 ? marketStore.state.tokens : this.tokens;
        this.storeLoading = marketStore.state.loading;
        // Debug logging
        console.log('🔄 Tokens store sync:', {
            storeTokens: this.storeTokens.length,
            storeLoading: this.storeLoading,
            marketStoreTokens: marketStore.state.tokens.length,
            marketStoreLoading: marketStore.state.loading
        });
    }
    watchTokensChange() {
        this.applyFilters();
    }
    applyFilters() {
        // Use store data first, fallback to props for backward compatibility
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        let filtered = [...activeTokens];
        // Apply search filter
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(token => token.displayName.toLowerCase().includes(searchLower) ||
                token.tokenId.toLowerCase().includes(searchLower) ||
                token.description?.toLowerCase().includes(searchLower));
        }
        // Apply chain filter
        if (this.filters.chainFilter) {
            filtered = filtered.filter(token => token.chain_uids?.includes(this.filters.chainFilter));
        }
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (this.filters.sortBy) {
                case 'name':
                    aValue = a.displayName.toLowerCase();
                    bValue = b.displayName.toLowerCase();
                    break;
                case 'price':
                    aValue = parseFloat(a.price || '0');
                    bValue = parseFloat(b.price || '0');
                    break;
                case 'volume':
                    aValue = a.total_volume_24h || 0;
                    bValue = b.total_volume_24h || 0;
                    break;
                case 'marketCap':
                    aValue = parseFloat(a.price || '0'); // Simplified - would be price * supply
                    bValue = parseFloat(b.price || '0');
                    break;
                default:
                    aValue = a.displayName.toLowerCase();
                    bValue = b.displayName.toLowerCase();
            }
            if (typeof aValue === 'string') {
                if (this.filters.sortOrder === 'asc') {
                    return aValue.localeCompare(bValue);
                }
                else {
                    return bValue.localeCompare(aValue);
                }
            }
            else {
                if (this.filters.sortOrder === 'asc') {
                    return aValue - bValue;
                }
                else {
                    return bValue - aValue;
                }
            }
        });
        // Update state only if changed
        const newFilteredLength = filtered.length;
        const currentFilteredLength = this.filteredTokens.length;
        const hasChanged = newFilteredLength !== currentFilteredLength ||
            !filtered.every((token, index) => this.filteredTokens[index]?.tokenId === token.tokenId);
        if (hasChanged) {
            this.filteredTokens = filtered;
        }
        const newTotalPages = Math.ceil(filtered.length / this.itemsPerPage);
        if (this.totalPages !== newTotalPages) {
            this.totalPages = newTotalPages;
        }
        // Reset to first page if current page is out of bounds
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }
        this.filtersChanged.emit(this.filters);
    }
    getPaginatedTokens() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredTokens.slice(startIndex, endIndex);
    }
    getUniqueChains() {
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        const chains = new Set();
        activeTokens.forEach(token => {
            token.chain_uids?.forEach(chain => chains.add(chain));
        });
        return Array.from(chains).sort();
    }
    formatPrice(price) {
        if (!price || price === '0')
            return '$0.00';
        const numPrice = parseFloat(price);
        if (numPrice < 0.01)
            return `$${numPrice.toFixed(6)}`;
        if (numPrice < 1)
            return `$${numPrice.toFixed(4)}`;
        return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    formatVolume(volume) {
        if (volume >= 1e9)
            return `$${(volume / 1e9).toFixed(2)}B`;
        if (volume >= 1e6)
            return `$${(volume / 1e6).toFixed(2)}M`;
        if (volume >= 1e3)
            return `$${(volume / 1e3).toFixed(2)}K`;
        return `$${volume.toFixed(2)}`;
    }
    render() {
        const activeTokens = this.storeTokens.length > 0 ? this.storeTokens : this.tokens;
        const isLoading = (this.storeLoading || this.loading) && activeTokens.length === 0;
        const paginatedTokens = this.getPaginatedTokens();
        const uniqueChains = this.getUniqueChains();
        console.log('🎨 Tokens render state:', {
            activeTokens: activeTokens.length,
            filteredTokens: this.filteredTokens.length,
            paginatedTokens: paginatedTokens.length,
            isLoading,
            storeLoading: this.storeLoading,
            loading: this.loading
        });
        return (h("div", { key: '050d62a50ee62befe09e53d54fafcdf73f452f9c', class: "tokens-list" }, h("div", { key: '5d37b31e73ea4191c11bdb2ad79f81d25fd862bc', class: "tokens-header" }, h("h3", { key: '5e35bad70cb21dc7190b7b699016cb7b4d09ecd0', class: "tokens-title" }, this.cardTitle)), h("tokens-filters", { key: '3140d4cf1b2a71efe741443e358d58a03a0d95f2', filters: this.filters, chains: uniqueChains, onFiltersChanged: this.handleFiltersChanged }), h("div", { key: '717658bacb32cfa0855ff2aa091ecdf9d9da48e0', class: "tokens-stats" }, h("div", { key: '5d64ad9d585ceb74326e2239ae8169c0db8aafe3', class: "stat-item" }, h("span", { key: 'a049adddef36f8d1cfe455b3275c68d2c1c0bbb7', class: "stat-label" }, "Total Tokens"), h("span", { key: 'bc9b5862fd2970fab105dbb6381888b1c65c33b0', class: "stat-value" }, activeTokens.length)), h("div", { key: '22289eb4727ea728baf83d267f4d0ba984fb3103', class: "stat-item" }, h("span", { key: '24ee411cc75bc636b280ba1cae61fed6e8d01b9f', class: "stat-label" }, "Filtered"), h("span", { key: '65c4e509beb3c0c9abbb7c40f7eddf587a8e5b62', class: "stat-value" }, this.filteredTokens.length)), h("div", { key: 'eb46ba0acbd0f5a9a579c498c56caf2c940142b1', class: "stat-item" }, h("span", { key: '06ef345e216f2eba90942c61e51ee439b4846725', class: "stat-label" }, "Chains"), h("span", { key: '9cd07b196a79629f05aba53e0f6865567cb9f350', class: "stat-value" }, uniqueChains.length))), h("div", { key: 'df1b3b2e67710a2fdce02163f4d488b2a26eee04', class: "tokens-content" }, isLoading ? (h("tokens-loading", { count: 6 })) : paginatedTokens.length === 0 ? (h("div", { class: "empty-state" }, h("svg", { viewBox: "0 0 64 64", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z" })), h("span", null, "No tokens found matching your criteria"))) : (h("div", { class: "tokens-grid" }, paginatedTokens.map(token => (h("token-item", { key: token.tokenId, token: token, onClick: () => this.handleTokenClick(token) })))))), this.totalPages > 1 && (h("div", { key: 'fafc78c6d6e2c827b73ea28ea5d6dd47b48460cf', class: "pagination" }, h("button", { key: '5c99abaf7fd87ac6f7e4828cd1620511467fd745', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage - 1), disabled: this.currentPage === 1, type: "button" }, "Previous"), h("div", { key: '138d3bd9639b99c96b07f005d02dc9c044cd8396', class: "pagination-pages" }, Array.from({ length: this.totalPages }, (_, i) => i + 1).map(page => (h("button", { key: page, class: {
                'pagination-page': true,
                'pagination-page--active': page === this.currentPage,
            }, onClick: () => this.handlePageChange(page), type: "button" }, page)))), h("button", { key: '812508668c82d531fd274cb8085e1880e41e3619', class: "pagination-btn", onClick: () => this.handlePageChange(this.currentPage + 1), disabled: this.currentPage === this.totalPages, type: "button" }, "Next")))));
    }
    static get watchers() { return {
        "tokens": ["watchTokensChange"]
    }; }
};
EuclidTokensList.style = euclidTokensListCss;

const euclidWalletContentCss = ":host{display:block}.wallet-content{width:100%}.wallet-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));gap:var(--euclid-spacing-3)}.wallet-card{display:flex;flex-direction:column;align-items:center;padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);background:var(--euclid-surface);cursor:pointer;transition:all var(--euclid-transition-duration-fast);text-align:center}.wallet-card:hover:not(.wallet-card--not-installed){border-color:var(--euclid-border-hover);background:var(--euclid-surface-secondary);transform:translateY(-1px)}.wallet-card--not-installed{opacity:0.6}.wallet-card--not-installed:hover{border-color:var(--euclid-warning-300);background:var(--euclid-warning-50);transform:translateY(-1px)}.wallet-icon{width:3rem;height:3rem;border-radius:var(--euclid-radius-lg);display:flex;align-items:center;justify-content:center;margin-bottom:var(--euclid-spacing-3);background:var(--euclid-surface-secondary)}.wallet-emoji{font-size:1.5rem}.wallet-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1);width:100%}.wallet-name{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.wallet-description{font-size:var(--euclid-text-size-xs);color:var(--euclid-text-secondary);line-height:1.3}.install-badge{display:inline-block;font-size:var(--euclid-text-size-xs);padding:var(--euclid-spacing-1) var(--euclid-spacing-2);border-radius:var(--euclid-radius-sm);background:var(--euclid-warning-100);color:var(--euclid-warning-700);margin-top:var(--euclid-spacing-2);font-weight:var(--euclid-font-weight-medium)}@media (max-width: 640px){.wallet-grid{grid-template-columns:repeat(2, 1fr);gap:var(--euclid-spacing-2)}.wallet-card{padding:var(--euclid-spacing-3)}.wallet-icon{width:2.5rem;height:2.5rem}}@media (max-width: 480px){.wallet-grid{grid-template-columns:1fr}}.wallet-card:focus-visible{outline:2px solid var(--euclid-border-focus);outline-offset:2px}";

const EuclidWalletContent = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.walletConnect = createEvent(this, "walletConnect");
        this.walletProviders = [
            // Mock data - in real app this would come from store/API
            { id: 'metamask', name: 'MetaMask', icon: '🦊', installed: true, description: 'Connect using MetaMask wallet' },
            { id: 'keplr', name: 'Keplr', icon: '🔗', installed: true, description: 'Connect using Keplr wallet' },
            { id: 'phantom', name: 'Phantom', icon: '👻', installed: false, description: 'Connect using Phantom wallet' },
            { id: 'walletconnect', name: 'WalletConnect', icon: '🌐', installed: true, description: 'Connect using WalletConnect' },
        ];
        this.handleWalletConnect = (provider) => {
            if (!provider.installed) {
                this.openInstallUrl(provider.id);
                return;
            }
            this.walletConnect.emit(provider);
            appStore.closeWalletModal();
        };
    }
    openInstallUrl(walletId) {
        const installUrls = {
            'metamask': 'https://metamask.io/download/',
            'keplr': 'https://www.keplr.app/download',
            'phantom': 'https://phantom.app/download',
            'walletconnect': 'https://walletconnect.com/',
        };
        const url = installUrls[walletId];
        if (url) {
            window.open(url, '_blank');
        }
    }
    render() {
        return (h("div", { key: '0f602499b579836e01cd2f0f3b649a7003c106b7', class: "wallet-content" }, h("div", { key: '96dc8993243289645b68261b499d1877f86531dd', class: "wallet-grid" }, this.walletProviders.map(provider => (h("button", { key: provider.id, class: {
                'wallet-card': true,
                'wallet-card--not-installed': !provider.installed
            }, onClick: () => this.handleWalletConnect(provider), type: "button" }, h("div", { class: "wallet-icon" }, h("span", { class: "wallet-emoji" }, provider.icon)), h("div", { class: "wallet-info" }, h("div", { class: "wallet-name" }, provider.name), h("div", { class: "wallet-description" }, provider.description), !provider.installed && (h("span", { class: "install-badge" }, "Install Required")))))))));
    }
};
EuclidWalletContent.style = euclidWalletContentCss;

const poolItemCss = ":host{display:block}.pool-item{display:flex;flex-direction:column;gap:16px;padding:20px;background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);transition:all 0.2s ease}.pool-item:hover{border-color:var(--euclid-border-hover);box-shadow:var(--euclid-shadow-md)}.pool-main{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.pool-tokens{display:flex;align-items:center;gap:12px;min-width:0}.token-logos{position:relative;display:flex;align-items:center;width:48px;height:32px}.token-logo{width:32px;height:32px;border-radius:50%;border:2px solid var(--euclid-border, #e5e7eb);background:linear-gradient(135deg, var(--euclid-surface) 0%, var(--euclid-surface-secondary, #f9fafb) 100%);box-shadow:var(--euclid-shadow-sm);color:var(--euclid-text-secondary, #6b7280);backdrop-filter:brightness(0.95)}.token-logo-overlap{margin-left:-12px}.token-logo.light-logo{background:linear-gradient(135deg, #1f2937 0%, #374151 100%);border-color:var(--euclid-border-hover, #d1d5db)}@media (prefers-color-scheme: dark){.token-logo{background:linear-gradient(135deg, var(--euclid-surface-secondary, #1f2937) 0%, var(--euclid-surface, #111827) 100%);border-color:var(--euclid-border, #374151)}.token-logo.light-logo{background:linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);border-color:var(--euclid-border, #d1d5db)}}.pool-details{display:flex;flex-direction:column;gap:4px;min-width:0}.pool-name{font-weight:600;font-size:16px;color:var(--euclid-text-primary)}.pool-fee{font-size:14px;color:var(--euclid-text-secondary)}.pool-metrics{display:flex;gap:24px;align-items:center}.metric{display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:0}.metric-label{font-size:12px;color:var(--euclid-text-secondary);text-transform:uppercase;letter-spacing:0.5px;font-weight:500}.metric-value{font-weight:600;font-size:14px;color:var(--euclid-text-primary);white-space:nowrap}.metric-value.apy{color:var(--euclid-success-color, #10b981);font-size:16px}.pool-position{padding:16px;background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg);border:1px solid var(--euclid-border)}.position-details{display:flex;flex-direction:column;gap:4px}.position-value{font-weight:600;color:var(--euclid-text-primary);font-size:16px}.position-share{font-size:14px;color:var(--euclid-text-secondary)}.unclaimed-rewards{font-size:14px;color:var(--euclid-warning-color, #f59e0b);font-weight:500}.pool-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}@media (max-width: 768px){.pool-main{flex-direction:column;gap:16px}.pool-metrics{grid-template-columns:repeat(2, 1fr);gap:16px;width:100%}.metric{align-items:flex-start}.pool-actions{width:100%}.pool-actions euclid-button{flex:1}}@media (max-width: 480px){.pool-item{padding:16px;gap:12px}.pool-metrics{grid-template-columns:1fr;gap:12px}.pool-actions{flex-direction:column;gap:8px}}";

const PoolItem = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.addLiquidity = createEvent(this, "addLiquidity");
        this.removeLiquidity = createEvent(this, "removeLiquidity");
        this.stakeTokens = createEvent(this, "stakeTokens");
        this.claimRewards = createEvent(this, "claimRewards");
        this.tokens = [];
    }
    getTokenMetadata(tokenId) {
        return this.tokens.find(token => token.tokenId === tokenId) || null;
    }
    formatNumber(value, decimals = 2) {
        if (value >= 1e9)
            return `${(value / 1e9).toFixed(decimals)}B`;
        if (value >= 1e6)
            return `${(value / 1e6).toFixed(decimals)}M`;
        if (value >= 1e3)
            return `${(value / 1e3).toFixed(decimals)}K`;
        return value.toFixed(decimals);
    }
    formatAPR(aprString) {
        // Remove % if present and parse as float
        const aprValue = parseFloat(aprString.replace('%', '') || '0');
        // Format to 3 decimal places and add % back
        return `${aprValue.toFixed(3)}%`;
    }
    render() {
        const token1Meta = this.getTokenMetadata(this.pool.token_1);
        const token2Meta = this.getTokenMetadata(this.pool.token_2);
        const token1Name = token1Meta?.displayName || this.pool.token_1.toUpperCase();
        const token2Name = token2Meta?.displayName || this.pool.token_2.toUpperCase();
        // Debug: Log raw API values
        console.log('🔍 Raw pool data:', {
            pool_id: this.pool.pool_id,
            token_1: this.pool.token_1,
            token_2: this.pool.token_2,
            total_liquidity_raw: this.pool.total_liquidity,
            volume_24h_raw: this.pool.volume_24h,
            fees_24h_raw: this.pool.fees_24h,
            apr_raw: this.pool.apr,
            formatted_apr: parseFloat(this.pool.apr || '0').toFixed(2),
            formatted_tvl: this.formatNumber(parseFloat(this.pool.total_liquidity || '0'))
        });
        return (h("div", { key: 'dc9d2b4fe3552af9a5fa9a59bdb57657509a188b', class: "pool-item" }, h("div", { key: '95ec851ae36f5d0aa17f7112c14d3ec4e57db7e7', class: "pool-main" }, h("div", { key: '6f92145b9276224d0fc700e3b04cf41f72e0cb50', class: "pool-tokens" }, h("div", { key: '33420685a41c66ff6872eadeea6d37a405cdefd2', class: "token-logos" }, h("img", { key: '3b1191831d3eaae18df9b7b6e83aa2c61771f0ac', src: token1Meta?.image || '/assets/default-token.svg', alt: token1Name, class: `token-logo ${token1Name.toLowerCase().includes('euclid') ? 'light-logo' : ''}`.trim(), onError: (e) => e.target.src = '/assets/default-token.svg' }), h("img", { key: '31d7be84d31d42a8f7c5c720c6e306631c84ea91', src: token2Meta?.image || '/assets/default-token.svg', alt: token2Name, class: `token-logo token-logo-overlap ${token2Name.toLowerCase().includes('euclid') ? 'light-logo' : ''}`.trim(), onError: (e) => e.target.src = '/assets/default-token.svg' })), h("div", { key: 'e93c5b36b910281fc03ba8ba3629dd7683b5f9dc', class: "pool-details" }, h("div", { key: '03a9e4590f9124e8d448bebf532f495691a89711', class: "pool-name" }, token1Name, "/", token2Name), h("div", { key: 'f53a7534de1ada89d34cd1284ccdc6ddbadef460', class: "pool-fee" }, "0.3% Fee"))), h("div", { key: '64abf2e89df58a70cff07eb6f50a867a32c038fb', class: "pool-metrics" }, h("div", { key: '4b297c61a7f46979e777d10dc68d584c6ca6c892', class: "metric" }, h("div", { key: '8393d761518209b9b299a2e3b32581a73f6eb0b9', class: "metric-label" }, "APR"), h("div", { key: 'e6e98289b1cd93442e14a8ddaa558c7aa907228d', class: "metric-value apy" }, this.formatAPR(this.pool.apr || '0'))), h("div", { key: '19d32e50cc9a551028d121f7ab8e5f5d8334f16a', class: "metric" }, h("div", { key: 'a9802c427d362f5124ec7a4295de1964cbbf6ac6', class: "metric-label" }, "TVL"), h("div", { key: '59d4ba912416adefca7a391a7c871a019c3d2d82', class: "metric-value" }, "$", this.formatNumber(parseFloat(this.pool.total_liquidity || '0')))), h("div", { key: '99b66a593b2d9d240cd5942079b02711ccde4394', class: "metric" }, h("div", { key: '86b8c90d65bf4016bf6c6c467b609246c91dd83c', class: "metric-label" }, "24h Volume"), h("div", { key: '7b125896711e64436def8c31ebe05f1fa62a178e', class: "metric-value" }, "$", this.formatNumber(parseFloat(this.pool.volume_24h || '0')))), h("div", { key: '1a710784a632597ce8a26acff0dbd276bdfd4808', class: "metric" }, h("div", { key: '1f21a8867242bccb4a7c93b3b1d87edb4265e245', class: "metric-label" }, "24h Fees"), h("div", { key: '2f41f2ab3000a0db43bc2475faa74f33b33d0ccb', class: "metric-value" }, "$", this.formatNumber(parseFloat(this.pool.fees_24h || '0')))))), this.walletAddress && this.position && (h("div", { key: '9a3038e1d08199280e28dff98bdb6be983efa2f4', class: "pool-position" }, h("div", { key: 'd28e29c93cb60522819159f16b770ceaafdb64b5', class: "position-details" }, h("div", { key: '7307152e5819dcce3eb8d4f60ac5e4c40009ca2a', class: "position-value" }, "$", this.formatNumber(this.position.value)), h("div", { key: 'a0c54e757ded725076cd48a82b1971599decd14b', class: "position-share" }, this.position.shareOfPool.toFixed(4), "% of pool"), this.position.unclaimedRewards && this.position.unclaimedRewards > 0 && (h("div", { key: '4eea665e6b1d35f41d77d4c5cadcfd3d8ba02a99', class: "unclaimed-rewards" }, "$", this.formatNumber(this.position.unclaimedRewards), " rewards"))))), h("div", { key: 'e36a98f89458839dcf4cdddc5e16267cee900b8c', class: "pool-actions" }, h("euclid-button", { key: '561ddad0501af93cb65260512ce289bb5f7a5111', variant: "primary", size: "sm", onClick: () => this.addLiquidity.emit(this.pool) }, "Add Liquidity"), this.position && (h("euclid-button", { key: '17e9f4db70bbed9764f9c1b08adbbf92760e7c49', variant: "secondary", size: "sm", onClick: () => this.removeLiquidity.emit({ pool: this.pool, position: this.position }) }, "Remove")), this.position && this.position.unclaimedRewards && this.position.unclaimedRewards > 0 && (h("euclid-button", { key: '67b63a632b8133ae946f085f1f39a331790145ec', variant: "ghost", size: "sm", onClick: () => this.claimRewards.emit({ pool: this.pool, position: this.position }) }, "Claim Rewards")))));
    }
};
PoolItem.style = poolItemCss;

const poolsFiltersCss = ":host{display:block}.pools-filters{background:var(--euclid-surface);border-bottom:1px solid var(--euclid-border)}.filters-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;gap:16px}.search-container{flex:1;max-width:400px}.search-input{width:100%;padding:12px 16px;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);font-size:14px;background:var(--euclid-surface);color:var(--euclid-text-primary);transition:border-color 0.2s ease}.search-input:focus{outline:none;border-color:var(--euclid-interactive-primary);box-shadow:0 0 0 3px rgba(99, 102, 241, 0.1)}.search-input::placeholder{color:var(--euclid-text-secondary)}.filter-toggle{display:flex;align-items:center;gap:8px;padding:12px 16px;background:transparent;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);cursor:pointer;transition:all 0.2s ease;font-size:14px;font-weight:500}.filter-toggle:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}.filter-toggle svg{width:16px;height:16px}.filters-panel{padding:20px 24px;background:var(--euclid-surface-secondary);border-top:1px solid var(--euclid-border);animation:slideDown 0.2s ease-out}@keyframes slideDown{from{max-height:0;padding-top:0;padding-bottom:0}to{max-height:200px;padding-top:20px;padding-bottom:20px}}.filters-row{display:flex;gap:20px;margin-bottom:16px;align-items:flex-end}.filters-row:last-child{margin-bottom:0}.filter-group{flex:1;min-width:200px}.filter-label{display:block;margin-bottom:8px;font-size:14px;font-weight:500;color:var(--euclid-text-primary)}.filter-select{width:100%;padding:10px 12px;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);font-size:14px;background:var(--euclid-surface);color:var(--euclid-text-primary);transition:border-color 0.2s ease}.filter-select:focus{outline:none;border-color:var(--euclid-interactive-primary);box-shadow:0 0 0 3px rgba(99, 102, 241, 0.1)}.filter-toggles{display:flex;gap:20px;align-items:center;flex-wrap:wrap}.toggle-label{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--euclid-text-secondary);cursor:pointer;user-select:none}.toggle-label input[type=\"checkbox\"]{width:16px;height:16px;accent-color:var(--euclid-interactive-primary)}.clear-btn{padding:8px 16px;background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);color:var(--euclid-text-secondary);cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s ease}.clear-btn:hover{background:var(--euclid-surface-secondary);border-color:var(--euclid-border-hover)}@media (max-width: 768px){.filters-header{flex-direction:column;gap:12px}.search-container{max-width:none}.filters-row{flex-direction:column;gap:16px}.filter-group{min-width:auto}.filter-toggles{gap:16px}}";

const PoolsFilters = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.filtersChanged = createEvent(this, "filtersChanged");
        this.walletAddress = '';
        this.handleSearchChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({ ...this.filters, search: target.value });
        };
        this.handleSortChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({
                ...this.filters,
                sortBy: target.value
            });
        };
        this.handleMyPoolsToggle = () => {
            this.filtersChanged.emit({ ...this.filters, showMyPools: !this.filters.showMyPools });
        };
        this.clearFilters = () => {
            this.filtersChanged.emit({
                search: '',
                sortBy: 'apr',
                sortOrder: 'desc',
                showMyPools: false,
            });
        };
    }
    render() {
        const hasWallet = !!this.walletAddress;
        return (h("div", { key: '2d0096cb0e241fc1e7950cecb2f29eb302a23865', class: "pools-filters" }, h("input", { key: '9efdb1848a2441ba966a7ccc8f55ab6fa6c60c39', class: "search-input", type: "text", placeholder: "Search pools by token name...", value: this.filters.search, onInput: this.handleSearchChange }), h("select", { key: 'b8f7946435df62757758cfddf821dedf2407c6d6', class: "sort-select", onChange: this.handleSortChange }, h("option", { key: 'f3c0d129fc6b32934c9e037b68bf62af3309ee90', value: "apr", selected: this.filters.sortBy === 'apr' }, "APR (High to Low)"), h("option", { key: '7005cc3d189a26f79aae5d800df63231757c9e36', value: "tvl", selected: this.filters.sortBy === 'tvl' }, "TVL (High to Low)"), h("option", { key: '3e52d1332f5910922514ff51ac0e7a563ad65671', value: "volume", selected: this.filters.sortBy === 'volume' }, "Volume (High to Low)"), h("option", { key: '5c97b975a46ed88f54ad77446b583295acca2656', value: "fees", selected: this.filters.sortBy === 'fees' }, "Fees (High to Low)"), hasWallet && h("option", { key: '9c8d8a6d974381eca35411cb7352582eb0915e9c', value: "myLiquidity", selected: this.filters.sortBy === 'myLiquidity' }, "My Liquidity")), hasWallet && (h("label", { key: 'ede2b36982cb925f15c31fcf41b07ef500073764', class: "my-pools-checkbox" }, h("input", { key: 'd8983f3a28068d065e1eab71aebc0dfc789da944', type: "checkbox", checked: this.filters.showMyPools, onChange: this.handleMyPoolsToggle }), "My Pools Only"))));
    }
};
PoolsFilters.style = poolsFiltersCss;

const poolsLoadingCss = ":host{display:block}.pools-loading{display:flex;flex-direction:column;gap:16px;padding:24px}.pool-skeleton{display:flex;flex-direction:column;gap:16px;padding:20px;background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-xl)}.skeleton-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.skeleton-tokens{display:flex;align-items:center;gap:12px}.skeleton-avatar{width:32px;height:32px;border-radius:50%;background:var(--euclid-border);animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}.skeleton-avatar-overlap{margin-left:-12px}.skeleton-text{background:var(--euclid-border);border-radius:var(--euclid-radius-sm);animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}.skeleton-text-sm{height:12px;width:60px}.skeleton-text-md{height:16px;width:80px}.skeleton-text-lg{height:20px;width:120px}.skeleton-metrics{display:flex;gap:24px;align-items:center}.skeleton-metric{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.skeleton-actions{display:flex;gap:12px;align-items:center}.skeleton-button{height:36px;width:100px;background:var(--euclid-border);border-radius:var(--euclid-radius-lg);animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}@media (max-width: 768px){.skeleton-header{flex-direction:column;gap:16px}.skeleton-metrics{width:100%;justify-content:space-between}.skeleton-metric{align-items:flex-start}.skeleton-actions{width:100%}.skeleton-button{flex:1}}";

const PoolsLoading = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.count = 6;
    }
    render() {
        return (h("div", { key: 'c3e902a4016fe6c7a9870be9e9b2b53b4bc0e6e7', class: "pools-loading" }, Array.from({ length: this.count }, (_, i) => (h("div", { key: i, class: "pool-skeleton" }, h("div", { class: "skeleton-header" }, h("div", { class: "skeleton-tokens" }, h("div", { class: "skeleton-avatar" }), h("div", { class: "skeleton-avatar skeleton-avatar-overlap" }), h("div", { class: "skeleton-text skeleton-text-lg" })), h("div", { class: "skeleton-metrics" }, h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })), h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })), h("div", { class: "skeleton-metric" }, h("div", { class: "skeleton-text skeleton-text-sm" }), h("div", { class: "skeleton-text skeleton-text-md" })))), h("div", { class: "skeleton-actions" }, h("div", { class: "skeleton-button" }), h("div", { class: "skeleton-button" })))))));
    }
};
PoolsLoading.style = poolsLoadingCss;

const poolsStatsCss = ":host{display:block}.pools-stats{display:flex;gap:32px;padding:16px 24px;background:var(--euclid-surface-secondary);border-bottom:1px solid var(--euclid-border)}.stat-item{display:flex;flex-direction:column;gap:4px}.stat-label{font-size:12px;color:var(--euclid-text-secondary);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}.stat-value{font-size:16px;font-weight:600;color:var(--euclid-text-primary)}@media (max-width: 768px){.pools-stats{flex-wrap:wrap;gap:16px;padding:12px 16px}}";

const PoolsStats = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.totalPools = 0;
        this.filteredPools = 0;
        this.totalTvl = 0;
        this.userPositions = 0;
    }
    formatNumber(value, decimals = 2) {
        if (value >= 1e9)
            return `${(value / 1e9).toFixed(decimals)}B`;
        if (value >= 1e6)
            return `${(value / 1e6).toFixed(decimals)}M`;
        if (value >= 1e3)
            return `${(value / 1e3).toFixed(decimals)}K`;
        return value.toFixed(decimals);
    }
    render() {
        return (h("div", { key: '44220a8989bb7d2a6993d5f2068c4f924ccca1e0', class: "pools-stats" }, h("div", { key: 'eca1db8b71fd57d096b3d500dcd11b2c594e403c', class: "stat-item" }, h("div", { key: 'afa70d4dde8dc7c93b1d0a494a0cbe3f6c12116b', class: "stat-label" }, "Total Pools"), h("div", { key: '22cd102b79c2a391637f6a754f3f2a492a82b5ab', class: "stat-value" }, this.totalPools)), h("div", { key: '35720df6edc9d6fc0fbacf270a320ed57ceb2476', class: "stat-item" }, h("div", { key: 'd26f1482e70ab2830b123abd6961e559bf0c379e', class: "stat-label" }, "Filtered"), h("div", { key: '7f6dc5b500029d95d0aba1ab4af94f4e7905f299', class: "stat-value" }, this.filteredPools)), h("div", { key: 'f7c75e0117a92bea5b2b848f500de1941bffeb21', class: "stat-item" }, h("div", { key: 'bad24732796d76dedfc09bdf3f6ccdbd4b55685b', class: "stat-label" }, "Total TVL"), h("div", { key: '45362bd5667eee36b5490a3dcffe9e97df8ad246', class: "stat-value" }, "$", this.formatNumber(this.totalTvl))), this.walletAddress && (h("div", { key: '6ea4fa5ba9efa5823d716a16fc83a3831cee5301', class: "stat-item" }, h("div", { key: 'cbcfbf1bcc28ce6ddcf3adf07e06216e2c9f7cd8', class: "stat-label" }, "My Positions"), h("div", { key: '5c3c01f7c83e2ad1c10782e313d84e25335286d3', class: "stat-value" }, this.userPositions)))));
    }
};
PoolsStats.style = poolsStatsCss;

const tokenItemCss = ":host{display:flex;height:100%}.token-item{display:flex;flex-direction:column;gap:16px;padding:20px;background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);transition:all 0.2s ease;cursor:pointer;flex:1;min-height:100%}.token-item:hover{border-color:var(--euclid-border-hover);box-shadow:var(--euclid-shadow-md);transform:translateY(-2px)}.token-header{display:flex;align-items:center;gap:12px}.token-logo-container{position:relative;flex-shrink:0}.token-logo{width:40px;height:40px;border-radius:50%;border:2px solid var(--euclid-border);background:var(--euclid-surface);box-shadow:var(--euclid-shadow-sm)}.fallback-logo{color:var(--euclid-text-secondary);background:var(--euclid-surface-secondary);padding:8px}.token-info{flex:1;min-width:0}.token-name{font-weight:600;font-size:16px;color:var(--euclid-text-primary);margin-bottom:2px}.token-id{font-size:12px;color:var(--euclid-text-secondary);font-family:monospace;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.verified-badge{flex-shrink:0;width:20px;height:20px;color:var(--euclid-success-color, #10b981)}.verified-badge svg{width:100%;height:100%}.token-metrics{display:flex;flex-direction:column;gap:8px}.metric-row{display:flex;justify-content:space-between;align-items:center}.metric-label{font-size:12px;color:var(--euclid-text-secondary);font-weight:500}.metric-value{font-size:14px;color:var(--euclid-text-primary);font-weight:600}.price-change{font-weight:700}.price-positive{color:var(--euclid-success-color, #10b981)}.price-negative{color:var(--euclid-error-color, #ef4444)}.token-tags{display:flex;gap:6px;flex-wrap:wrap}.tag{padding:4px 8px;border-radius:var(--euclid-radius-sm);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}.tag--new{background:var(--euclid-info-color, #3b82f6);color:white}.tag--hot{background:var(--euclid-warning-color, #f59e0b);color:white}.tag--trending{background:var(--euclid-success-color, #10b981);color:white}.token-chains{display:flex;flex-direction:column;gap:6px}.chains-label{font-size:11px;color:var(--euclid-text-secondary);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}.chains-list{display:flex;gap:4px;flex-wrap:wrap}.chain-badge{padding:2px 6px;background:var(--euclid-surface-secondary);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-sm);font-size:10px;font-weight:500;color:var(--euclid-text-secondary);text-transform:uppercase}.chain-badge.more{background:var(--euclid-text-secondary);color:var(--euclid-surface)}@media (max-width: 480px){.token-item{padding:16px;gap:12px}.token-header{gap:8px}.token-logo{width:32px;height:32px}.token-name{font-size:14px}.token-id{font-size:11px}.metric-value{font-size:13px}}";

const TokenItem = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.tokenClick = createEvent(this, "tokenClick");
        this.handleClick = () => {
            this.tokenClick.emit(this.token);
        };
    }
    formatPrice(price) {
        if (!price || price === '0' || price === '0.0' || price === '0.000000')
            return '$0.00';
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice === 0)
            return '$0.00';
        if (numPrice < 0.000001)
            return `$${numPrice.toExponential(2)}`;
        if (numPrice < 0.01)
            return `$${numPrice.toFixed(6)}`;
        if (numPrice < 1)
            return `$${numPrice.toFixed(4)}`;
        return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    formatPriceChange(change) {
        if (change === 0)
            return '0.00%';
        const abs = Math.abs(change);
        if (abs < 0.01)
            return `${change > 0 ? '+' : ''}${change.toFixed(4)}%`;
        return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    }
    formatVolume(volume) {
        if (volume === 0)
            return '$0';
        if (volume >= 1e9)
            return `$${(volume / 1e9).toFixed(2)}B`;
        if (volume >= 1e6)
            return `$${(volume / 1e6).toFixed(2)}M`;
        if (volume >= 1e3)
            return `$${(volume / 1e3).toFixed(2)}K`;
        return `$${volume.toFixed(2)}`;
    }
    render() {
        const priceChange24h = this.token.price_change_24h || 0;
        const isPositiveChange = priceChange24h > 0;
        const isNegativeChange = priceChange24h < 0;
        return (h("div", { key: 'eb4bbd9c19e38b62c6156272d914eb4f9d7421bf', class: "token-item", onClick: this.handleClick }, h("div", { key: 'b2b7d9f6a76fcd553e670e426a0810941d677a78', class: "token-header" }, h("div", { key: 'ae5a3a79b115e935fd11cb5333ef4d3c0bfd4c7d', class: "token-logo-container" }, this.token.image ? (h("img", { src: this.token.image, alt: this.token.displayName, class: "token-logo", onError: (e) => e.target.style.display = 'none' })) : (h("svg", { viewBox: "0 0 64 64", class: "token-logo fallback-logo", xmlns: "http://www.w3.org/2000/svg" }, h("path", { fill: "currentColor", d: "M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z" })))), h("div", { key: 'a5d99b4bf585797aa31a7822e691568d5af14b2a', class: "token-info" }, h("div", { key: '9fd077ae360f04f42eb99dad1259483fb9bc6e5a', class: "token-name" }, this.token.displayName), h("div", { key: '94571d862bfe0add2ee96c813f4a949e760a3f01', class: "token-id" }, this.token.tokenId)), this.token.is_verified && (h("div", { key: '49d2d51da02a64f0619207c3052e1921c4527d83', class: "verified-badge", title: "Verified Token" }, h("svg", { key: 'e3f18e514cd3c00cf29b795a8a3d4bb3085d93c7', viewBox: "0 0 24 24", fill: "currentColor" }, h("path", { key: '2091a8b32411e4757da03b65be5e9de782cc95c7', d: "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.18L16.59,7.59L18,9L10,17Z" }))))), h("div", { key: '168fc887fb6b6df14e836096a2fe1f16f4fc5749', class: "token-metrics" }, h("div", { key: 'c91deffabcf83a1b97fee275c5e09bab9aa90954', class: "metric-row" }, h("span", { key: '1cdfa16d9a1664536349460e21bcede17c812952', class: "metric-label" }, "Price"), h("span", { key: '544fb92ada0bb9a573f6253313e8e061404ce45e', class: "metric-value" }, this.formatPrice(this.token.price))), priceChange24h !== 0 && (h("div", { key: '9c47f506fc3c90e538d5a28fc9d8a1b036eaf37d', class: "metric-row" }, h("span", { key: 'f98270be2cf6bafd527c230ac57942ec54bd86a0', class: "metric-label" }, "24h Change"), h("span", { key: 'f06bfaef29b8616f1002eef835684011233bab92', class: {
                'metric-value': true,
                'price-change': true,
                'price-positive': isPositiveChange,
                'price-negative': isNegativeChange,
            } }, this.formatPriceChange(priceChange24h)))), this.token.total_volume_24h > 0 && (h("div", { key: '450eab81eb97f2c8d22d568a7e0f09ba97f76cc2', class: "metric-row" }, h("span", { key: 'dba22971c3b37026cc51c4e697b95b4fab8275a5', class: "metric-label" }, "24h Volume"), h("span", { key: '72a1eab63263fd9df59639934140cd99c6a0edb6', class: "metric-value" }, this.formatVolume(this.token.total_volume_24h)))), h("div", { key: '95910e166a886e15be7fe7ff9210efbfb483ab57', class: "metric-row" }, h("span", { key: '4ad1f69dac352ccc74f44fbc359fbf86ee6f026f', class: "metric-label" }, "Decimals"), h("span", { key: '48b21c6e92e868a209162e2c145e5ee35d164aa0', class: "metric-value" }, this.token.coinDecimal))), this.token.tags && this.token.tags.length > 0 && (h("div", { key: '7dce2b91dce07fe085f3adf23628e3af3bc99509', class: "token-tags" }, this.token.tags.slice(0, 3).map(tag => (h("span", { key: tag, class: `tag tag--${tag}` }, tag))))), this.token.chain_uids && this.token.chain_uids.length > 0 && (h("div", { key: 'c54aa9e5706ecc905d1d4a9b243fdc5fce193982', class: "token-chains" }, h("span", { key: 'b463d6ebdc6a1b96865299098f900bc5eeac9218', class: "chains-label" }, "Chains:"), h("div", { key: '4402a0c3ccd77456ba0d3bc42666314a032ec713', class: "chains-list" }, this.token.chain_uids.slice(0, 3).map(chain => (h("span", { key: chain, class: "chain-badge" }, chain))), this.token.chain_uids.length > 3 && (h("span", { key: '33dd583d16bdd004f95128b2cccb4398b2546d96', class: "chain-badge more" }, "+", this.token.chain_uids.length - 3)))))));
    }
};
TokenItem.style = tokenItemCss;

const tokensFiltersCss = ":host{display:block}.tokens-filters{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.search-input,.sort-select,.chain-select{padding:12px 16px;border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-md);background:var(--euclid-surface);color:var(--euclid-text-primary);font-size:14px;transition:all 0.2s ease}.search-input{flex:1;min-width:200px}.search-input:focus,.sort-select:focus,.chain-select:focus{outline:none;border-color:var(--euclid-primary);box-shadow:0 0 0 3px var(--euclid-primary-alpha)}.search-input::placeholder{color:var(--euclid-text-secondary)}.sort-select,.chain-select{min-width:140px;cursor:pointer}.sort-select:hover,.chain-select:hover{border-color:var(--euclid-border-hover)}@media (max-width: 768px){.tokens-filters{flex-direction:column;align-items:stretch;gap:8px}.search-input{min-width:auto}.sort-select,.chain-select{min-width:auto}}";

const TokensFilters = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.filtersChanged = createEvent(this, "filtersChanged");
        this.chains = [];
        this.handleSearchChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({ ...this.filters, search: target.value });
        };
        this.handleSortChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({
                ...this.filters,
                sortBy: target.value
            });
        };
        this.handleChainChange = (event) => {
            const target = event.target;
            this.filtersChanged.emit({ ...this.filters, chainFilter: target.value });
        };
    }
    render() {
        return (h("div", { key: 'cfbaf1e8b8fd0afd51f507d5b6f16d432e1df21c', class: "tokens-filters" }, h("input", { key: 'ba819794b9ad6736a936bf02b1ea620a89d9c79a', class: "search-input", type: "text", placeholder: "Search tokens by name or symbol...", value: this.filters.search, onInput: this.handleSearchChange }), h("select", { key: '7fc0c54ef762143fecbe7f50f46df8a528fca805', class: "sort-select", onChange: this.handleSortChange }, h("option", { key: 'beac1b7a37c6fc6e7116ae01ecd8d39bc51ea7f2', value: "name", selected: this.filters.sortBy === 'name' }, "Name (A-Z)"), h("option", { key: '5c9cf975621e7857f2d6b3bd83a7af1fd67f9c5e', value: "price", selected: this.filters.sortBy === 'price' }, "Price (High to Low)"), h("option", { key: '4b6fbaefdbb9b53ae8360063ff0b3f805d0052fb', value: "volume", selected: this.filters.sortBy === 'volume' }, "Volume (High to Low)"), h("option", { key: '3ecfbb4083f5f14172447e29be61b91090dc907f', value: "marketCap", selected: this.filters.sortBy === 'marketCap' }, "Market Cap")), this.chains.length > 0 && (h("select", { key: '5b5dd7885cec695c00fc75e07fe4cf96acfd69ca', class: "chain-select", onChange: this.handleChainChange }, h("option", { key: 'bffc5dcaf48e9b9bfb679391a51831035fededdd', value: "", selected: this.filters.chainFilter === '' }, "All Chains"), this.chains.map(chain => (h("option", { key: chain, value: chain, selected: this.filters.chainFilter === chain }, chain)))))));
    }
};
TokensFilters.style = tokensFiltersCss;

const tokensLoadingCss = ":host{display:block}.tokens-loading{padding:20px 0}.tokens-skeleton-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:16px}.token-skeleton{background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);padding:20px;position:relative;overflow:hidden}.token-skeleton::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(\n    90deg,\n    transparent,\n    rgba(255, 255, 255, 0.08),\n    transparent\n  );animation:shimmer 1.5s infinite ease-in-out}@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}.token-skeleton__content{display:flex;flex-direction:column;gap:16px}.token-skeleton__header{display:flex;align-items:center;gap:12px}.token-skeleton__icon{width:40px;height:40px;border-radius:50%;background:var(--euclid-skeleton);flex-shrink:0}.token-skeleton__info{flex:1;display:flex;flex-direction:column;gap:8px}.token-skeleton__line{height:16px;background:var(--euclid-skeleton);border-radius:4px}.token-skeleton__line--title{width:80%;height:18px}.token-skeleton__line--subtitle{width:60%;height:14px}.token-skeleton__line--small{width:40%;height:12px}.token-skeleton__line--medium{width:70%;height:16px}.token-skeleton__stats{display:flex;justify-content:space-between;gap:16px}.token-skeleton__stat{flex:1;display:flex;flex-direction:column;gap:6px}.token-skeleton__tags{display:flex;gap:8px;flex-wrap:wrap}.token-skeleton__tag{width:60px;height:24px;background:var(--euclid-skeleton);border-radius:12px}@media (prefers-color-scheme: dark){.token-skeleton::before{background:linear-gradient(\n      90deg,\n      transparent,\n      rgba(255, 255, 255, 0.05),\n      transparent\n    )}}@media (max-width: 768px){.tokens-skeleton-grid{grid-template-columns:1fr;gap:12px}.token-skeleton{padding:16px}.token-skeleton__content{gap:12px}.token-skeleton__header{gap:10px}.token-skeleton__icon{width:32px;height:32px}}";

const TokensLoading = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Number of skeleton cards to show
         */
        this.count = 8;
        /**
         * Whether to show the loading state
         */
        this.show = true;
    }
    renderSkeletonCard() {
        return (h("div", { class: "token-skeleton" }, h("div", { class: "token-skeleton__content" }, h("div", { class: "token-skeleton__header" }, h("div", { class: "token-skeleton__icon" }), h("div", { class: "token-skeleton__info" }, h("div", { class: "token-skeleton__line token-skeleton__line--title" }), h("div", { class: "token-skeleton__line token-skeleton__line--subtitle" }))), h("div", { class: "token-skeleton__stats" }, h("div", { class: "token-skeleton__stat" }, h("div", { class: "token-skeleton__line token-skeleton__line--small" }), h("div", { class: "token-skeleton__line token-skeleton__line--medium" })), h("div", { class: "token-skeleton__stat" }, h("div", { class: "token-skeleton__line token-skeleton__line--small" }), h("div", { class: "token-skeleton__line token-skeleton__line--medium" }))), h("div", { class: "token-skeleton__tags" }, h("div", { class: "token-skeleton__tag" }), h("div", { class: "token-skeleton__tag" })))));
    }
    render() {
        if (!this.show) {
            return null;
        }
        return (h("div", { class: "tokens-loading" }, h("div", { class: "tokens-skeleton-grid" }, Array.from({ length: this.count }, (_, index) => (h("div", { key: index }, this.renderSkeletonCard()))))));
    }
};
TokensLoading.style = tokensLoadingCss;

export { EuclidButton as euclid_button, EuclidLiquidityCard as euclid_liquidity_card, EuclidMarketDataController as euclid_market_data_controller, EuclidModal as euclid_modal, EuclidPoolsList as euclid_pools_list, EuclidPortfolioOverview as euclid_portfolio_overview, EuclidSwapCard as euclid_swap_card, EuclidTokenContent as euclid_token_content, EuclidTokenInput as euclid_token_input, EuclidTokensList as euclid_tokens_list, EuclidWalletContent as euclid_wallet_content, PoolItem as pool_item, PoolsFilters as pools_filters, PoolsLoading as pools_loading, PoolsStats as pools_stats, TokenItem as token_item, TokensFilters as tokens_filters, TokensLoading as tokens_loading };
//# sourceMappingURL=euclid-button.euclid-liquidity-card.euclid-market-data-controller.euclid-modal.euclid-pools-list.euclid-portfolio-overview.euclid-swap-card.euclid-token-content.euclid-token-input.euclid-tokens-list.euclid-wallet-content.pool-item.pools-filters.pools-loading.pools-stats.token-item.tokens-filters.tokens-loading.entry.js.map
