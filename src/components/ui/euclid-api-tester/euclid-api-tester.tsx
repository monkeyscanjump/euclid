import { Component, h, State } from '@stencil/core';
import { euclidAPI } from '../../../utils/core-api';
import { categorizeMethod, formatMethodName } from '../../../utils/string-helpers';

interface ParameterInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
  example?: string;
  category: 'chainUid' | 'tokenId' | 'address' | 'amount' | 'options' | 'data' | 'other';
}

interface EndpointInfo {
  name: string;
  type: 'core' | 'lazy';
  category: string;
  method: (...args: unknown[]) => Promise<unknown>;
  params?: string[];
  parametersInfo?: ParameterInfo[];
  isLazyLoaded?: boolean;
  moduleSize?: string;
  complexity: 'zero-param' | 'simple' | 'intermediate' | 'advanced';
  canTestWithoutParams: boolean;
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
      const basicParams = this.extractMethodParams(corePrototype[methodName]);
      const parametersInfo = this.analyzeMethodParameters(methodName, corePrototype[methodName]);
      const complexity = this.determineComplexity(parametersInfo);
      const canTestWithoutParams = this.canTestWithoutParameters(parametersInfo);

      endpoints.push({
        name: this.formatMethodName(methodName),
        type: isLazyLoaded ? 'lazy' : 'core',
        category,
        method: euclidAPI[methodName].bind(euclidAPI),
        params: basicParams,
        parametersInfo,
        isLazyLoaded,
        moduleSize: isLazyLoaded ? '~2-5KB' : '~0.1KB',
        complexity,
        canTestWithoutParams
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
    return categorizeMethod(methodName);
  }

  private formatMethodName(methodName: string): string {
    return formatMethodName(methodName);
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

  /**
   * Comprehensive parameter analysis for each endpoint
   */
  private analyzeMethodParameters(methodName: string, method: (...args: unknown[]) => Promise<unknown>): ParameterInfo[] {
    // Get basic parameter names
    const funcStr = method.toString();
    const paramMatch = funcStr.match(/\(([^)]*)\)/);
    if (!paramMatch || !paramMatch[1].trim()) return [];

    const paramString = paramMatch[1];
    const parameters: ParameterInfo[] = [];

    // Split parameters and analyze each one
    const paramParts = this.parseParameterString(paramString);

    paramParts.forEach(paramPart => {
      const paramInfo = this.analyzeParameter(paramPart, methodName);
      if (paramInfo) {
        parameters.push(paramInfo);
      }
    });

    return parameters;
  }

  private parseParameterString(paramString: string): string[] {
    const params: string[] = [];
    let current = '';
    let braceCount = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < paramString.length; i++) {
      const char = paramString[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      } else if (!inString && char === '{') {
        braceCount++;
      } else if (!inString && char === '}') {
        braceCount--;
      } else if (!inString && char === ',' && braceCount === 0) {
        params.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      params.push(current.trim());
    }

    return params;
  }

  private analyzeParameter(paramPart: string, methodName: string): ParameterInfo | null {
    const trimmed = paramPart.trim();
    if (!trimmed) return null;

    // Extract parameter name (before : or =)
    const nameMatch = trimmed.match(/^([^:=]+)/);
    if (!nameMatch) return null;

    const name = nameMatch[1].trim();

    // Check if parameter is optional (has ? or = default value)
    const isOptional = trimmed.includes('?') || trimmed.includes('=');
    const required = !isOptional;

    // Determine parameter type from context
    const type = this.inferParameterType(name, trimmed, methodName);
    const category = this.categorizeParameter(name);
    const { description, example, defaultValue } = this.getParameterMetadata(name, category, methodName);

    return {
      name,
      type,
      required,
      description,
      example,
      defaultValue,
      category
    };
  }

  private inferParameterType(name: string, paramDeclaration: string, methodName: string): string {
    const lower = name.toLowerCase();
    const declaration = paramDeclaration.toLowerCase();

    // Check explicit TypeScript types first
    if (declaration.includes(': string')) return 'string';
    if (declaration.includes(': number')) return 'number';
    if (declaration.includes(': boolean')) return 'boolean';
    if (declaration.includes(': object')) return 'object';
    if (declaration.includes('[]')) return 'array';

    // Infer from parameter name patterns
    if (lower.includes('chainuid') || lower.includes('chain_uid')) return 'string';
    if (lower.includes('tokenid') || lower.includes('token_id')) return 'string';
    if (lower.includes('address')) return 'string';
    if (lower.includes('amount') || lower.includes('limit') || lower.includes('offset')) return 'number';
    if (lower.includes('options') || lower.includes('request') || lower.includes('data')) return 'object';
    if (lower.includes('enabled') || lower.includes('verified') || lower.includes('show')) return 'boolean';

    // Method-specific inference
    if (methodName.includes('Transaction') && lower.includes('data')) return 'object';
    if (methodName.includes('Balance') && lower.includes('user')) return 'object';

    return 'string'; // Default fallback
  }

  private categorizeParameter(name: string): ParameterInfo['category'] {
    const lower = name.toLowerCase();

    if (lower.includes('chainuid') || lower.includes('chain_uid') || lower.includes('chainid')) return 'chainUid';
    if (lower.includes('tokenid') || lower.includes('token_id')) return 'tokenId';
    if (lower.includes('address') || lower.includes('user')) return 'address';
    if (lower.includes('amount') || lower.includes('value')) return 'amount';
    if (lower.includes('options') || lower.includes('limit') || lower.includes('offset') || lower.includes('timeframe')) return 'options';
    if (lower.includes('data') || lower.includes('request') || lower.includes('transaction')) return 'data';

    return 'other';
  }

  private getParameterMetadata(name: string, category: ParameterInfo['category'], _methodName: string): {
    description?: string;
    example?: string;
    defaultValue?: string;
  } {
    const lower = name.toLowerCase();

    switch (category) {
      case 'chainUid':
        return {
          description: 'Unique identifier for the blockchain',
          example: 'osmosis-1',
          defaultValue: 'osmosis-1'
        };
      case 'tokenId':
        return {
          description: 'Token identifier or contract address',
          example: 'uosmo',
          defaultValue: 'uosmo'
        };
      case 'address':
        return {
          description: 'Wallet or contract address',
          example: 'osmo1abc...xyz',
          defaultValue: 'osmo1example'
        };
      case 'amount':
        return {
          description: 'Numeric amount value',
          example: '1000000',
          defaultValue: '1000000'
        };
      case 'options':
        if (lower.includes('limit')) {
          return {
            description: 'Maximum number of results',
            example: '10',
            defaultValue: '10'
          };
        }
        if (lower.includes('offset')) {
          return {
            description: 'Number of results to skip',
            example: '0',
            defaultValue: '0'
          };
        }
        return {
          description: 'Optional configuration object',
          example: '{}',
          defaultValue: '{}'
        };
      case 'data':
        return {
          description: 'Transaction or request data object',
          example: '{"key": "value"}',
          defaultValue: '{}'
        };
      default:
        return {
          description: 'Parameter value',
          example: 'value'
        };
    }
  }

  private determineComplexity(parameters: ParameterInfo[]): EndpointInfo['complexity'] {
    if (parameters.length === 0) return 'zero-param';

    const requiredParams = parameters.filter(p => p.required);
    const hasComplexTypes = parameters.some(p => p.type === 'object' || p.category === 'data');

    if (requiredParams.length === 0) return 'simple';
    if (requiredParams.length <= 2 && !hasComplexTypes) return 'intermediate';
    return 'advanced';
  }

  private canTestWithoutParameters(parameters: ParameterInfo[]): boolean {
    return parameters.length === 0 || parameters.every(p => !p.required);
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

        // Enhanced parameter handling with validation and auto-population
        let params = {};
        try {
          params = JSON.parse(this.customParams);
        } catch {
          // Use empty params if JSON is invalid
        }

        let result;
        const loadStartTime = performance.now();

        // Use enhanced parameter info for smarter parameter handling
        if (endpoint.parametersInfo && endpoint.parametersInfo.length > 0) {
          const { paramValues, validationErrors } = this.prepareParameters(endpoint.parametersInfo, params);

          if (validationErrors.length > 0) {
            throw new Error(`Parameter validation failed: ${validationErrors.join(', ')}`);
          }

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
        // Non-lazy endpoint - enhanced parameter handling
        let params = {};
        try {
          params = JSON.parse(this.customParams);
        } catch {
          // Use empty params if JSON is invalid
        }

        let result;
        if (endpoint.parametersInfo && endpoint.parametersInfo.length > 0) {
          const { paramValues, validationErrors } = this.prepareParameters(endpoint.parametersInfo, params);

          if (validationErrors.length > 0) {
            throw new Error(`Parameter validation failed: ${validationErrors.join(', ')}`);
          }

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

  private getComplexityLabel(complexity: EndpointInfo['complexity']): string {
    switch (complexity) {
      case 'zero-param': return '🟢 Zero Parameters';
      case 'simple': return '🟡 Simple (Optional Only)';
      case 'intermediate': return '🟠 Intermediate';
      case 'advanced': return '🔴 Advanced';
      default: return complexity;
    }
  }

  private renderParameterSummary(parameters: ParameterInfo[]) {
    const required = parameters.filter(p => p.required);
    const optional = parameters.filter(p => !p.required);

    const summary = [];

    if (required.length > 0) {
      summary.push(
        <span class="param-count required">
          {required.length} required
        </span>
      );
    }

    if (optional.length > 0) {
      summary.push(
        <span class="param-count optional">
          {optional.length} optional
        </span>
      );
    }

    return summary;
  }

  private prepareParameters(parametersInfo: ParameterInfo[], userParams: Record<string, unknown>): {
    paramValues: unknown[];
    validationErrors: string[];
  } {
    const paramValues: unknown[] = [];
    const validationErrors: string[] = [];

    parametersInfo.forEach(paramInfo => {
      let value = userParams[paramInfo.name];

      // If no user value provided, use default or validate requirement
      if (value === undefined || value === null || value === '') {
        if (paramInfo.required) {
          // For required parameters, try to use default value or report error
          if (paramInfo.defaultValue !== undefined) {
            value = this.convertParameterValue(paramInfo.defaultValue, paramInfo.type);
          } else {
            validationErrors.push(`Required parameter '${paramInfo.name}' is missing`);
            return;
          }
        } else {
          // For optional parameters, use default value or undefined
          value = paramInfo.defaultValue ? this.convertParameterValue(paramInfo.defaultValue, paramInfo.type) : undefined;
        }
      } else {
        // Validate and convert user-provided value
        try {
          value = this.convertParameterValue(value, paramInfo.type);
        } catch (error) {
          validationErrors.push(`Invalid value for parameter '${paramInfo.name}': ${error instanceof Error ? error.message : 'unknown error'}`);
          return;
        }
      }

      paramValues.push(value);
    });

    return { paramValues, validationErrors };
  }

  private convertParameterValue(value: unknown, expectedType: string): unknown {
    if (value === undefined || value === null) return value;

    const stringValue = String(value);

    switch (expectedType) {
      case 'string': {
        return stringValue;
      }
      case 'number': {
        const numValue = Number(stringValue);
        if (isNaN(numValue)) {
          throw new Error(`Cannot convert "${stringValue}" to number`);
        }
        return numValue;
      }
      case 'boolean': {
        if (typeof value === 'boolean') return value;
        const lowerStr = stringValue.toLowerCase();
        if (lowerStr === 'true' || lowerStr === '1') return true;
        if (lowerStr === 'false' || lowerStr === '0') return false;
        throw new Error(`Cannot convert "${stringValue}" to boolean`);
      }
      case 'object': {
        if (typeof value === 'object') return value;
        try {
          return JSON.parse(stringValue);
        } catch {
          throw new Error(`Cannot parse "${stringValue}" as JSON object`);
        }
      }
      case 'array': {
        if (Array.isArray(value)) return value;
        try {
          const parsed = JSON.parse(stringValue);
          if (!Array.isArray(parsed)) {
            throw new Error('Parsed value is not an array');
          }
          return parsed;
        } catch {
          throw new Error(`Cannot parse "${stringValue}" as JSON array`);
        }
      }
      default: {
        return stringValue;
      }
    }
  }

  private getZeroParameterEndpoints(): EndpointInfo[] {
    return this.endpoints.filter(endpoint =>
      endpoint.parametersInfo && endpoint.parametersInfo.length === 0
    );
  }

  private getParameterPlaceholder(endpoint: EndpointInfo): string {
    if (!endpoint.parametersInfo || endpoint.parametersInfo.length === 0) {
      return '{}';
    }

    const example: Record<string, unknown> = {};
    endpoint.parametersInfo.forEach(param => {
      if (param.defaultValue !== undefined) {
        example[param.name] = param.defaultValue;
      } else if (param.example) {
        example[param.name] = param.example;
      } else {
        switch (param.type) {
          case 'chainUid':
            example[param.name] = 'cosmoshub-4';
            break;
          case 'tokenId':
            example[param.name] = 'uatom';
            break;
          case 'address':
            example[param.name] = 'cosmos1...';
            break;
          case 'number':
            example[param.name] = 10;
            break;
          case 'boolean':
            example[param.name] = true;
            break;
          default:
            example[param.name] = 'value';
        }
      }
    });

    return JSON.stringify(example, null, 2);
  }

  render() {
    return (
      <div class="api-tester">
        {/* Header */}
        <header class="api-header">
          <div class="title-section">
            <h1>🧪 Euclid API Tester</h1>
            <div class="stats-badges">
              <span class="badge">📊 {this.endpoints.length} endpoints</span>
              <span class="badge">🚀 {this.bundleStats.lazyModulesLoaded.length} loaded</span>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <section class="quick-actions">
          <h2>⚡ Quick Test (Zero Parameters)</h2>
          <div class="quick-buttons">
            {this.getZeroParameterEndpoints().slice(0, 6).map(endpoint => (
              <button
                key={endpoint.name}
                class="quick-btn"
                onClick={() => this.testEndpoint(endpoint)}
                disabled={this.isLoading}
              >
                <span class="btn-icon">🚀</span>
                <span class="btn-text">{endpoint.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Main Layout */}
        <div class="main-layout">
          {/* Left Sidebar - Endpoint Browser */}
          <aside class="sidebar">
            <div class="sidebar-header">
              <h3>📚 Endpoints</h3>
              <div class="filter-control">
                <select
                  onChange={(e) => this.selectedCategory = (e.target as HTMLSelectElement).value}
                >
                  {this.categories.map(category => (
                    <option value={category} selected={this.selectedCategory === category}>
                      {category} ({this.getCategoryCount(category)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div class="endpoints-browser">
              {this.filteredEndpoints.map(endpoint => (
                <div
                  key={endpoint.name}
                  class={`endpoint-card ${this.selectedEndpoint?.name === endpoint.name ? 'active' : ''}`}
                  onClick={() => this.selectedEndpoint = endpoint}
                >
                  <div class="card-header">
                    <h4 class="endpoint-title">{endpoint.name}</h4>
                    <div class="card-badges">
                      <span class={`type-badge ${endpoint.type}`}>{endpoint.type}</span>
                      {endpoint.isLazyLoaded && <span class="lazy-badge">⚡</span>}
                    </div>
                  </div>
                  <div class="card-meta">
                    <span class="category">{endpoint.category}</span>
                    <span class={`param-indicator ${endpoint.parametersInfo.length === 0 ? 'zero' : 'has-params'}`}>
                      {endpoint.parametersInfo.length === 0
                        ? '🟢 Ready'
                        : `${endpoint.parametersInfo.length} param${endpoint.parametersInfo.length > 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content - Endpoint Details & Testing */}
          <main class="content-area">
            {this.selectedEndpoint ? (
              <div class="endpoint-workspace">
                {/* Endpoint Header */}
                <div class="workspace-header">
                  <div class="endpoint-info">
                    <h2>{this.selectedEndpoint.name}</h2>
                    <div class="info-badges">
                      <span class={`type-badge ${this.selectedEndpoint.type}`}>
                        {this.selectedEndpoint.type}
                      </span>
                      <span class="category-badge">{this.selectedEndpoint.category}</span>
                      {this.selectedEndpoint.isLazyLoaded && (
                        <span class="lazy-badge">⚡ Lazy Loading</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parameters Section */}
                <div class="parameters-section">
                  {this.selectedEndpoint.parametersInfo.length > 0 ? (
                    <div class="has-parameters">
                      <h3>🔧 Parameters ({this.selectedEndpoint.parametersInfo.length})</h3>
                      <div class="parameters-grid">
                        {this.selectedEndpoint.parametersInfo.map(param => (
                          <div key={param.name} class="param-card">
                            <div class="param-header">
                              <span class="param-name">{param.name}</span>
                              <div class="param-badges">
                                <span class={`required-badge ${param.required ? 'required' : 'optional'}`}>
                                  {param.required ? 'Required' : 'Optional'}
                                </span>
                                <span class="type-badge">{param.type}</span>
                              </div>
                            </div>
                            {param.defaultValue && (
                              <div class="param-default">
                                <strong>Default:</strong> <code>{JSON.stringify(param.defaultValue)}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div class="parameter-input-section">
                        <label class="input-label">
                          <span>🛠️ Custom Parameters (JSON)</span>
                        </label>
                        <textarea
                          class="parameter-textarea"
                          value={this.customParams}
                          onInput={(e) => this.customParams = (e.target as HTMLTextAreaElement).value}
                          placeholder={this.getParameterPlaceholder(this.selectedEndpoint)}
                          rows={6}
                        />
                      </div>
                    </div>
                  ) : (
                    <div class="no-parameters">
                      <div class="no-params-message">
                        <span class="icon">🎯</span>
                        <h3>Ready to Test!</h3>
                        <p>This endpoint requires no parameters and can be tested immediately.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Button */}
                <div class="test-action">
                  <button
                    class={`test-button ${this.isLoading ? 'loading' : ''}`}
                    onClick={() => this.testEndpoint(this.selectedEndpoint)}
                    disabled={this.isLoading}
                  >
                    {this.isLoading ? (
                      <span><span class="spinner">⏳</span> Testing...</span>
                    ) : (
                      <span><span class="icon">🧪</span> Test {this.selectedEndpoint.name}</span>
                    )}
                  </button>
                </div>

                {/* Results Section */}
                {(this.result || this.error) && (
                  <div class="results-section">
                    <div class="results-header">
                      <h3>{this.error ? '❌ Error' : '📋 Results'}</h3>
                      {this.result && (
                        <div class="result-meta">
                          <span class="duration">⏱️ {this.result.duration}ms</span>
                          {this.result.bundleImpact && (
                            <span class={`bundle-info ${this.result.bundleImpact.moduleLoaded ? 'loaded' : 'cached'}`}>
                              📦 {this.result.bundleImpact.moduleLoaded ? 'Loaded' : 'Cached'}: {this.result.bundleImpact.moduleName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div class="results-content">
                      <pre class="json-output">
                        {JSON.stringify(this.result?.data || this.result?.error || this.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div class="empty-workspace">
                <div class="empty-message">
                  <span class="empty-icon">👈</span>
                  <h2>Select an Endpoint</h2>
                  <p>Choose an endpoint from the sidebar to see its details and test it.</p>
                  <div class="quick-hint">
                    <p><strong>💡 Tip:</strong> Try the quick test buttons above for instant results!</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }
}
