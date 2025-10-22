import { Component, h, State } from '@stencil/core';
import { euclidAPI } from '../../../utils/core-api';

interface EndpointInfo {
  name: string;
  type: 'core' | 'lazy';
  category: string;
  method: (...args: unknown[]) => Promise<unknown>;
  params?: string[];
  isLazyLoaded?: boolean;
  moduleSize?: string;
}

@Component({
  tag: 'euclid-api-tester',
  styleUrl: 'euclid-api-tester.css',
  shadow: true,
})
export class EuclidAPITester {
  @State() endpoints: EndpointInfo[] = [];
  @State() selectedEndpoint: EndpointInfo | null = null;
  @State() isLoading = false;
  @State() result: {
    data?: unknown;
    error?: string;
    duration: number;
    timestamp: string;
    lazyLoadTime?: number;
    bundleInfo?: string;
    bundleImpact?: {
      moduleLoaded: boolean;
      moduleName: string;
      estimatedSize: string;
    };
  } | null = null;
  @State() error: string | null = null;
  @State() customParams = '{}';
  @State() selectedCategory = 'all';
  @State() bundleStats: { coreSize: number; lazyModulesLoaded: string[] } = { coreSize: 0, lazyModulesLoaded: [] };

  componentWillLoad() {
    this.discoverEndpoints();
    this.measureBundleSize();
  }

  private measureBundleSize() {
    // Calculate initial bundle size (approximate)
    const scripts = document.querySelectorAll('script');
    let totalSize = 0;
    scripts.forEach(script => {
      if (script.src && script.src.includes('euclid')) {
        // Approximate - in real scenario we'd use Performance API
        totalSize += 50; // KB estimate for core bundle
      }
    });
    this.bundleStats.coreSize = totalSize;
  }

  private discoverEndpoints() {
    const endpoints: EndpointInfo[] = [];

    // Discover Core API methods (our new lazy-loaded API)
    const corePrototype = Object.getPrototypeOf(euclidAPI);
    const coreMethods = Object.getOwnPropertyNames(corePrototype)
      .filter(name => name !== 'constructor' && typeof corePrototype[name] === 'function');

    coreMethods.forEach(methodName => {
      const category = this.categorizeMethod(methodName);
      const isLazyLoaded = this.isLazyLoadedMethod(methodName);

      endpoints.push({
        name: this.formatMethodName(methodName),
        type: isLazyLoaded ? 'lazy' : 'core',
        category,
        method: euclidAPI[methodName].bind(euclidAPI),
        params: this.extractMethodParams(corePrototype[methodName]),
        isLazyLoaded,
        moduleSize: isLazyLoaded ? '~2-5KB' : '~0.1KB'
      });
    });

    this.endpoints = endpoints.sort((a, b) => a.name.localeCompare(b.name));
  }

  private isLazyLoadedMethod(methodName: string): boolean {
    // Methods that trigger lazy loading
    const lazyMethods = [
      'getChains', 'getChainConfig', 'getEvmChainConfig', 'getKeplrConfig', 'getRouterConfig', 'getAllEvmChains',
      'getAllTokens', 'getAllowedDenoms', 'getEscrow', 'getTokenAddress', 'getPartnerFeesCollected', 'getState', 'getVLP',
      'getAllPools', 'getTokenMetadata', 'getTokenById', 'getTokenDenoms', 'getTokenTransfers',
      'getAllChainsRouter', 'getRoute', 'getSimulateSwap', 'getEstimateSwap', 'getSwapTransaction',
      'getAllPoolsVLP', 'getUserPositions', 'getRewards', 'getClaimableRewards',
      'getBalance', 'getUserPositions', 'getStakedAmount',
      'getAllPoolsPool', 'getPoolById', 'getPoolStatistics', 'getPoolHistory',
      'getContractInfo', 'getContractState',
      'buildSwapTransaction', 'buildAddLiquidityTransaction', 'buildRemoveLiquidityTransaction', 'simulateSwap', 'getBalances', 'getTransactionHistory'
    ];

    return lazyMethods.includes(methodName);
  }

  private categorizeMethod(methodName: string): string {
    if (methodName.includes('Chain') || methodName.includes('chain')) return 'Chain';
    if (methodName.includes('Token') || methodName.includes('token')) return 'Token';
    if (methodName.includes('Pool') || methodName.includes('pool')) return 'Pool';
    if (methodName.includes('Route') || methodName.includes('route')) return 'Routing';
    if (methodName.includes('Transaction') || methodName.includes('transaction') || methodName.includes('Tx')) return 'Transaction';
    if (methodName.includes('User') || methodName.includes('user') || methodName.includes('Balance')) return 'User';
    if (methodName.includes('Swap') || methodName.includes('swap')) return 'Swap';
    if (methodName.includes('Liquidity') || methodName.includes('liquidity')) return 'Liquidity';
    return 'Other';
  }

  private formatMethodName(methodName: string): string {
    return methodName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private extractMethodParams(method: (...args: unknown[]) => Promise<unknown>): string[] {
    const funcStr = method.toString();
    const paramMatch = funcStr.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];

    return paramMatch[1]
      .split(',')
      .map(param => param.trim())
      .filter(param => param && !param.startsWith('...'))
      .map(param => param.split(/[=:]/)[0].trim())
      .filter(param => param);
  }

  private get categories(): string[] {
    const cats = new Set(['all']);
    this.endpoints.forEach(endpoint => cats.add(endpoint.category));
    return Array.from(cats).sort();
  }

  private getCategoryCount(category: string): number {
    if (category === 'all') return this.endpoints.length;
    return this.endpoints.filter(endpoint => endpoint.category === category).length;
  }

  private get filteredEndpoints(): EndpointInfo[] {
    if (this.selectedCategory === 'all') return this.endpoints;
    return this.endpoints.filter(endpoint => endpoint.category === this.selectedCategory);
  }

  private async testEndpoint(endpoint: EndpointInfo) {
    if (!endpoint) return;

    this.isLoading = true;
    this.error = null;
    this.result = null;
    this.selectedEndpoint = endpoint;

    const startTime = Date.now();
    let bundleImpact = null;

    try {
      // For lazy endpoints, check if module is already loaded and track loading
      if (endpoint.isLazyLoaded) {
        const moduleName = this.getModuleNameFromEndpoint(endpoint.name);
        const wasAlreadyLoaded = this.bundleStats.lazyModulesLoaded.includes(moduleName);

        // Execute the method (this will trigger lazy loading if needed)
        let params = {};
        try {
          params = JSON.parse(this.customParams);
        } catch {
          // Use empty params if JSON is invalid
        }

        let result;
        const loadStartTime = performance.now();

        if (endpoint.params && endpoint.params.length > 0) {
          const paramValues = endpoint.params.map(paramName => {
            return params[paramName] || this.getDefaultParamValue(paramName);
          });
          result = await endpoint.method(...paramValues);
        } else {
          result = await endpoint.method();
        }

        const loadEndTime = performance.now();
        const loadDuration = loadEndTime - loadStartTime;

        // If it took longer than normal and wasn't already loaded, assume we loaded a module
        const probablyLoadedModule = !wasAlreadyLoaded && loadDuration > 50; // >50ms suggests network/module loading

        if (probablyLoadedModule && !this.bundleStats.lazyModulesLoaded.includes(moduleName)) {
          this.bundleStats.lazyModulesLoaded = [...this.bundleStats.lazyModulesLoaded, moduleName];
          bundleImpact = {
            moduleLoaded: true,
            moduleName,
            estimatedSize: endpoint.moduleSize || '~2-5KB'
          };
        } else {
          bundleImpact = {
            moduleLoaded: false,
            moduleName,
            estimatedSize: wasAlreadyLoaded ? 'Already loaded' : 'From cache'
          };
        }

        const duration = Date.now() - startTime;
        this.result = {
          data: result,
          duration,
          timestamp: new Date().toISOString(),
          bundleImpact
        };

      } else {
        // Non-lazy endpoint - just execute normally
        let params = {};
        try {
          params = JSON.parse(this.customParams);
        } catch {
          // Use empty params if JSON is invalid
        }

        let result;
        if (endpoint.params && endpoint.params.length > 0) {
          const paramValues = endpoint.params.map(paramName => {
            return params[paramName] || this.getDefaultParamValue(paramName);
          });
          result = await endpoint.method(...paramValues);
        } else {
          result = await endpoint.method();
        }

        const duration = Date.now() - startTime;
        this.result = {
          data: result,
          duration,
          timestamp: new Date().toISOString(),
          bundleImpact: null
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.error = error instanceof Error ? error.message : String(error);
      this.result = {
        error: this.error,
        duration,
        timestamp: new Date().toISOString(),
        bundleImpact: null
      };
    } finally {
      this.isLoading = false;
    }
  }  private getModuleNameFromEndpoint(endpointName: string): string {
    // Map endpoint names to their lazy modules
    const name = endpointName.toLowerCase();
    if (name.includes('chain')) return 'chains';
    if (name.includes('token')) return 'tokens';
    if (name.includes('pool')) return 'pools';
    if (name.includes('factory')) return 'factory';
    if (name.includes('router')) return 'router';
    if (name.includes('vlp')) return 'vlp';
    if (name.includes('vcoin')) return 'vcoin';
    if (name.includes('transaction') || name.includes('swap') || name.includes('liquidity')) return 'transactions';
    return 'core';
  }

  private getDefaultParamValue(paramName: string): unknown {
    // Smart defaults based on parameter names
    if (paramName.includes('limit')) return 10;
    if (paramName.includes('offset')) return 0;
    if (paramName.includes('chainUid') || paramName.includes('chain_uid')) return 'osmosis';
    if (paramName.includes('tokenId') || paramName.includes('token_id')) return 'euclid';
    if (paramName.includes('token_in')) return 'euclid';
    if (paramName.includes('token_out')) return 'osmo';
    if (paramName.includes('amount')) return '1000000';
    if (paramName.includes('address')) return 'osmo1example';
    if (paramName.includes('txHash') || paramName.includes('tx_hash')) return '0x123';
    if (paramName.includes('poolId') || paramName.includes('pool_id')) return 'pool123';
    if (paramName.includes('verified')) return true;
    if (paramName.includes('timeframe') || paramName.includes('period')) return '24h';
    return undefined;
  }

  render() {
    return (
      <div class="api-tester">
        <header class="header">
          <h1>🧪 Euclid API Tester</h1>
          <p>Auto-discovered {this.endpoints.length} endpoints from new lazy-loaded core API</p>
        </header>

        <div class="bundle-stats">
          <h3>📦 Bundle Performance</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Core Size:</span>
              <span class="stat-value">{this.bundleStats.coreSize}KB</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Lazy Modules Loaded:</span>
              <span class="stat-value">{this.bundleStats.lazyModulesLoaded.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Modules:</span>
              <span class="stat-value">{this.bundleStats.lazyModulesLoaded.join(', ') || 'None yet'}</span>
            </div>
          </div>
        </div>

        <div class="controls">
          <div class="filter-section">
            <label>Category:</label>
            <select
              onInput={(e) => this.selectedCategory = (e.target as HTMLSelectElement).value}
            >
              {this.categories.map(cat => (
                <option value={cat} selected={this.selectedCategory === cat}>
                  {cat} ({this.getCategoryCount(cat)})
                </option>
              ))}
            </select>
          </div>

          <div class="params-section">
            <label>Custom Parameters (JSON):</label>
            <textarea
              value={this.customParams}
              onInput={(e) => this.customParams = (e.target as HTMLTextAreaElement).value}
              placeholder='{"tokenId": "euclid", "limit": 10}'
              rows={3}
            ></textarea>
          </div>
        </div>

        <div class="content">
          <div class="endpoints-list">
            <h3>Available Endpoints ({this.filteredEndpoints.length})</h3>
            <div class="endpoints-container">
              {this.filteredEndpoints.map(endpoint => (
                <div
                  class={`endpoint-item ${this.selectedEndpoint === endpoint ? 'selected' : ''}`}
                  onClick={() => this.testEndpoint(endpoint)}
                >
                  <div class="endpoint-header">
                    <span class="endpoint-name">{endpoint.name}</span>
                    <span class={`endpoint-type ${endpoint.type}`}>
                      {endpoint.isLazyLoaded ? '🚀 LAZY' : '⚡ CORE'}
                    </span>
                  </div>
                  <div class="endpoint-meta">
                    <span class="category">{endpoint.category}</span>
                    {endpoint.isLazyLoaded && (
                      <span class="lazy-info">Size: {endpoint.moduleSize}</span>
                    )}
                    {endpoint.params && endpoint.params.length > 0 && (
                      <span class="params">Params: {endpoint.params.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div class="results-panel">
            {this.selectedEndpoint ? (
              <div class="selected-endpoint">
                <h3>Testing: {this.selectedEndpoint.name}</h3>
                <div class="endpoint-details">
                  <p><strong>Type:</strong> {this.selectedEndpoint.type}</p>
                  <p><strong>Category:</strong> {this.selectedEndpoint.category}</p>
                  {this.selectedEndpoint.params && this.selectedEndpoint.params.length > 0 && (
                    <p><strong>Parameters:</strong> {this.selectedEndpoint.params.join(', ')}</p>
                  )}
                </div>
              </div>
            ) : null}

            {this.isLoading && (
              <div class="loading">🔄 Testing endpoint...</div>
            )}

            {!this.selectedEndpoint && !this.isLoading && (
              <div class="empty-state">
                <h3>Select an Endpoint</h3>
                <p>Choose an endpoint from the list to test it and see the results</p>
              </div>
            )}

            {this.result && (
              <div class="result">
                <h4>Result</h4>
                <div class="result-meta">
                  <span>Duration: {this.result.duration}ms</span>
                  <span>Time: {new Date(this.result.timestamp).toLocaleTimeString()}</span>
                  {this.result.bundleImpact && (
                    <div class="bundle-impact">
                      <span class="impact-label">Bundle Impact:</span>
                      <span class={`impact-status ${this.result.bundleImpact.moduleLoaded ? 'loaded' : 'cached'}`}>
                        {this.result.bundleImpact.moduleLoaded ? '📦 New Module Loaded' : '⚡ From Cache'}
                      </span>
                      <span class="impact-details">
                        {this.result.bundleImpact.moduleName} ({this.result.bundleImpact.estimatedSize})
                      </span>
                    </div>
                  )}
                </div>
                <pre class="result-data">
                  {JSON.stringify(this.result.data || this.result.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
