/**
 * Environment Configuration Utility
 * Browser-compatible configuration without process.env dependency
 */
// Direct configuration - this works in browser environments
const env = {
    // API Configuration - using the values from your .env file
    euclidGraphqlEndpoint: 'https://testnet.api.euclidprotocol.com/graphql',
    euclidRestEndpoint: 'https://testnet.api.euclidprotocol.com/api/v1',
    apiTimeout: 10000,
    // Development Configuration
    devServerPort: 3333,
    devServerHost: 'localhost',
    nodeEnv: 'development',
    // Feature Flags
    features: {
        serviceWorker: true,
        darkMode: true,
        advancedRouting: true,
        transactionHistory: true,
        priceAlerts: false,
        limitOrders: false,
    },
    // Performance Settings
    refreshIntervals: {
        routes: 30000,
        marketData: 300000,
        balances: 60000,
    },
    transactionTimeout: 300000,
    // UI Configuration
    ui: {
        defaultSlippage: 0.5,
        animationDuration: 250,
        zIndex: {
            modal: 1000,
            tooltip: 1070,
            dropdown: 1000,
        },
    },
    // Chain Configuration
    defaultChain: 'osmosis-1',
    supportedChains: ['cosmoshub-4', 'osmosis-1', 'juno-1', 'stargaze-1', 'ethereum', 'polygon', 'arbitrum', 'optimism'],
    // Wallet Configuration
    defaultWallet: 'keplr',
    supportedWallets: ['keplr', 'metamask', 'walletconnect', 'coinbase'],
    // Logging & Debug
    logLevel: 'info',
    debugMode: false,
    enablePerformanceMonitoring: false,
};

// Chain identifiers
const CHAIN_UIDS = {
    ETHEREUM: 'ethereum',
    POLYGON: 'polygon',
    ARBITRUM: 'arbitrum',
    OPTIMISM: 'optimism',
    COSMOS_HUB: 'cosmoshub-4',
    OSMOSIS: 'osmosis-1',
    JUNO: 'juno-1',
    STARGAZE: 'stargaze-1',
};
// Wallet types
const WALLET_TYPES = {
    METAMASK: 'metamask',
    KEPLR: 'keplr',
    WALLET_CONNECT: 'walletconnect',
    COINBASE: 'coinbase',
    OTHER: 'other',
};
// Transaction types
const TRANSACTION_TYPES = {
    SWAP: 'swap',
    ADD_LIQUIDITY: 'add_liquidity',
    REMOVE_LIQUIDITY: 'remove_liquidity',
    TRANSFER: 'transfer',
};
// Transaction statuses
const TRANSACTION_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
};
// API endpoints
const API_ENDPOINTS = {
    CHAINS: '/api/chains',
    TOKENS: '/api/tokens',
    POOLS: '/api/pools',
    ROUTES: '/api/routes',
    BALANCES: '/api/balances',
    TRANSACTIONS: '/api/transactions',
    GRAPHQL: '/graphql',
};
// Local storage keys
const STORAGE_KEYS = {
    WALLET_PREFERENCES: 'euclid_wallet_preferences',
    THEME: 'euclid_theme',
    SLIPPAGE: 'euclid_slippage',
    TRANSACTION_HISTORY: 'euclid_transaction_history',
};
// Default configuration values (now sourced from environment)
const DEFAULTS = {
    SLIPPAGE: env.ui.defaultSlippage,
    ROUTE_REFRESH_INTERVAL: env.refreshIntervals.routes,
    MARKET_DATA_REFRESH_INTERVAL: env.refreshIntervals.marketData,
    BALANCE_REFRESH_INTERVAL: env.refreshIntervals.balances,
    TRANSACTION_TIMEOUT: env.transactionTimeout,
};
// UI constants (now sourced from environment)
const UI = {
    MODAL_Z_INDEX: env.ui.zIndex.modal,
    TOOLTIP_Z_INDEX: env.ui.zIndex.tooltip,
    DROPDOWN_Z_INDEX: env.ui.zIndex.dropdown,
    ANIMATION_DURATION: env.ui.animationDuration,
};
// Validation regex patterns
const PATTERNS = {
    ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
    COSMOS_ADDRESS: /^[a-z0-9]{39,59}$/,
    DECIMAL_NUMBER: /^\d*\.?\d*$/,
    POSITIVE_NUMBER: /^[+]?([0-9]*[.])?[0-9]+$/,
};
// Error messages
const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Wallet not connected',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    INVALID_AMOUNT: 'Invalid amount',
    NO_ROUTE_FOUND: 'No route found for this swap',
    TRANSACTION_FAILED: 'Transaction failed',
    NETWORK_ERROR: 'Network error occurred',
    TIMEOUT: 'Request timeout',
};
// Success messages
const SUCCESS_MESSAGES = {
    WALLET_CONNECTED: 'Wallet connected successfully',
    TRANSACTION_SUBMITTED: 'Transaction submitted',
    TRANSACTION_CONFIRMED: 'Transaction confirmed',
    LIQUIDITY_ADDED: 'Liquidity added successfully',
    LIQUIDITY_REMOVED: 'Liquidity removed successfully',
};
// Feature flags (now sourced from environment)
const FEATURES = {
    SERVICE_WORKER: env.features.serviceWorker,
    DARK_MODE: env.features.darkMode,
    ADVANCED_ROUTING: env.features.advancedRouting,
    TRANSACTION_HISTORY: env.features.transactionHistory,
    PRICE_ALERTS: env.features.priceAlerts,
    LIMIT_ORDERS: env.features.limitOrders,
};

export { API_ENDPOINTS as A, CHAIN_UIDS as C, DEFAULTS as D, ERROR_MESSAGES as E, FEATURES as F, PATTERNS as P, STORAGE_KEYS as S, TRANSACTION_TYPES as T, UI as U, WALLET_TYPES as W, TRANSACTION_STATUS as a, SUCCESS_MESSAGES as b, env as e };
//# sourceMappingURL=p-a3yxdMSu.js.map

//# sourceMappingURL=p-a3yxdMSu.js.map