import { EventEmitter } from '../../../stencil-public-runtime';
import type { PoolInfo, TokenMetadata } from '../../../utils/types/api.types';
export interface UserPoolPosition {
    poolId: string;
    poolAddress: string;
    lpTokenBalance: string;
    shareOfPool: number;
    tokenAAmount: string;
    tokenBAmount: string;
    value: number;
    unclaimedRewards?: number;
    stakingRewards?: number;
}
export interface PoolFilters {
    search: string;
    sortBy: 'apr' | 'tvl' | 'volume' | 'fees' | 'myLiquidity';
    sortOrder: 'asc' | 'desc';
    showMyPools: boolean;
}
export declare class EuclidPoolsList {
    /**
     * Available pools data (gets from market store automatically)
     * @deprecated Use store instead
     */
    pools: PoolInfo[];
    /**
     * Token metadata for logos and display names (gets from market store automatically)
     * @deprecated Use store instead
     */
    tokenMetadata: TokenMetadata[];
    /**
     * User's positions in pools
     */
    positions: UserPoolPosition[];
    /**
     * Whether the component is in loading state (overrides store loading)
     */
    loading: boolean;
    /**
     * Connected wallet address
     */
    walletAddress: string;
    /**
     * Items per page for pagination
     */
    itemsPerPage: number;
    /**
     * Card title
     */
    cardTitle: string;
    filteredPools: PoolInfo[];
    currentPage: number;
    totalPages: number;
    filters: PoolFilters;
    storePools: PoolInfo[];
    storeTokens: TokenMetadata[];
    storeLoading: boolean;
    poolSelected: EventEmitter<PoolInfo>;
    addLiquidity: EventEmitter<PoolInfo>;
    removeLiquidity: EventEmitter<{
        pool: PoolInfo;
        position: UserPoolPosition;
    }>;
    stakeTokens: EventEmitter<{
        pool: PoolInfo;
        position?: UserPoolPosition;
    }>;
    claimRewards: EventEmitter<{
        pool: PoolInfo;
        position: UserPoolPosition;
    }>;
    filtersChanged: EventEmitter<PoolFilters>;
    componentWillLoad(): void;
    private syncWithStore;
    watchPoolsChange(): void;
    watchPositionsChange(): void;
    private applyFilters;
    private getTokenMetadata;
    private getUserPosition;
    private getTokensWithPools;
    private getPaginatedPools;
    private handleFiltersChanged;
    private handlePageChange;
    render(): any;
}
//# sourceMappingURL=euclid-pools-list.d.ts.map