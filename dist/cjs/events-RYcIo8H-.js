'use strict';

/**
 * Centralized event name constants for the Euclid event system.
 * All events follow the pattern: euclid:<group>:<action>
 * This ensures consistent naming and prevents conflicts with other frameworks.
 */
// Wallet Events - Handle wallet connection and management
const WALLET_EVENTS = {
    // Connection requests and results
    CONNECT_REQUEST: 'euclid:wallet:connect-request',
    CONNECT_SUCCESS: 'euclid:wallet:connect-success',
    CONNECT_FAILED: 'euclid:wallet:connect-failed',
    DISCONNECT_SUCCESS: 'euclid:wallet:disconnect-success'};
// Swap Events - Handle token swapping operations
const SWAP_EVENTS = {
    // Swap execution
    EXECUTE_REQUEST: 'euclid:swap:execute-request',
    EXECUTE_SUCCESS: 'euclid:swap:execute-success',
    EXECUTE_FAILED: 'euclid:swap:execute-failed',
};
// Liquidity Events - Handle liquidity pool operations
const LIQUIDITY_EVENTS = {
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
const TRANSACTION_EVENTS = {
    // Transaction lifecycle
    SUBMITTED: 'euclid:transaction:submitted',
    FINALIZED: 'euclid:transaction:finalized',
    TIMEOUT: 'euclid:transaction:timeout',
    STATS_RESPONSE: 'euclid:transaction:stats-response',
};
// Market Data Events - Handle market information and pricing
const MARKET_EVENTS = {
    // Initial data loading
    LOAD_INITIAL: 'euclid:market:load-initial',
    TOKEN_DETAILS_SUCCESS: 'euclid:market:token-details-success',
    TOKEN_DETAILS_FAILED: 'euclid:market:token-details-failed',
    CHAIN_DETAILS_SUCCESS: 'euclid:market:chain-details-success',
    CHAIN_DETAILS_FAILED: 'euclid:market:chain-details-failed',
    // Escrow data
    ESCROWS_LOADED: 'euclid:market:escrows-loaded',
};
// User Data Events - Handle user-specific information
const USER_EVENTS = {
    // Data management
    REFRESH_DATA: 'euclid:user:refresh-data',
    CONTROLLER_READY: 'euclid:user:controller-ready',
    // Balance management
    BALANCES_REFRESH: 'euclid:user:balances-refresh',
};
// UI Events - Handle user interface interactions
const UI_EVENTS = {
    // Token selection
    TOKEN_SELECTED: 'euclid:ui:token-selected'};
// Consolidated export for easy importing
const EUCLID_EVENTS = {
    WALLET: WALLET_EVENTS,
    SWAP: SWAP_EVENTS,
    LIQUIDITY: LIQUIDITY_EVENTS,
    TRANSACTION: TRANSACTION_EVENTS,
    MARKET: MARKET_EVENTS,
    USER: USER_EVENTS,
    UI: UI_EVENTS,
};
// Helper function to create typed events
function createEuclidEvent(eventName, data) {
    return new CustomEvent(eventName, { detail: data });
}
// Helper function to dispatch events safely
function dispatchEuclidEvent(eventName, data) {
    window.dispatchEvent(createEuclidEvent(eventName, data));
}

exports.EUCLID_EVENTS = EUCLID_EVENTS;
exports.dispatchEuclidEvent = dispatchEuclidEvent;
//# sourceMappingURL=events-RYcIo8H-.js.map

//# sourceMappingURL=events-RYcIo8H-.js.map