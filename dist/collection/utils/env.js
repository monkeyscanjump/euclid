/**
 * Environment Configuration Utility
 * Browser-compatible configuration without process.env dependency
 */
// Direct configuration - this works in browser environments
export const env = {
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
// Utility functions for common environment checks
export const isDevelopment = () => env.nodeEnv === 'development';
export const isProduction = () => env.nodeEnv === 'production';
export const isFeatureEnabled = (feature) => env.features[feature];
// Export individual configurations for convenience
export const apiConfig = {
    graphqlEndpoint: env.euclidGraphqlEndpoint,
    restEndpoint: env.euclidRestEndpoint,
    timeout: env.apiTimeout,
};
export const uiConfig = env.ui;
export const featureFlags = env.features;
export const refreshIntervals = env.refreshIntervals;
//# sourceMappingURL=env.js.map
