/**
 * Default Configuration for Euclid Components
 * These are fallback defaults that can be overridden by component props
 */

export interface EuclidConfig {
  // API Configuration
  graphqlEndpoint: string;
  restEndpoint: string;
  apiTimeout: number;
  environment: 'mainnet' | 'testnet' | 'devnet';

  // Performance Settings
  refreshIntervals: {
    marketData: number;
    balances: number;
    routes: number;
  };

  // Performance Configuration
  performance: {
    cache: {
      marketData: number;
      chains: number;
      routes: number;
      balances: number;
      tokens: number;
    };
    polling: {
      active: {
        marketData: number;
        chains: number;
        balances: number;
        routes: number;
      };
      background: {
        marketData: number;
        chains: number;
        balances: number;
        routes: number;
      };
    };
    requestDeduplication: boolean;
    pauseOnHidden: boolean;
  };

  // UI Configuration
  ui: {
    defaultSlippage: number;
    animationDuration: number;
    zIndex: {
      modal: number;
      tooltip: number;
      dropdown: number;
    };
  };

  // Feature Flags
  features: {
    darkMode: boolean;
    transactionHistory: boolean;
    advancedRouting: boolean;
  };

  // Wallet Configuration
  defaultWallet: string;
  supportedWallets: string[];

  // Chain Configuration
  defaultChain: string;
  supportedChains: string[];
}

// Default configuration (testnet endpoints as fallback)
export const DEFAULT_CONFIG: EuclidConfig = {
  // API Configuration
  graphqlEndpoint: 'https://testnet.api.euclidprotocol.com/graphql',
  restEndpoint: 'https://testnet.api.euclidprotocol.com/api/v1',
  apiTimeout: 10000,
  environment: 'testnet',

  // Performance Settings
  refreshIntervals: {
    marketData: 30000,  // 30 seconds
    balances: 60000,    // 1 minute
    routes: 300000,     // 5 minutes
  },

  // Performance Configuration
  performance: {
    // CACHE: How long to reuse API data before making fresh requests
    // If cache TTL hasn't expired, polling is ignored and cached data is used
    cache: {
      marketData: 5000,       // 5 seconds - cache dynamic market data (tokens)
      chains: 300000,         // 5 minutes - cache static chain metadata
      routes: 30000,          // 30 seconds - cache route data
      balances: 60000,        // 1 minute - cache balance data
      tokens: 5000,          // 5 seconds - cache dynamic token data
    },
    // POLLING: How often the timer fires to CHECK if we should fetch new data
    // Timer frequency - actual API calls depend on cache TTL above
    polling: {
      active: {
        marketData: 5000,      // Check every 5 seconds when tab is active (tokens)
        chains: 300000,        // Check every 5 minutes when tab is active (static data)
        balances: 60000,       // Check every 1 minute when tab is active
        routes: 10000,         // Check every 10 seconds when tab is active
      },
      background: {
        marketData: 300000,    // Check every 5 minutes when tab is hidden
        chains: 1800000,       // Check every 30 minutes when tab is hidden (very static)
        balances: 600000,      // Check every 10 minutes when tab is hidden
        routes: 60000,         // Check every 1 minute when tab is hidden
      },
    },
    requestDeduplication: true,
    pauseOnHidden: true,
  },

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

  // Feature Flags
  features: {
    darkMode: true,
    transactionHistory: true,
    advancedRouting: true,
  },

  // Wallet Configuration
  defaultWallet: 'keplr',
  supportedWallets: ['keplr', 'metamask', 'walletconnect', 'coinbase'],

  // Chain Configuration
  defaultChain: 'osmosis-1',
  supportedChains: ['cosmoshub-4', 'osmosis-1', 'juno-1', 'stargaze-1', 'ethereum', 'polygon', 'arbitrum', 'optimism'],
};

// Environment presets for quick configuration
export const ENVIRONMENT_PRESETS: Record<string, Partial<EuclidConfig>> = {
  mainnet: {
    graphqlEndpoint: 'https://api.euclidprotocol.com/graphql',
    restEndpoint: 'https://api.euclidprotocol.com/api/v1',
    environment: 'mainnet',
  },
  testnet: {
    graphqlEndpoint: 'https://testnet.api.euclidprotocol.com/graphql',
    restEndpoint: 'https://testnet.api.euclidprotocol.com/api/v1',
    environment: 'testnet',
  },
  devnet: {
    graphqlEndpoint: 'https://devnet.api.euclidprotocol.com/graphql',
    restEndpoint: 'https://devnet.api.euclidprotocol.com/api/v1',
    environment: 'devnet',
  },
};

// Utility function to merge config with overrides
export const mergeConfig = (base: EuclidConfig, overrides: Partial<EuclidConfig>): EuclidConfig => {
  return {
    ...base,
    ...overrides,
    refreshIntervals: {
      ...base.refreshIntervals,
      ...overrides.refreshIntervals,
    },
    ui: {
      ...base.ui,
      ...overrides.ui,
      zIndex: {
        ...base.ui.zIndex,
        ...overrides.ui?.zIndex,
      },
    },
    features: {
      ...base.features,
      ...overrides.features,
    },
  };
};
