import { h } from "@stencil/core";
export class TokenItem {
    constructor() {
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
    static get is() { return "token-item"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["token-item.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["token-item.css"]
        };
    }
    static get properties() {
        return {
            "token": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "TokenMetadata",
                    "resolved": "TokenMetadata",
                    "references": {
                        "TokenMetadata": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::TokenMetadata"
                        }
                    }
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            }
        };
    }
    static get events() {
        return [{
                "method": "tokenClick",
                "name": "tokenClick",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "TokenMetadata",
                    "resolved": "TokenMetadata",
                    "references": {
                        "TokenMetadata": {
                            "location": "import",
                            "path": "../../../utils/types/api.types",
                            "id": "src/utils/types/api.types.ts::TokenMetadata"
                        }
                    }
                }
            }];
    }
}
//# sourceMappingURL=token-item.js.map
