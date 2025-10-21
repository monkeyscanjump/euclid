import { h } from "@stencil/core";
export class PoolsStats {
    constructor() {
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
    static get is() { return "pools-stats"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["pools-stats.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["pools-stats.css"]
        };
    }
    static get properties() {
        return {
            "totalPools": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "total-pools",
                "defaultValue": "0"
            },
            "filteredPools": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "filtered-pools",
                "defaultValue": "0"
            },
            "totalTvl": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "total-tvl",
                "defaultValue": "0"
            },
            "userPositions": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "user-positions",
                "defaultValue": "0"
            },
            "walletAddress": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "wallet-address"
            }
        };
    }
}
//# sourceMappingURL=pools-stats.js.map
