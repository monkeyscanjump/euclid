/**
 * Centralized event name constants for the Euclid event system.
 * All events follow the pattern: euclid:<group>:<action>
 * This ensures consistent naming and prevents conflicts with other frameworks.
 */
export declare const WALLET_EVENTS: {
    readonly CONNECT_REQUEST: "euclid:wallet:connect-request";
    readonly CONNECT_SUCCESS: "euclid:wallet:connect-success";
    readonly CONNECT_FAILED: "euclid:wallet:connect-failed";
    readonly DISCONNECT_REQUEST: "euclid:wallet:disconnect-request";
    readonly DISCONNECT_SUCCESS: "euclid:wallet:disconnect-success";
    readonly STATE_CHANGED: "euclid:wallet:state-changed";
};
export declare const SWAP_EVENTS: {
    readonly ROUTES_REFRESH: "euclid:swap:routes-refresh";
    readonly ROUTES_START_POLLING: "euclid:swap:routes-start-polling";
    readonly ROUTES_STOP_POLLING: "euclid:swap:routes-stop-polling";
    readonly EXECUTE_REQUEST: "euclid:swap:execute-request";
    readonly EXECUTE_SUCCESS: "euclid:swap:execute-success";
    readonly EXECUTE_FAILED: "euclid:swap:execute-failed";
};
export declare const LIQUIDITY_EVENTS: {
    readonly ADD_REQUEST: "euclid:liquidity:add-request";
    readonly ADD_SUCCESS: "euclid:liquidity:add-success";
    readonly ADD_FAILED: "euclid:liquidity:add-failed";
    readonly REMOVE_REQUEST: "euclid:liquidity:remove-request";
    readonly REMOVE_SUCCESS: "euclid:liquidity:remove-success";
    readonly REMOVE_FAILED: "euclid:liquidity:remove-failed";
    readonly POSITIONS_REFRESH: "euclid:liquidity:positions-refresh";
};
export declare const TRANSACTION_EVENTS: {
    readonly SUBMITTED: "euclid:transaction:submitted";
    readonly FINALIZED: "euclid:transaction:finalized";
    readonly TIMEOUT: "euclid:transaction:timeout";
    readonly FAILED: "euclid:transaction:failed";
    readonly TRACK_REQUEST: "euclid:transaction:track-request";
    readonly STOP_TRACKING: "euclid:transaction:stop-tracking";
    readonly GET_STATS: "euclid:transaction:get-stats";
    readonly STATS_RESPONSE: "euclid:transaction:stats-response";
};
export declare const MARKET_EVENTS: {
    readonly LOAD_INITIAL: "euclid:market:load-initial";
    readonly REFRESH_DATA: "euclid:market:refresh-data";
    readonly TOKEN_DETAILS_REQUEST: "euclid:market:token-details-request";
    readonly TOKEN_DETAILS_SUCCESS: "euclid:market:token-details-success";
    readonly TOKEN_DETAILS_FAILED: "euclid:market:token-details-failed";
    readonly CHAIN_DETAILS_REQUEST: "euclid:market:chain-details-request";
    readonly CHAIN_DETAILS_SUCCESS: "euclid:market:chain-details-success";
    readonly CHAIN_DETAILS_FAILED: "euclid:market:chain-details-failed";
    readonly ESCROWS_LOADED: "euclid:market:escrows-loaded";
};
export declare const USER_EVENTS: {
    readonly REFRESH_DATA: "euclid:user:refresh-data";
    readonly CLEAR_DATA: "euclid:user:clear-data";
    readonly CONTROLLER_READY: "euclid:user:controller-ready";
    readonly BALANCES_REFRESH: "euclid:user:balances-refresh";
};
export declare const UI_EVENTS: {
    readonly TOKEN_SELECTED: "euclid:ui:token-selected";
    readonly WALLET_MODAL_OPEN: "euclid:ui:wallet-modal-open";
    readonly WALLET_MODAL_CLOSE: "euclid:ui:wallet-modal-close";
    readonly TOKEN_MODAL_OPEN: "euclid:ui:token-modal-open";
    readonly TOKEN_MODAL_CLOSE: "euclid:ui:token-modal-close";
};
export declare const EUCLID_EVENTS: {
    readonly WALLET: {
        readonly CONNECT_REQUEST: "euclid:wallet:connect-request";
        readonly CONNECT_SUCCESS: "euclid:wallet:connect-success";
        readonly CONNECT_FAILED: "euclid:wallet:connect-failed";
        readonly DISCONNECT_REQUEST: "euclid:wallet:disconnect-request";
        readonly DISCONNECT_SUCCESS: "euclid:wallet:disconnect-success";
        readonly STATE_CHANGED: "euclid:wallet:state-changed";
    };
    readonly SWAP: {
        readonly ROUTES_REFRESH: "euclid:swap:routes-refresh";
        readonly ROUTES_START_POLLING: "euclid:swap:routes-start-polling";
        readonly ROUTES_STOP_POLLING: "euclid:swap:routes-stop-polling";
        readonly EXECUTE_REQUEST: "euclid:swap:execute-request";
        readonly EXECUTE_SUCCESS: "euclid:swap:execute-success";
        readonly EXECUTE_FAILED: "euclid:swap:execute-failed";
    };
    readonly LIQUIDITY: {
        readonly ADD_REQUEST: "euclid:liquidity:add-request";
        readonly ADD_SUCCESS: "euclid:liquidity:add-success";
        readonly ADD_FAILED: "euclid:liquidity:add-failed";
        readonly REMOVE_REQUEST: "euclid:liquidity:remove-request";
        readonly REMOVE_SUCCESS: "euclid:liquidity:remove-success";
        readonly REMOVE_FAILED: "euclid:liquidity:remove-failed";
        readonly POSITIONS_REFRESH: "euclid:liquidity:positions-refresh";
    };
    readonly TRANSACTION: {
        readonly SUBMITTED: "euclid:transaction:submitted";
        readonly FINALIZED: "euclid:transaction:finalized";
        readonly TIMEOUT: "euclid:transaction:timeout";
        readonly FAILED: "euclid:transaction:failed";
        readonly TRACK_REQUEST: "euclid:transaction:track-request";
        readonly STOP_TRACKING: "euclid:transaction:stop-tracking";
        readonly GET_STATS: "euclid:transaction:get-stats";
        readonly STATS_RESPONSE: "euclid:transaction:stats-response";
    };
    readonly MARKET: {
        readonly LOAD_INITIAL: "euclid:market:load-initial";
        readonly REFRESH_DATA: "euclid:market:refresh-data";
        readonly TOKEN_DETAILS_REQUEST: "euclid:market:token-details-request";
        readonly TOKEN_DETAILS_SUCCESS: "euclid:market:token-details-success";
        readonly TOKEN_DETAILS_FAILED: "euclid:market:token-details-failed";
        readonly CHAIN_DETAILS_REQUEST: "euclid:market:chain-details-request";
        readonly CHAIN_DETAILS_SUCCESS: "euclid:market:chain-details-success";
        readonly CHAIN_DETAILS_FAILED: "euclid:market:chain-details-failed";
        readonly ESCROWS_LOADED: "euclid:market:escrows-loaded";
    };
    readonly USER: {
        readonly REFRESH_DATA: "euclid:user:refresh-data";
        readonly CLEAR_DATA: "euclid:user:clear-data";
        readonly CONTROLLER_READY: "euclid:user:controller-ready";
        readonly BALANCES_REFRESH: "euclid:user:balances-refresh";
    };
    readonly UI: {
        readonly TOKEN_SELECTED: "euclid:ui:token-selected";
        readonly WALLET_MODAL_OPEN: "euclid:ui:wallet-modal-open";
        readonly WALLET_MODAL_CLOSE: "euclid:ui:wallet-modal-close";
        readonly TOKEN_MODAL_OPEN: "euclid:ui:token-modal-open";
        readonly TOKEN_MODAL_CLOSE: "euclid:ui:token-modal-close";
    };
};
export interface WalletEventData {
    chainUID: string;
    walletType?: string;
    address?: string;
    error?: string;
}
export interface SwapEventData {
    fromToken?: string;
    toToken?: string;
    amount?: string;
    txHash?: string;
    error?: string;
}
export interface LiquidityEventData {
    poolId?: string;
    tokens?: Array<{
        tokenId: string;
        amount: string;
    }>;
    lpTokenAmount?: string;
    txHash?: string;
    error?: string;
}
export interface TransactionEventData {
    txHash: string;
    chainUID: string;
    type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'other';
    status?: 'pending' | 'success' | 'failed' | 'timeout';
    error?: string;
}
export interface MarketEventData {
    tokenId?: string;
    chainUID?: string;
    data?: Record<string, unknown>;
    error?: string;
}
export interface UserEventData {
    chainUID?: string;
    address?: string;
    data?: Record<string, unknown>;
}
export interface UIEventData {
    tokenId?: string;
    modalType?: string;
    action?: string;
    data?: Record<string, unknown>;
}
export declare function createEuclidEvent<T = Record<string, unknown>>(eventName: string, data?: T): CustomEvent<T>;
export declare function dispatchEuclidEvent<T = Record<string, unknown>>(eventName: string, data?: T): void;
//# sourceMappingURL=events.d.ts.map