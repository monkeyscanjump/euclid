import { EventEmitter } from '../../../stencil-public-runtime';
export interface TokenFilters {
    search: string;
    sortBy: 'name' | 'price' | 'volume' | 'marketCap';
    sortOrder: 'asc' | 'desc';
    showFavorites: boolean;
    chainFilter: string;
}
export declare class TokensFilters {
    filters: TokenFilters;
    chains: string[];
    filtersChanged: EventEmitter<TokenFilters>;
    private handleSearchChange;
    private handleSortChange;
    private handleChainChange;
    render(): any;
}
//# sourceMappingURL=tokens-filters.d.ts.map