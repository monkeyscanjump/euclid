export declare const CHAIN_UIDS: {
    readonly ETHEREUM: "ethereum";
    readonly POLYGON: "polygon";
    readonly ARBITRUM: "arbitrum";
    readonly OPTIMISM: "optimism";
    readonly COSMOS_HUB: "cosmoshub-4";
    readonly OSMOSIS: "osmosis-1";
    readonly JUNO: "juno-1";
    readonly STARGAZE: "stargaze-1";
};
export declare const WALLET_TYPES: {
    readonly METAMASK: "metamask";
    readonly KEPLR: "keplr";
    readonly WALLET_CONNECT: "walletconnect";
    readonly COINBASE: "coinbase";
    readonly OTHER: "other";
};
export declare const TRANSACTION_TYPES: {
    readonly SWAP: "swap";
    readonly ADD_LIQUIDITY: "add_liquidity";
    readonly REMOVE_LIQUIDITY: "remove_liquidity";
    readonly TRANSFER: "transfer";
};
export declare const TRANSACTION_STATUS: {
    readonly PENDING: "pending";
    readonly SUCCESS: "success";
    readonly FAILED: "failed";
};
export declare const API_ENDPOINTS: {
    readonly CHAINS: "/api/chains";
    readonly TOKENS: "/api/tokens";
    readonly POOLS: "/api/pools";
    readonly ROUTES: "/api/routes";
    readonly BALANCES: "/api/balances";
    readonly TRANSACTIONS: "/api/transactions";
    readonly GRAPHQL: "/graphql";
};
export declare const STORAGE_KEYS: {
    readonly WALLET_PREFERENCES: "euclid_wallet_preferences";
    readonly THEME: "euclid_theme";
    readonly SLIPPAGE: "euclid_slippage";
    readonly TRANSACTION_HISTORY: "euclid_transaction_history";
};
export declare const DEFAULTS: {
    readonly SLIPPAGE: number;
    readonly ROUTE_REFRESH_INTERVAL: number;
    readonly MARKET_DATA_REFRESH_INTERVAL: number;
    readonly BALANCE_REFRESH_INTERVAL: number;
    readonly TRANSACTION_TIMEOUT: number;
};
export declare const UI: {
    readonly MODAL_Z_INDEX: number;
    readonly TOOLTIP_Z_INDEX: number;
    readonly DROPDOWN_Z_INDEX: number;
    readonly ANIMATION_DURATION: number;
};
export declare const PATTERNS: {
    readonly ETH_ADDRESS: RegExp;
    readonly COSMOS_ADDRESS: RegExp;
    readonly DECIMAL_NUMBER: RegExp;
    readonly POSITIVE_NUMBER: RegExp;
};
export declare const ERROR_MESSAGES: {
    readonly WALLET_NOT_CONNECTED: "Wallet not connected";
    readonly INSUFFICIENT_BALANCE: "Insufficient balance";
    readonly INVALID_AMOUNT: "Invalid amount";
    readonly NO_ROUTE_FOUND: "No route found for this swap";
    readonly TRANSACTION_FAILED: "Transaction failed";
    readonly NETWORK_ERROR: "Network error occurred";
    readonly TIMEOUT: "Request timeout";
};
export declare const SUCCESS_MESSAGES: {
    readonly WALLET_CONNECTED: "Wallet connected successfully";
    readonly TRANSACTION_SUBMITTED: "Transaction submitted";
    readonly TRANSACTION_CONFIRMED: "Transaction confirmed";
    readonly LIQUIDITY_ADDED: "Liquidity added successfully";
    readonly LIQUIDITY_REMOVED: "Liquidity removed successfully";
};
export declare const FEATURES: {
    readonly SERVICE_WORKER: boolean;
    readonly DARK_MODE: boolean;
    readonly ADVANCED_ROUTING: boolean;
    readonly TRANSACTION_HISTORY: boolean;
    readonly PRICE_ALERTS: boolean;
    readonly LIMIT_ORDERS: boolean;
};
//# sourceMappingURL=constants.d.ts.map