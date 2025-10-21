import type { SwapState } from '../utils/types/euclid-api.types';
import type { TokenMetadata, RoutePath } from '../utils/types/api.types';
import type { BaseStore } from './types';
export interface SwapStore extends BaseStore<SwapState> {
    setTokenIn: (token: TokenMetadata | null) => void;
    setTokenOut: (token: TokenMetadata | null) => void;
    setFromToken: (token: TokenMetadata | null) => void;
    setToToken: (token: TokenMetadata | null) => void;
    setAmountIn: (amount: string) => void;
    setAmountOut: (amount: string) => void;
    setFromAmount: (amount: string) => void;
    setToAmount: (amount: string) => void;
    setRoutes: (routes: RoutePath[]) => void;
    setSelectedRoute: (route: RoutePath | null) => void;
    setLoading: (loading: boolean) => void;
    setLoadingRoutes: (loading: boolean) => void;
    setSwapping: (swapping: boolean) => void;
    setError: (error: string | null) => void;
    setSlippage: (slippage: number) => void;
    swapTokens: () => void;
    clear: () => void;
    canSwap: () => boolean;
    getPriceImpact: () => string;
    getEstimatedGas: () => string;
    isValidPair: () => boolean;
    getSlippageAmount: () => string;
}
export declare const swapStore: SwapStore;
export type { SwapState };
//# sourceMappingURL=swap.store.d.ts.map