/**
 * Centralized logging utility - NO MORE console.log EVERYWHERE!
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LogConfig {
  level: LogLevel;
  enableEmojis: boolean;
  enableTimestamps: boolean;
  enablePrefixes: boolean;
}

class Logger {
  private config: LogConfig = {
    level: LogLevel.INFO,
    enableEmojis: true,
    enableTimestamps: false,
    enablePrefixes: true
  };

  private emojis = {
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌'
  };

  private prefixes = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR'
  };

  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: LogLevel, component: string, message: string): string {
    let formatted = '';

    if (this.config.enableTimestamps) {
      formatted += `[${new Date().toISOString()}] `;
    }

    if (this.config.enableEmojis) {
      formatted += `${this.emojis[level]} `;
    }

    if (this.config.enablePrefixes) {
      formatted += `[${this.prefixes[level]}] `;
    }

    formatted += `[${component}] ${message}`;
    return formatted;
  }

  debug(component: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, component, message), ...args);
    }
  }

  info(component: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, component, message), ...args);
    }
  }

  warn(component: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, component, message), ...args);
    }
  }

  error(component: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, component, message), ...args);
    }
  }

  // Specific wallet logging methods
  walletConnect(walletType: string, chainUID: string, address: string): void {
    this.info('WalletStore', `Wallet connected: ${walletType} on ${chainUID}`, { address });
  }

  walletDisconnect(walletType: string, chainUID?: string): void {
    this.info('WalletStore', `Wallet disconnected: ${walletType}`, { chainUID });
  }

  walletError(walletType: string, error: string | Error): void {
    this.error('WalletStore', `Wallet error: ${walletType}`, error);
  }

  storeUpdate(storeName: string, action: string, data?: unknown): void {
    this.debug('Store', `${storeName}: ${action}`, data);
  }

  apiCall(endpoint: string, method: string, duration?: number): void {
    this.debug('API', `${method} ${endpoint}${duration ? ` (${duration}ms)` : ''}`, );
  }

  apiError(endpoint: string, error: string | Error): void {
    this.error('API', `Request failed: ${endpoint}`, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Configure based on environment
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
  logger.configure({
    level: LogLevel.WARN,
    enableEmojis: false,
    enableTimestamps: true
  });
} else {
  logger.configure({
    level: LogLevel.DEBUG,
    enableEmojis: true,
    enableTimestamps: false
  });
}
