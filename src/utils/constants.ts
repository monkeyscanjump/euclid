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
} as const;

// Wallet types
export const WALLET_TYPES = {
  METAMASK: 'metamask',
  KEPLR: 'keplr',
  WALLET_CONNECT: 'walletconnect',
  COINBASE: 'coinbase',
  OTHER: 'other',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  SWAP: 'swap',
  ADD_LIQUIDITY: 'add_liquidity',
  REMOVE_LIQUIDITY: 'remove_liquidity',
  TRANSFER: 'transfer',
} as const;

// Transaction statuses
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  CHAINS: '/api/chains',
  TOKENS: '/api/tokens',
  POOLS: '/api/pools',
  ROUTES: '/api/routes',
  BALANCES: '/api/balances',
  TRANSACTIONS: '/api/transactions',
  GRAPHQL: '/graphql',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_PREFERENCES: 'euclid_wallet_preferences',
  THEME: 'euclid_theme',
  SLIPPAGE: 'euclid_slippage',
  TRANSACTION_HISTORY: 'euclid_transaction_history',
} as const;

import { DEFAULT_CONFIG } from './env';

// Default configuration values (now sourced from environment)
export const DEFAULTS = {
  SLIPPAGE: DEFAULT_CONFIG.ui.defaultSlippage,
  ROUTE_REFRESH_INTERVAL: DEFAULT_CONFIG.refreshIntervals.routes,
  MARKET_DATA_REFRESH_INTERVAL: DEFAULT_CONFIG.refreshIntervals.marketData,
  BALANCE_REFRESH_INTERVAL: DEFAULT_CONFIG.refreshIntervals.balances,
  TRANSACTION_TIMEOUT: 300000, // 5 minutes
} as const;

// UI constants (now sourced from environment)
export const UI = {
  MODAL_Z_INDEX: DEFAULT_CONFIG.ui.zIndex.modal,
  TOOLTIP_Z_INDEX: DEFAULT_CONFIG.ui.zIndex.tooltip,
  DROPDOWN_Z_INDEX: DEFAULT_CONFIG.ui.zIndex.dropdown,
  ANIMATION_DURATION: DEFAULT_CONFIG.ui.animationDuration,
} as const;

// Validation regex patterns
export const PATTERNS = {
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  COSMOS_ADDRESS: /^[a-z0-9]{39,59}$/,
  DECIMAL_NUMBER: /^\d*\.?\d*$/,
  POSITIVE_NUMBER: /^[+]?([0-9]*[.])?[0-9]+$/,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid amount',
  NO_ROUTE_FOUND: 'No route found for this swap',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT: 'Request timeout',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUBMITTED: 'Transaction submitted',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
  LIQUIDITY_ADDED: 'Liquidity added successfully',
  LIQUIDITY_REMOVED: 'Liquidity removed successfully',
} as const;

// Feature flags (now sourced from environment)
export const FEATURES = {
  DARK_MODE: DEFAULT_CONFIG.features.darkMode,
  ADVANCED_ROUTING: DEFAULT_CONFIG.features.advancedRouting,
  TRANSACTION_HISTORY: DEFAULT_CONFIG.features.transactionHistory,
} as const;
