/**
 * Data Subscription Manager
 *
 * Manages data subscriptions so components can register what data they need,
 * and controllers only fetch data when there are active subscriptions.
 *
 * FULLY INTEGRATED WITH EXISTING ARCHITECTURE:
 * - RequestManager: For caching and deduplication
 * - PollingCoordinator: For intelligent refresh management
 * - LoadingStateManager: For smooth UI transitions
 * - StoreUpdateCoordinator: For preventing UI flickering
 *
 * # USAGE PATTERNS:
 *
 * ## For Components:
 * ```tsx
 * import { dataSubscriptionManager } from '../../../utils/data-subscription-manager';
 *
 * class MyComponent {
 *   private subscriptionId: string | null = null;
 *
 *   componentDidLoad() {
 *     // Subscribe to data when component mounts
 *     this.subscriptionId = dataSubscriptionManager.subscribe('my-component', 'balances');
 *   }
 *
 *   disconnectedCallback() {
 *     // Clean up subscription when component unmounts
 *     if (this.subscriptionId) {
 *       dataSubscriptionManager.unsubscribe(this.subscriptionId);
 *       this.subscriptionId = null;
 *     }
 *   }
 * }
 * ```
 *
 * ## For Controllers:
 * ```tsx
 * import { dataSubscriptionManager } from '../../../utils/data-subscription-manager';
 *
 * class MyController {
 *   private async loadData() {
 *     // Only fetch data if components are subscribed
 *     if (!dataSubscriptionManager.hasSubscriptions('balances')) {
 *       logger.info('Utils', 'Skipping data fetch - no active subscriptions');
 *       return;
 *     }
 *
 *     // Use RequestManager for caching and deduplication
 *     return requestManager.request('data-fetch', async () => {
 *       // Your data fetching logic here
 *       const data = await api.getData();
 *       store.setData(data);
 *       return { success: true };
 *     }, { ttl: 30000 });
 *   }
 *
 *   @Listen('euclid:data:subscribe', { target: 'window' })
 *   async handleDataSubscribe() {
 *     await this.loadData();
 *   }
 * }
 * ```
 *
 * # ARCHITECTURE INTEGRATION:
 *
 * ## Automatic Features:
 * - **Request Deduplication**: Multiple components subscribing to same data won't cause duplicate API calls
 * - **Intelligent Caching**: Data is cached based on subscription type with appropriate TTLs
 * - **Smart Polling**: Uses PollingCoordinator with different intervals for active/background tabs
 * - **Loading States**: Automatically manages loading indicators via LoadingStateManager
 * - **Performance**: Only fetches data when actually needed by visible components
 *
 * ## Data Types Available:
 * - `balances`: User wallet balances across all chains
 * - `transactions`: User transaction history and status
 * - `liquidityPositions`: User liquidity pool positions
 * - `marketData`: Token prices, pools, and market information
 * - `tokenPrices`: Real-time token pricing data
 * - `portfolioValue`: Aggregated portfolio value calculations
 *
 * ## Event System Integration:
 * The subscription manager automatically dispatches events that controllers listen to:
 * - `euclid:user:balances-refresh` → User Data Controller
 * - `euclid:liquidity:positions-refresh` → Liquidity Controller
 * - `euclid:market:refresh-data` → Market Data Controller
 * - `euclid:transaction:track-request` → TX Tracker Controller
 */

import { EUCLID_EVENTS, dispatchEuclidEvent } from './events';
import { requestManager } from './request-manager';
import { pollingCoordinator } from './polling-coordinator';
import { loadingManager } from './loading-state-manager';
import { DEFAULT_CONFIG } from './env';
import { logger } from './logger';

export interface DataSubscription {
  id: string;
  componentId: string;
  dataType: DataType;
  walletAddress?: string;
  chainUID?: string;
  params?: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
}

export type DataType =
  | 'balances'
  | 'transactions'
  | 'liquidityPositions'
  | 'marketData'
  | 'tokenPrices'
  | 'portfolioValue';

class DataSubscriptionManager {
  private subscriptions: Map<string, DataSubscription> = new Map();
  private componentSubscriptions: Map<string, Set<string>> = new Map();
  private dataTypeSubscriptions: Map<DataType, Set<string>> = new Map();
  private pollingTasks: Map<DataType, string> = new Map(); // Track polling task IDs
  private loadingStates: Map<DataType, string> = new Map(); // Track loading state IDs

  /**
   * Subscribe a component to specific data
   */
  subscribe(
    componentId: string,
    dataType: DataType,
    params: {
      walletAddress?: string;
      chainUID?: string;
      [key: string]: unknown;
    } = {}
  ): string {
    const subscriptionId = `${componentId}-${dataType}-${Date.now()}`;

    const subscription: DataSubscription = {
      id: subscriptionId,
      componentId,
      dataType,
      walletAddress: params.walletAddress,
      chainUID: params.chainUID,
      params,
      active: true,
      createdAt: new Date()
    };

    // Store subscription
    this.subscriptions.set(subscriptionId, subscription);

    // Track by component
    if (!this.componentSubscriptions.has(componentId)) {
      this.componentSubscriptions.set(componentId, new Set());
    }
    this.componentSubscriptions.get(componentId)!.add(subscriptionId);

    // Track by data type
    if (!this.dataTypeSubscriptions.has(dataType)) {
      this.dataTypeSubscriptions.set(dataType, new Set());
    }
    this.dataTypeSubscriptions.get(dataType)!.add(subscriptionId);

    logger.info('Utils', `📊 Data subscription added: ${componentId} → ${dataType}`, params);

    // Notify controllers that data is now needed
    this.notifyDataNeeded(dataType, subscription);

    return subscriptionId;
  }

  /**
   * Unsubscribe from specific data
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    // Mark as inactive
    subscription.active = false;

    // Remove from tracking maps
    const componentSubs = this.componentSubscriptions.get(subscription.componentId);
    if (componentSubs) {
      componentSubs.delete(subscriptionId);
      if (componentSubs.size === 0) {
        this.componentSubscriptions.delete(subscription.componentId);
      }
    }

    const dataTypeSubs = this.dataTypeSubscriptions.get(subscription.dataType);
    if (dataTypeSubs) {
      dataTypeSubs.delete(subscriptionId);

      // If no more subscriptions for this data type, notify controllers
      if (dataTypeSubs.size === 0) {
        this.dataTypeSubscriptions.delete(subscription.dataType);
        this.notifyDataNotNeeded(subscription.dataType);
      }
    }

    this.subscriptions.delete(subscriptionId);

    logger.info('Utils', `📊 Data subscription removed: ${subscription.componentId} → ${subscription.dataType}`);
  }

  /**
   * Unsubscribe all subscriptions for a component (when component unmounts)
   */
  unsubscribeComponent(componentId: string): void {
    const componentSubs = this.componentSubscriptions.get(componentId);
    if (!componentSubs) return;

    // Copy the set to avoid modification during iteration
    const subsToRemove = [...componentSubs];
    subsToRemove.forEach(subscriptionId => this.unsubscribe(subscriptionId));

    logger.info('Utils', `📊 All subscriptions removed for component: ${componentId}`);
  }

  /**
   * Check if any component is subscribed to specific data
   */
  hasSubscriptions(dataType: DataType, walletAddress?: string, chainUID?: string): boolean {
    const subscriptions = this.dataTypeSubscriptions.get(dataType);
    if (!subscriptions || subscriptions.size === 0) return false;

    // If no specific wallet/chain filter, return true if any subscriptions exist
    if (!walletAddress && !chainUID) return true;

    // Check if any subscription matches the filters
    for (const subId of subscriptions) {
      const sub = this.subscriptions.get(subId);
      if (!sub?.active) continue;

      const addressMatch = !walletAddress || sub.walletAddress === walletAddress;
      const chainMatch = !chainUID || sub.chainUID === chainUID;

      if (addressMatch && chainMatch) return true;
    }

    return false;
  }

  /**
   * Get all active subscriptions for a data type
   */
  getSubscriptions(dataType: DataType): DataSubscription[] {
    const subscriptionIds = this.dataTypeSubscriptions.get(dataType) || new Set();
    return Array.from(subscriptionIds)
      .map(id => this.subscriptions.get(id))
      .filter(sub => sub?.active) as DataSubscription[];
  }

  /**
   * Get all subscriptions for a component
   */
  getComponentSubscriptions(componentId: string): DataSubscription[] {
    const subscriptionIds = this.componentSubscriptions.get(componentId) || new Set();
    return Array.from(subscriptionIds)
      .map(id => this.subscriptions.get(id))
      .filter(sub => sub?.active) as DataSubscription[];
  }

  /**
   * Notify controllers that data is needed
   * INTEGRATES WITH EXISTING ARCHITECTURE
   */
  private notifyDataNeeded(dataType: DataType, subscription: DataSubscription): void {
    // Start loading state for smooth UI transitions
    const loadingId = `data-${dataType}`;
    this.loadingStates.set(dataType, loadingId);
    loadingManager.startLoading(loadingId, `Loading ${dataType}...`, {
      minLoadingTime: 300,
      showProgress: true
    });

    // Setup polling with existing coordinator
    this.setupDataPolling(dataType, subscription);

    // Emit event to controllers
    const eventName = this.getDataNeededEvent(dataType);
    if (eventName) {
      dispatchEuclidEvent(eventName, {
        dataType,
        subscription,
        action: 'start',
        loadingId
      });
    }
  }

  /**
   * Notify controllers that data is no longer needed
   * INTEGRATES WITH EXISTING ARCHITECTURE
   */
  private notifyDataNotNeeded(dataType: DataType): void {
    // Stop loading state
    const loadingId = this.loadingStates.get(dataType);
    if (loadingId) {
      loadingManager.stopLoading(loadingId);
      this.loadingStates.delete(dataType);
    }

    // Stop polling
    this.stopDataPolling(dataType);

    // Emit event to controllers
    const eventName = this.getDataNeededEvent(dataType);
    if (eventName) {
      dispatchEuclidEvent(eventName, {
        dataType,
        action: 'stop'
      });
    }
  }

  /**
   * Setup intelligent polling using existing PollingCoordinator
   */
  private setupDataPolling(dataType: DataType, subscription: DataSubscription): void {
    const pollingId = `subscription-${dataType}`;

    if (this.pollingTasks.has(dataType)) {
      // Already polling this data type
      return;
    }

    // Get polling intervals based on data type priority
    const intervals = this.getPollingIntervals(dataType);

    // Register with polling coordinator
    pollingCoordinator.register(
      pollingId,
      async () => {
        // Use request manager for caching and deduplication
        const cacheKey = `${dataType}-refresh`;
        await requestManager.request(
          cacheKey,
          async () => {
            // Emit refresh event to controllers
            const refreshEvent = this.getDataNeededEvent(dataType);
            if (refreshEvent) {
              dispatchEuclidEvent(refreshEvent, {
                dataType,
                subscription,
                action: 'refresh'
              });
            }
            return { success: true };
          },
          { ttl: intervals.cacheTTL }
        );
      },
      {
        activeInterval: intervals.active,
        backgroundInterval: intervals.background,
        pauseOnHidden: true
      }
    );

    this.pollingTasks.set(dataType, pollingId);
  }

  /**
   * Stop polling for specific data type
   */
  private stopDataPolling(dataType: DataType): void {
    const pollingId = this.pollingTasks.get(dataType);
    if (pollingId) {
      pollingCoordinator.unregister(pollingId);
      this.pollingTasks.delete(dataType);
    }
  }

  /**
   * Get polling intervals based on data type priority
   * Now uses configuration from env.ts instead of hardcoded values
   */
  private getPollingIntervals(dataType: DataType): {
    active: number;
    background: number;
    cacheTTL: number;
  } {
    // Use the sophisticated configuration from env.ts
    const config = DEFAULT_CONFIG.performance;

    switch (dataType) {
      case 'balances':
        return {
          active: config.polling.active.balances,
          background: config.polling.background.balances,
          cacheTTL: config.cache.balances
        };
      case 'marketData':
        return {
          active: config.polling.active.marketData,
          background: config.polling.background.marketData,
          cacheTTL: config.cache.marketData
        };
      case 'tokenPrices':
        return {
          active: config.polling.active.marketData, // Tokens use marketData polling
          background: config.polling.background.marketData,
          cacheTTL: config.cache.tokens
        };
      case 'liquidityPositions':
        return {
          active: config.polling.active.marketData, // Liquidity uses marketData polling
          background: config.polling.background.marketData,
          cacheTTL: config.cache.marketData
        };
      case 'transactions':
        return {
          active: config.polling.active.balances, // Transactions similar to balances
          background: config.polling.background.balances,
          cacheTTL: config.cache.balances
        };
      case 'portfolioValue':
        return {
          active: config.polling.active.balances, // Portfolio similar to balances
          background: config.polling.background.balances,
          cacheTTL: config.cache.balances
        };
      default:
        return {
          active: config.polling.active.marketData,
          background: config.polling.background.marketData,
          cacheTTL: config.cache.marketData
        };
    }
  }

  /**
   * Map data types to event names
   */
  private getDataNeededEvent(dataType: DataType): string | null {
    switch (dataType) {
      case 'balances': return EUCLID_EVENTS.USER.BALANCES_REFRESH;
      case 'transactions': return EUCLID_EVENTS.TRANSACTION.TRACK_REQUEST;
      case 'liquidityPositions': return EUCLID_EVENTS.LIQUIDITY.POSITIONS_REFRESH;
      case 'marketData': return EUCLID_EVENTS.MARKET.REFRESH_DATA;
      case 'tokenPrices': return EUCLID_EVENTS.MARKET.TOKEN_DETAILS_REQUEST;
      case 'portfolioValue': return EUCLID_EVENTS.USER.REFRESH_DATA;
      default: return null;
    }
  }

  /**
   * Debug: Get all subscription stats
   */
  getStats() {
    const totalSubscriptions = this.subscriptions.size;
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(sub => sub.active).length;
    const componentCount = this.componentSubscriptions.size;
    const dataTypeCount = this.dataTypeSubscriptions.size;

    const dataTypeStats = {};
    for (const [dataType, subs] of this.dataTypeSubscriptions) {
      dataTypeStats[dataType] = subs.size;
    }

    return {
      totalSubscriptions,
      activeSubscriptions,
      componentCount,
      dataTypeCount,
      dataTypeStats,
      components: Array.from(this.componentSubscriptions.keys())
    };
  }
}

// Export singleton instance
export const dataSubscriptionManager = new DataSubscriptionManager();

// Export helper functions for components
export function useDataSubscription(componentId: string, dataType: DataType, params?: Record<string, unknown>) {
  return {
    subscribe: () => dataSubscriptionManager.subscribe(componentId, dataType, params),
    unsubscribe: (id: string) => dataSubscriptionManager.unsubscribe(id),
    unsubscribeAll: () => dataSubscriptionManager.unsubscribeComponent(componentId)
  };
}

export function hasActiveSubscriptions(dataType: DataType, walletAddress?: string, chainUID?: string) {
  return dataSubscriptionManager.hasSubscriptions(dataType, walletAddress, chainUID);
}
