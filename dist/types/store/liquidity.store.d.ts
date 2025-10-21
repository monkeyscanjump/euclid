import type { LiquidityState } from '../utils/types/euclid-api.types';
import type { TokenMetadata, PoolInfo, LiquidityPosition } from '../utils/types/api.types';
import type { BaseStore } from './types';
export interface LiquidityStore extends BaseStore<LiquidityState> {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setToken1: (token: TokenMetadata | null) => void;
    setToken2: (token: TokenMetadata | null) => void;
    setAmount1: (amount: string) => void;
    setAmount2: (amount: string) => void;
    setToken1Amount: (amount: string) => void;
    setToken2Amount: (amount: string) => void;
    setPool: (pool: PoolInfo | null) => void;
    setSelectedPool: (pool: PoolInfo | null) => void;
    setUserLpBalance: (balance: string) => void;
    swapTokens: () => void;
    clear: () => void;
    setAddingLiquidity: (loading: boolean) => void;
    setRemovingLiquidity: (loading: boolean) => void;
    getPosition: (poolId: string) => LiquidityPosition | null;
    canAddLiquidity: () => boolean;
    canRemoveLiquidity: () => boolean;
    getPoolLiquidity: () => string;
    getPoolVolume24h: () => string;
    getPoolFees24h: () => string;
    getPoolAPR: () => string;
    isValidPair: () => boolean;
}
export declare const liquidityStore: LiquidityStore;
export type { LiquidityState };
//# sourceMappingURL=liquidity.store.d.ts.map