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
export declare class PoolItem {
    pool: PoolInfo;
    tokens: TokenMetadata[];
    position?: UserPoolPosition;
    walletAddress?: string;
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
    private getTokenMetadata;
    private formatNumber;
    private formatAPR;
    render(): any;
}
//# sourceMappingURL=pool-item.d.ts.map