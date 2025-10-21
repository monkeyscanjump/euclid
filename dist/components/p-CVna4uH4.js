import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';
import { d as defineCustomElement$1 } from './p-bUJ-P9iR.js';

const poolItemCss = ":host{display:block}.pool-item{display:flex;flex-direction:column;gap:16px;padding:20px;background:var(--euclid-surface);border:1px solid var(--euclid-border);border-radius:var(--euclid-radius-xl);transition:all 0.2s ease}.pool-item:hover{border-color:var(--euclid-border-hover);box-shadow:var(--euclid-shadow-md)}.pool-main{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.pool-tokens{display:flex;align-items:center;gap:12px;min-width:0}.token-logos{position:relative;display:flex;align-items:center;width:48px;height:32px}.token-logo{width:32px;height:32px;border-radius:50%;border:2px solid var(--euclid-border, #e5e7eb);background:linear-gradient(135deg, var(--euclid-surface) 0%, var(--euclid-surface-secondary, #f9fafb) 100%);box-shadow:var(--euclid-shadow-sm);color:var(--euclid-text-secondary, #6b7280);backdrop-filter:brightness(0.95)}.token-logo-overlap{margin-left:-12px}.token-logo.light-logo{background:linear-gradient(135deg, #1f2937 0%, #374151 100%);border-color:var(--euclid-border-hover, #d1d5db)}@media (prefers-color-scheme: dark){.token-logo{background:linear-gradient(135deg, var(--euclid-surface-secondary, #1f2937) 0%, var(--euclid-surface, #111827) 100%);border-color:var(--euclid-border, #374151)}.token-logo.light-logo{background:linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);border-color:var(--euclid-border, #d1d5db)}}.pool-details{display:flex;flex-direction:column;gap:4px;min-width:0}.pool-name{font-weight:600;font-size:16px;color:var(--euclid-text-primary)}.pool-fee{font-size:14px;color:var(--euclid-text-secondary)}.pool-metrics{display:flex;gap:24px;align-items:center}.metric{display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:0}.metric-label{font-size:12px;color:var(--euclid-text-secondary);text-transform:uppercase;letter-spacing:0.5px;font-weight:500}.metric-value{font-weight:600;font-size:14px;color:var(--euclid-text-primary);white-space:nowrap}.metric-value.apy{color:var(--euclid-success-color, #10b981);font-size:16px}.pool-position{padding:16px;background:var(--euclid-surface-secondary);border-radius:var(--euclid-radius-lg);border:1px solid var(--euclid-border)}.position-details{display:flex;flex-direction:column;gap:4px}.position-value{font-weight:600;color:var(--euclid-text-primary);font-size:16px}.position-share{font-size:14px;color:var(--euclid-text-secondary)}.unclaimed-rewards{font-size:14px;color:var(--euclid-warning-color, #f59e0b);font-weight:500}.pool-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}@media (max-width: 768px){.pool-main{flex-direction:column;gap:16px}.pool-metrics{grid-template-columns:repeat(2, 1fr);gap:16px;width:100%}.metric{align-items:flex-start}.pool-actions{width:100%}.pool-actions euclid-button{flex:1}}@media (max-width: 480px){.pool-item{padding:16px;gap:12px}.pool-metrics{grid-template-columns:1fr;gap:12px}.pool-actions{flex-direction:column;gap:8px}}";

const PoolItem = /*@__PURE__*/ proxyCustomElement(class PoolItem extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
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
    static get style() { return poolItemCss; }
}, [257, "pool-item", {
        "pool": [16],
        "tokens": [16],
        "position": [16],
        "walletAddress": [1, "wallet-address"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["pool-item", "euclid-button"];
    components.forEach(tagName => { switch (tagName) {
        case "pool-item":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, PoolItem);
            }
            break;
        case "euclid-button":
            if (!customElements.get(tagName)) {
                defineCustomElement$1();
            }
            break;
    } });
}
defineCustomElement();

export { PoolItem as P, defineCustomElement as d };
//# sourceMappingURL=p-CVna4uH4.js.map

//# sourceMappingURL=p-CVna4uH4.js.map