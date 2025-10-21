// Chain identifiers
export const CHAIN_UIDS = {
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
export const WALLET_TYPES = {
    METAMASK: 'metamask',
    KEPLR: 'keplr',
    WALLET_CONNECT: 'walletconnect',
    COINBASE: 'coinbase',
    OTHER: 'other',
};
// Transaction types
export const TRANSACTION_TYPES = {
    SWAP: 'swap',
    ADD_LIQUIDITY: 'add_liquidity',
    REMOVE_LIQUIDITY: 'remove_liquidity',
    TRANSFER: 'transfer',
};
// Transaction statuses
export const TRANSACTION_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
};
// API endpoints
export const API_ENDPOINTS = {
    CHAINS: '/api/chains',
    TOKENS: '/api/tokens',
    POOLS: '/api/pools',
    ROUTES: '/api/routes',
    BALANCES: '/api/balances',
    TRANSACTIONS: '/api/transactions',
    GRAPHQL: '/graphql',
};
// Local storage keys
export const STORAGE_KEYS = {
    WALLET_PREFERENCES: 'euclid_wallet_preferences',
    THEME: 'euclid_theme',
    SLIPPAGE: 'euclid_slippage',
    TRANSACTION_HISTORY: 'euclid_transaction_history',
};
import { env } from "./env";
// Default configuration values (now sourced from environment)
export const DEFAULTS = {
    SLIPPAGE: env.ui.defaultSlippage,
    ROUTE_REFRESH_INTERVAL: env.refreshIntervals.routes,
    MARKET_DATA_REFRESH_INTERVAL: env.refreshIntervals.marketData,
    BALANCE_REFRESH_INTERVAL: env.refreshIntervals.balances,
    TRANSACTION_TIMEOUT: env.transactionTimeout,
};
// UI constants (now sourced from environment)
export const UI = {
    MODAL_Z_INDEX: env.ui.zIndex.modal,
    TOOLTIP_Z_INDEX: env.ui.zIndex.tooltip,
    DROPDOWN_Z_INDEX: env.ui.zIndex.dropdown,
    ANIMATION_DURATION: env.ui.animationDuration,
};
// Validation regex patterns
export const PATTERNS = {
    ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
    COSMOS_ADDRESS: /^[a-z0-9]{39,59}$/,
    DECIMAL_NUMBER: /^\d*\.?\d*$/,
    POSITIVE_NUMBER: /^[+]?([0-9]*[.])?[0-9]+$/,
};
// Error messages
export const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Wallet not connected',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    INVALID_AMOUNT: 'Invalid amount',
    NO_ROUTE_FOUND: 'No route found for this swap',
    TRANSACTION_FAILED: 'Transaction failed',
    NETWORK_ERROR: 'Network error occurred',
    TIMEOUT: 'Request timeout',
};
// Success messages
export const SUCCESS_MESSAGES = {
    WALLET_CONNECTED: 'Wallet connected successfully',
    TRANSACTION_SUBMITTED: 'Transaction submitted',
    TRANSACTION_CONFIRMED: 'Transaction confirmed',
    LIQUIDITY_ADDED: 'Liquidity added successfully',
    LIQUIDITY_REMOVED: 'Liquidity removed successfully',
};
// Feature flags (now sourced from environment)
export const FEATURES = {
    SERVICE_WORKER: env.features.serviceWorker,
    DARK_MODE: env.features.darkMode,
    ADVANCED_ROUTING: env.features.advancedRouting,
    TRANSACTION_HISTORY: env.features.transactionHistory,
    PRICE_ALERTS: env.features.priceAlerts,
    LIMIT_ORDERS: env.features.limitOrders,
};
//# sourceMappingURL=constants.js.map
