/**
 * Environment Configuration Utility
 * Handles reading environment variables with type safety and defaults
 */

interface EnvironmentConfig {
  // API Configuration
  euclidGraphqlEndpoint: string;
  euclidRestEndpoint: string;
  apiTimeout: number;

  // Development Configuration
  devServerPort: number;
  devServerHost: string;
  nodeEnv: 'development' | 'production' | 'test';

  // Feature Flags
  features: {
    serviceWorker: boolean;
    darkMode: boolean;
    advancedRouting: boolean;
    transactionHistory: boolean;
    priceAlerts: boolean;
    limitOrders: boolean;
  };

  // Performance Settings
  refreshIntervals: {
    routes: number;
    marketData: number;
    balances: number;
  };
  transactionTimeout: number;

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

  // Chain Configuration
  defaultChain: string;
  supportedChains: string[];

  // Wallet Configuration
  defaultWallet: string;
  supportedWallets: string[];

  // Logging & Debug
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  debugMode: boolean;
  enablePerformanceMonitoring: boolean;
}

// Helper function to get environment variable with fallback
function getEnvVar(key: string, defaultValue: string): string;
function getEnvVar(key: string, defaultValue: number): number;
function getEnvVar(key: string, defaultValue: boolean): boolean;
function getEnvVar(key: string, defaultValue: string[]): string[];
function getEnvVar(key: string, defaultValue: unknown): unknown {
  // In a real Stencil app, we'd use process.env, but for browser compatibility
  // we might need to use build-time replacement or a different approach

  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }

    // Type conversion based on default value type
    if (typeof defaultValue === 'boolean') {
      return value.toLowerCase() === 'true';
    }
    if (typeof defaultValue === 'number') {
      const num = parseFloat(value);
      return isNaN(num) ? defaultValue : num;
    }
    if (Array.isArray(defaultValue)) {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return value;
  }

  return defaultValue;
}

// Create the configuration object
export const env: EnvironmentConfig = {
  // API Configuration
  euclidGraphqlEndpoint: getEnvVar('EUCLID_GRAPHQL_ENDPOINT', 'https://testnet.api.euclidprotocol.com/graphql'),
  euclidRestEndpoint: getEnvVar('EUCLID_REST_ENDPOINT', 'https://testnet.api.euclidprotocol.com/api/v1'),
  apiTimeout: getEnvVar('API_TIMEOUT', 10000),

  // Development Configuration
  devServerPort: getEnvVar('DEV_SERVER_PORT', 3333),
  devServerHost: getEnvVar('DEV_SERVER_HOST', 'localhost'),
  nodeEnv: getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test',

  // Feature Flags
  features: {
    serviceWorker: getEnvVar('FEATURE_SERVICE_WORKER', true),
    darkMode: getEnvVar('FEATURE_DARK_MODE', true),
    advancedRouting: getEnvVar('FEATURE_ADVANCED_ROUTING', true),
    transactionHistory: getEnvVar('FEATURE_TRANSACTION_HISTORY', true),
    priceAlerts: getEnvVar('FEATURE_PRICE_ALERTS', false),
    limitOrders: getEnvVar('FEATURE_LIMIT_ORDERS', false),
  },

  // Performance Settings
  refreshIntervals: {
    routes: getEnvVar('REFRESH_ROUTES', 30000),
    marketData: getEnvVar('REFRESH_MARKET_DATA', 300000),
    balances: getEnvVar('REFRESH_BALANCES', 60000),
  },
  transactionTimeout: getEnvVar('TRANSACTION_TIMEOUT', 300000),

  // UI Configuration
  ui: {
    defaultSlippage: getEnvVar('DEFAULT_SLIPPAGE', 0.5),
    animationDuration: getEnvVar('ANIMATION_DURATION', 250),
    zIndex: {
      modal: getEnvVar('MODAL_Z_INDEX', 1000),
      tooltip: getEnvVar('TOOLTIP_Z_INDEX', 1070),
      dropdown: getEnvVar('DROPDOWN_Z_INDEX', 1000),
    },
  },

  // Chain Configuration
  defaultChain: getEnvVar('DEFAULT_CHAIN', 'osmosis-1'),
  supportedChains: getEnvVar('SUPPORTED_CHAINS', ['cosmoshub-4', 'osmosis-1', 'juno-1', 'stargaze-1', 'ethereum', 'polygon', 'arbitrum', 'optimism']),

  // Wallet Configuration
  defaultWallet: getEnvVar('DEFAULT_WALLET', 'keplr'),
  supportedWallets: getEnvVar('SUPPORTED_WALLETS', ['keplr', 'metamask', 'walletconnect', 'coinbase']),

  // Logging & Debug
  logLevel: getEnvVar('LOG_LEVEL', 'info') as 'error' | 'warn' | 'info' | 'debug',
  debugMode: getEnvVar('DEBUG_MODE', false),
  enablePerformanceMonitoring: getEnvVar('ENABLE_PERFORMANCE_MONITORING', false),
};

// Utility functions for common environment checks
export const isDevelopment = () => env.nodeEnv === 'development';
export const isProduction = () => env.nodeEnv === 'production';
export const isFeatureEnabled = (feature: keyof typeof env.features) => env.features[feature];

// Log current configuration in development
if (isDevelopment() && env.debugMode) {
  console.log('🌍 Environment Configuration:', env);
}

// Export individual configurations for convenience
export const apiConfig = {
  graphqlEndpoint: env.euclidGraphqlEndpoint,
  restEndpoint: env.euclidRestEndpoint,
  timeout: env.apiTimeout,
};

export const uiConfig = env.ui;
export const featureFlags = env.features;
export const refreshIntervals = env.refreshIntervals;

// Validate required environment variables
const requiredEnvVars = [
  'EUCLID_GRAPHQL_ENDPOINT',
  'EUCLID_REST_ENDPOINT'
];

export function validateEnvironment(): string[] {
  const missing: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!getEnvVar(varName, '')) {
      missing.push(varName);
    }
  }

  return missing;
}

// Initialize environment validation
if (isDevelopment()) {
  const missing = validateEnvironment();
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing);
    console.warn('💡 Copy .env.example to .env and configure your settings');
  }
}
