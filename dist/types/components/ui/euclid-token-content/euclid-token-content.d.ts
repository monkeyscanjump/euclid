import { EventEmitter } from '../../../stencil-public-runtime';
export interface TokenInfo {
    symbol: string;
    name: string;
    decimals: number;
    logoUrl?: string;
    address?: string;
    balance?: string;
    tokenId?: string;
    displayName?: string;
    coinDecimal?: number;
    chain_uid?: string;
    chainUID?: string;
    logo?: string;
    price?: number;
    priceUsd?: string;
}
export declare class EuclidTokenContent {
    private searchQuery;
    private storeTokens;
    private storeLoading;
    private filteredTokens;
    tokenSelect: EventEmitter<{
        token: TokenInfo;
        selectorType: 'input' | 'output';
    }>;
    componentWillLoad(): void;
    componentDidLoad(): void;
    private syncWithStore;
    private convertStoreTokenToTokenInfo;
    private getAvailableTokens;
    private updateFilteredTokens;
    private handleSearchInput;
    private handleTokenSelect;
    render(): any;
    private formatBalance;
}
//# sourceMappingURL=euclid-token-content.d.ts.map