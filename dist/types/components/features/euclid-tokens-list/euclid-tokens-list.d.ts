import { EventEmitter } from '../../../stencil-public-runtime';
import type { TokenMetadata } from '../../../utils/types/api.types';
export interface TokenFilters {
    search: string;
    sortBy: 'name' | 'price' | 'volume' | 'marketCap';
    sortOrder: 'asc' | 'desc';
    showFavorites: boolean;
    chainFilter: string;
}
export declare class EuclidTokensList {
    /**
     * Available tokens data (gets from market store automatically)
     * @deprecated Use store instead
     */
    tokens: TokenMetadata[];
    /**
     * Whether the component is in loading state (overrides store loading)
     */
    loading: boolean;
    /**
     * Items per page for pagination
     */
    itemsPerPage: number;
    /**
     * Card title
     */
    cardTitle: string;
    filteredTokens: TokenMetadata[];
    currentPage: number;
    totalPages: number;
    filters: TokenFilters;
    storeTokens: TokenMetadata[];
    storeLoading: boolean;
    tokenSelected: EventEmitter<TokenMetadata>;
    filtersChanged: EventEmitter<TokenFilters>;
    componentWillLoad(): void;
    private syncWithStore;
    watchTokensChange(): void;
    private applyFilters;
    private getPaginatedTokens;
    private getUniqueChains;
    private handleFiltersChanged;
    private handlePageChange;
    private handleTokenClick;
    private formatPrice;
    private formatVolume;
    render(): any;
}
//# sourceMappingURL=euclid-tokens-list.d.ts.map