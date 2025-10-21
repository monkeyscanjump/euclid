import { EventEmitter } from '../../../stencil-public-runtime';
export interface PoolFilters {
    search: string;
    sortBy: 'apr' | 'tvl' | 'volume' | 'fees' | 'myLiquidity';
    sortOrder: 'asc' | 'desc';
    showMyPools: boolean;
}
export declare class PoolsFilters {
    filters: PoolFilters;
    walletAddress: string;
    filtersChanged: EventEmitter<PoolFilters>;
    private handleSearchChange;
    private handleSortChange;
    private handleMyPoolsToggle;
    private clearFilters;
    render(): any;
}
//# sourceMappingURL=pools-filters.d.ts.map