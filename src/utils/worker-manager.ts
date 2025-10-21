/**
 * Worker manager for data list processing
 * Handles communication with the web worker and provides a clean API
 */

import type { WorkerMessage, WorkerResponse, DataItem, DataType, FilterState } from '../workers/data-list.worker';

export interface WorkerManagerConfig {
  workerPath?: string;
  batchSize?: number;
  debounceTime?: number;
  timeout?: number;
}

export class DataListWorkerManager {
  private worker: Worker | null = null;
  private messageId = 0;
  private pendingMessages = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  private config: Required<WorkerManagerConfig>;
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(config: WorkerManagerConfig = {}) {
    this.config = {
      workerPath: './build/workers/data-list.worker.js',
      batchSize: 50,
      debounceTime: 200,
      timeout: 5000,
      ...config,
    };

    this.initializeWorker();
  }

  private initializeWorker() {
    if (!this.worker) {
      try {
        this.worker = new Worker(this.config.workerPath);
        this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
        this.worker.addEventListener('error', this.handleWorkerError.bind(this));
        console.log('🚀 DataListWorker initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize DataListWorker:', error);
      }
    }
  }

  private handleWorkerMessage(event: MessageEvent<WorkerResponse>) {
    const { id, type, payload } = event.data;
    const pending = this.pendingMessages.get(id);

    if (!pending) {
      console.warn('⚠️ Received response for unknown message ID:', id);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingMessages.delete(id);

    if (type === 'ERROR') {
      pending.reject(new Error(payload.error || 'Unknown worker error'));
    } else {
      if (payload.processingTime !== undefined) {
        console.log(`⚡ Worker processing time: ${payload.processingTime.toFixed(2)}ms`);
      }
      pending.resolve(payload);
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('❌ Worker error:', error);

    // Reject all pending messages
    this.pendingMessages.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker error: ' + error.message));
    });
    this.pendingMessages.clear();

    // Attempt to restart worker
    this.terminateWorker();
    setTimeout(() => {
      this.initializeWorker();
    }, 1000);
  }

  private sendMessage<T = WorkerResponse['payload']>(message: Omit<WorkerMessage, 'id'>): Promise<T> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    const id = `msg_${++this.messageId}`;
    const fullMessage: WorkerMessage = { id, ...message };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingMessages.delete(id);
        reject(new Error('Worker timeout'));
      }, 10000); // 10 second timeout

      this.pendingMessages.set(id, {
        resolve: (value: unknown) => resolve(value as T),
        reject,
        timeout
      });
      this.worker!.postMessage(fullMessage);
    });
  }

  /**
   * Process data with filters and sorting
   */
  async processData(
    data: DataItem[],
    dataType: DataType,
    filterState: FilterState,
    walletAddress?: string
  ): Promise<{
    filteredData: DataItem[];
    totalCount: number;
    processingTime: number;
  }> {
    const result = await this.sendMessage({
      type: 'PROCESS_DATA',
      payload: {
        data,
        dataType,
        filterState,
        walletAddress
      }
    });

    return {
      filteredData: result.filteredData || [],
      totalCount: result.totalCount || 0,
      processingTime: result.processingTime || 0
    };
  }

  /**
   * Get a batch of data for infinite scroll
   */
  async getBatch(
    startIndex: number,
    batchSize?: number
  ): Promise<{
    batchData: DataItem[];
    totalCount: number;
    hasMore: boolean;
    processingTime: number;
  }> {
    const result = await this.sendMessage({
      type: 'GET_BATCH',
      payload: {
        startIndex,
        batchSize: batchSize || this.config.batchSize
      }
    });

    return {
      batchData: result.batchData || [],
      totalCount: result.totalCount || 0,
      hasMore: result.hasMore || false,
      processingTime: result.processingTime || 0
    };
  }

  /**
   * Perform search with debouncing
   */
  async searchDebounced(
    searchQuery: string,
    dataType: DataType,
    debounceKey = 'default'
  ): Promise<{
    filteredData: DataItem[];
    totalCount: number;
    processingTime: number;
  }> {
    return new Promise((resolve, reject) => {
      // Clear existing debounce timer for this key
      const existingTimer = this.debounceTimers.get(debounceKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounce timer
      const timer = setTimeout(async () => {
        try {
          this.debounceTimers.delete(debounceKey);

          const result = await this.sendMessage({
            type: 'SEARCH',
            payload: {
              filterState: {
                search: searchQuery,
                sortBy: '',
                sortOrder: 'asc'
              }
            }
          });

          resolve({
            filteredData: result.filteredData || [],
            totalCount: result.totalCount || 0,
            processingTime: result.processingTime || 0
          });
        } catch (error) {
          reject(error);
        }
      }, this.config.debounceTime);

      this.debounceTimers.set(debounceKey, timer);
    });
  }

  /**
   * Perform sorting
   */
  async sort(
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Promise<{
    filteredData: DataItem[];
    totalCount: number;
    processingTime: number;
  }> {
    const result = await this.sendMessage({
      type: 'SORT',
      payload: {
        filterState: {
          search: '',
          sortBy,
          sortOrder
        }
      }
    });

    return {
      filteredData: result.filteredData || [],
      totalCount: result.totalCount || 0,
      processingTime: result.processingTime || 0
    };
  }

  /**
   * Check if worker is available
   */
  isWorkerAvailable(): boolean {
    return this.worker !== null && this.worker.constructor === Worker;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    pendingMessages: number;
    activeDebounceTimers: number;
  } {
    return {
      pendingMessages: this.pendingMessages.size,
      activeDebounceTimers: this.debounceTimers.size
    };
  }

  /**
   * Terminate the worker
   */
  terminateWorker(): void {
    if (this.worker) {
      // Clear all pending operations
      this.pendingMessages.forEach((pending) => {
        clearTimeout(pending.timeout);
        pending.reject(new Error('Worker terminated'));
      });
      this.pendingMessages.clear();

      // Clear debounce timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();

      // Terminate worker
      this.worker.terminate();
      this.worker = null;
      console.log('🔄 DataListWorker terminated');
    }
  }

  /**
   * Cleanup - call this when component is destroyed
   */
  destroy(): void {
    this.terminateWorker();
  }
}
