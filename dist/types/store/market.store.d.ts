import type { EuclidChainConfig, TokenMetadata, PoolInfo } from '../utils/types/api.types';
import type { MarketState } from '../utils/types/euclid-api.types';
import type { BaseStore } from './types';
export interface MarketStore extends BaseStore<MarketState> {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setChains: (chains: EuclidChainConfig[]) => void;
    setTokens: (tokens: TokenMetadata[]) => void;
    setPools: (pools: PoolInfo[]) => void;
    setPrices: (prices: Record<string, number>) => void;
    addToken: (token: TokenMetadata) => void;
    updateToken: (tokenId: string, updates: Partial<TokenMetadata>) => void;
    clear: () => void;
    getChain: (chainUID: string) => EuclidChainConfig | undefined;
    getToken: (tokenId: string) => TokenMetadata | undefined;
    getTokensByChain: (chainUID: string) => TokenMetadata[];
    getPool: (poolId: string) => PoolInfo | undefined;
    getPoolsForTokenPair: (token1: string, token2: string) => PoolInfo[];
    getPrice: (tokenId: string) => number;
    isDataStale: (maxAge?: number) => boolean;
}
export declare const marketStore: MarketStore;
export type { MarketState, EuclidChainConfig, TokenMetadata, PoolInfo };
//# sourceMappingURL=market.store.d.ts.map