/**
 * Environment Configuration Utility
 * Browser-compatible configuration without process.env dependency
 */
interface EnvironmentConfig {
    euclidGraphqlEndpoint: string;
    euclidRestEndpoint: string;
    apiTimeout: number;
    devServerPort: number;
    devServerHost: string;
    nodeEnv: 'development' | 'production' | 'test';
    features: {
        serviceWorker: boolean;
        darkMode: boolean;
        advancedRouting: boolean;
        transactionHistory: boolean;
        priceAlerts: boolean;
        limitOrders: boolean;
    };
    refreshIntervals: {
        routes: number;
        marketData: number;
        balances: number;
    };
    transactionTimeout: number;
    ui: {
        defaultSlippage: number;
        animationDuration: number;
        zIndex: {
            modal: number;
            tooltip: number;
            dropdown: number;
        };
    };
    defaultChain: string;
    supportedChains: string[];
    defaultWallet: string;
    supportedWallets: string[];
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    debugMode: boolean;
    enablePerformanceMonitoring: boolean;
}
export declare const env: EnvironmentConfig;
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isFeatureEnabled: (feature: keyof typeof env.features) => boolean;
export declare const apiConfig: {
    graphqlEndpoint: string;
    restEndpoint: string;
    timeout: number;
};
export declare const uiConfig: {
    defaultSlippage: number;
    animationDuration: number;
    zIndex: {
        modal: number;
        tooltip: number;
        dropdown: number;
    };
};
export declare const featureFlags: {
    serviceWorker: boolean;
    darkMode: boolean;
    advancedRouting: boolean;
    transactionHistory: boolean;
    priceAlerts: boolean;
    limitOrders: boolean;
};
export declare const refreshIntervals: {
    routes: number;
    marketData: number;
    balances: number;
};
export {};
//# sourceMappingURL=env.d.ts.map