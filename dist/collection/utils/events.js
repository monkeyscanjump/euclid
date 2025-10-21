/**
 * Centralized event name constants for the Euclid event system.
 * All events follow the pattern: euclid:<group>:<action>
 * This ensures consistent naming and prevents conflicts with other frameworks.
 */
// Wallet Events - Handle wallet connection and management
export const WALLET_EVENTS = {
    // Connection requests and results
    CONNECT_REQUEST: 'euclid:wallet:connect-request',
    CONNECT_SUCCESS: 'euclid:wallet:connect-success',
    CONNECT_FAILED: 'euclid:wallet:connect-failed',
    // Disconnection requests and results
    DISCONNECT_REQUEST: 'euclid:wallet:disconnect-request',
    DISCONNECT_SUCCESS: 'euclid:wallet:disconnect-success',
    // Wallet state changes
    STATE_CHANGED: 'euclid:wallet:state-changed',
};
// Swap Events - Handle token swapping operations
export const SWAP_EVENTS = {
    // Route management
    ROUTES_REFRESH: 'euclid:swap:routes-refresh',
    ROUTES_START_POLLING: 'euclid:swap:routes-start-polling',
    ROUTES_STOP_POLLING: 'euclid:swap:routes-stop-polling',
    // Swap execution
    EXECUTE_REQUEST: 'euclid:swap:execute-request',
    EXECUTE_SUCCESS: 'euclid:swap:execute-success',
    EXECUTE_FAILED: 'euclid:swap:execute-failed',
};
// Liquidity Events - Handle liquidity pool operations
export const LIQUIDITY_EVENTS = {
    // Add liquidity operations
    ADD_REQUEST: 'euclid:liquidity:add-request',
    ADD_SUCCESS: 'euclid:liquidity:add-success',
    ADD_FAILED: 'euclid:liquidity:add-failed',
    // Remove liquidity operations
    REMOVE_REQUEST: 'euclid:liquidity:remove-request',
    REMOVE_SUCCESS: 'euclid:liquidity:remove-success',
    REMOVE_FAILED: 'euclid:liquidity:remove-failed',
    // Position management
    POSITIONS_REFRESH: 'euclid:liquidity:positions-refresh',
};
// Transaction Events - Handle transaction tracking and monitoring
export const TRANSACTION_EVENTS = {
    // Transaction lifecycle
    SUBMITTED: 'euclid:transaction:submitted',
    FINALIZED: 'euclid:transaction:finalized',
    TIMEOUT: 'euclid:transaction:timeout',
    FAILED: 'euclid:transaction:failed',
    // Tracking management
    TRACK_REQUEST: 'euclid:transaction:track-request',
    STOP_TRACKING: 'euclid:transaction:stop-tracking',
    GET_STATS: 'euclid:transaction:get-stats',
    STATS_RESPONSE: 'euclid:transaction:stats-response',
};
// Market Data Events - Handle market information and pricing
export const MARKET_EVENTS = {
    // Initial data loading
    LOAD_INITIAL: 'euclid:market:load-initial',
    REFRESH_DATA: 'euclid:market:refresh-data',
    // Token information
    TOKEN_DETAILS_REQUEST: 'euclid:market:token-details-request',
    TOKEN_DETAILS_SUCCESS: 'euclid:market:token-details-success',
    TOKEN_DETAILS_FAILED: 'euclid:market:token-details-failed',
    // Chain information
    CHAIN_DETAILS_REQUEST: 'euclid:market:chain-details-request',
    CHAIN_DETAILS_SUCCESS: 'euclid:market:chain-details-success',
    CHAIN_DETAILS_FAILED: 'euclid:market:chain-details-failed',
    // Escrow data
    ESCROWS_LOADED: 'euclid:market:escrows-loaded',
};
// User Data Events - Handle user-specific information
export const USER_EVENTS = {
    // Data management
    REFRESH_DATA: 'euclid:user:refresh-data',
    CLEAR_DATA: 'euclid:user:clear-data',
    CONTROLLER_READY: 'euclid:user:controller-ready',
    // Balance management
    BALANCES_REFRESH: 'euclid:user:balances-refresh',
};
// UI Events - Handle user interface interactions
export const UI_EVENTS = {
    // Token selection
    TOKEN_SELECTED: 'euclid:ui:token-selected',
    // Modal interactions
    WALLET_MODAL_OPEN: 'euclid:ui:wallet-modal-open',
    WALLET_MODAL_CLOSE: 'euclid:ui:wallet-modal-close',
    TOKEN_MODAL_OPEN: 'euclid:ui:token-modal-open',
    TOKEN_MODAL_CLOSE: 'euclid:ui:token-modal-close',
};
// Consolidated export for easy importing
export const EUCLID_EVENTS = {
    WALLET: WALLET_EVENTS,
    SWAP: SWAP_EVENTS,
    LIQUIDITY: LIQUIDITY_EVENTS,
    TRANSACTION: TRANSACTION_EVENTS,
    MARKET: MARKET_EVENTS,
    USER: USER_EVENTS,
    UI: UI_EVENTS,
};
// Helper function to create typed events
export function createEuclidEvent(eventName, data) {
    return new CustomEvent(eventName, { detail: data });
}
// Helper function to dispatch events safely
export function dispatchEuclidEvent(eventName, data) {
    window.dispatchEvent(createEuclidEvent(eventName, data));
}
//# sourceMappingURL=events.js.map
