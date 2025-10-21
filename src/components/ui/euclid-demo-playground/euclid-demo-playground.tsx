import { Component, Prop, h, State, Element, Watch } from '@stencil/core';
import type { DataType, DisplayMode } from '../../core/euclid-data-list/types';
import { DEFAULT_CONFIG, ENVIRONMENT_PRESETS } from '../../../utils/env';

type PropValue = string | number | boolean;

interface ComponentDemo {
  id: string;
  name: string;
  description: string;
  category: string;
  tagName: string;
  defaultProps: Record<string, PropValue>;
  propDefinitions: PropDefinition[];
}

interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text';
  defaultValue: PropValue;
  description?: string;
  options?: { value: PropValue; label: string }[];
  min?: number;
  max?: number;
}

@Component({
  tag: 'euclid-demo-playground',
  styleUrl: 'euclid-demo-playground.css',
  shadow: true,
})
export class EuclidDemoPlayground {
  @Element() el!: HTMLElement;

  @Prop() selectedDemo: string = 'data-list-tokens';
  @Prop() environment: 'mainnet' | 'testnet' | 'devnet' = 'testnet';

  @State() activeTab: string = 'data-list-tokens';
  @State() currentProps: Record<string, PropValue> = {};
  @State() showCode: boolean = false;

  private componentDemos: ComponentDemo[] = [
    {
      id: 'data-list-tokens',
      name: 'Data List - Tokens',
      description: 'Interactive token list with search, filtering, and infinite scroll',
      category: 'Data Display',
      tagName: 'euclid-data-list',
      defaultProps: {
        dataType: 'tokens',
        displayMode: 'list-item',
        cardTitle: 'Available Tokens',
        itemsPerPage: 10,
        infiniteScroll: true,
        searchable: true,
        sortable: true,
        showStats: true,
        enableWorker: true,
        filterable: true,
        selectable: true,
        loading: false,
        maxItems: 1000,
        infiniteScrollTriggerItems: 3,
        infiniteScrollThreshold: 0.1,
        useParentScroll: false,
        showFields: '',
        walletAddress: ''
      },
      propDefinitions: [
        {
          name: 'dataType',
          type: 'select',
          defaultValue: 'tokens',
          description: 'Type of data to display',
          options: [
            { value: 'tokens', label: 'Tokens' },
            { value: 'pools', label: 'Pools' },
            { value: 'chains', label: 'Chains' }
          ]
        },
        {
          name: 'displayMode',
          type: 'select',
          defaultValue: 'list-item',
          description: 'How to display the items',
          options: [
            { value: 'card', label: 'Card View' },
            { value: 'list-item', label: 'List Item' },
            { value: 'compact', label: 'Compact' }
          ]
        },
        {
          name: 'cardTitle',
          type: 'string',
          defaultValue: 'Available Tokens',
          description: 'Title displayed at the top of the component'
        },
        {
          name: 'itemsPerPage',
          type: 'number',
          defaultValue: 10,
          description: 'Number of items per page',
          min: 1,
          max: 100
        },
        {
          name: 'infiniteScroll',
          type: 'boolean',
          defaultValue: true,
          description: 'Enable infinite scrolling instead of pagination'
        },
        {
          name: 'searchable',
          type: 'boolean',
          defaultValue: true,
          description: 'Show search input'
        },
        {
          name: 'sortable',
          type: 'boolean',
          defaultValue: true,
          description: 'Enable sorting controls'
        },
        {
          name: 'filterable',
          type: 'boolean',
          defaultValue: true,
          description: 'Enable filtering options'
        },
        {
          name: 'showStats',
          type: 'boolean',
          defaultValue: true,
          description: 'Show statistics and counts'
        },
        {
          name: 'enableWorker',
          type: 'boolean',
          defaultValue: true,
          description: 'Use web worker for data processing'
        },
        {
          name: 'selectable',
          type: 'boolean',
          defaultValue: true,
          description: 'Allow item selection'
        },
        {
          name: 'loading',
          type: 'boolean',
          defaultValue: false,
          description: 'Show loading state'
        },
        {
          name: 'useParentScroll',
          type: 'boolean',
          defaultValue: false,
          description: 'Use parent element for scroll detection'
        },
        {
          name: 'maxItems',
          type: 'number',
          defaultValue: 1000,
          description: 'Maximum number of items to display',
          min: 1,
          max: 10000
        },
        {
          name: 'infiniteScrollTriggerItems',
          type: 'number',
          defaultValue: 3,
          description: 'Items from bottom to trigger load more',
          min: 1,
          max: 20
        }
      ]
    },
    {
      id: 'swap-card',
      name: 'Swap Card',
      description: 'Token swap interface with advanced options',
      category: 'Trading',
      tagName: 'euclid-swap-card',
      defaultProps: {
        cardTitle: 'Swap Tokens',
        showAdvanced: true,
        loading: false,
        disabled: false,
        walletAddress: '',
        defaultSlippage: 0.5
      },
      propDefinitions: [
        {
          name: 'cardTitle',
          type: 'string',
          defaultValue: 'Swap Tokens',
          description: 'Title of the swap card'
        },
        {
          name: 'showAdvanced',
          type: 'boolean',
          defaultValue: true,
          description: 'Show advanced trading options'
        },
        {
          name: 'loading',
          type: 'boolean',
          defaultValue: false,
          description: 'Show loading state'
        },
        {
          name: 'disabled',
          type: 'boolean',
          defaultValue: false,
          description: 'Disable the swap interface'
        },
        {
          name: 'walletAddress',
          type: 'string',
          defaultValue: '',
          description: 'Connected wallet address'
        },
        {
          name: 'defaultSlippage',
          type: 'number',
          defaultValue: 0.5,
          description: 'Default slippage tolerance',
          min: 0.1,
          max: 10
        }
      ]
    },
    {
      id: 'liquidity-card',
      name: 'Liquidity Card',
      description: 'Add/remove liquidity interface',
      category: 'Trading',
      tagName: 'euclid-liquidity-card',
      defaultProps: {
        cardTitle: 'Manage Liquidity',
        mode: 'add',
        loading: false,
        disabled: false,
        walletAddress: '',
        defaultSlippage: 0.5
      },
      propDefinitions: [
        {
          name: 'cardTitle',
          type: 'string',
          defaultValue: 'Manage Liquidity',
          description: 'Title of the liquidity card'
        },
        {
          name: 'mode',
          type: 'select',
          defaultValue: 'add',
          description: 'Liquidity operation mode',
          options: [
            { value: 'add', label: 'Add Liquidity' },
            { value: 'remove', label: 'Remove Liquidity' }
          ]
        },
        {
          name: 'loading',
          type: 'boolean',
          defaultValue: false,
          description: 'Show loading state'
        },
        {
          name: 'disabled',
          type: 'boolean',
          defaultValue: false,
          description: 'Disable the liquidity interface'
        },
        {
          name: 'walletAddress',
          type: 'string',
          defaultValue: '',
          description: 'Connected wallet address'
        },
        {
          name: 'defaultSlippage',
          type: 'number',
          defaultValue: 0.5,
          description: 'Default slippage tolerance',
          min: 0.1,
          max: 10
        }
      ]
    },
    {
      id: 'portfolio-overview',
      name: 'Portfolio Overview',
      description: 'Portfolio balance and position tracking',
      category: 'Portfolio',
      tagName: 'euclid-portfolio-overview',
      defaultProps: {
        cardTitle: 'Portfolio Overview',
        showAnalytics: true,
        loading: false,
        walletAddress: '',
        timePeriod: '1W'
      },
      propDefinitions: [
        {
          name: 'cardTitle',
          type: 'string',
          defaultValue: 'Portfolio Overview',
          description: 'Title of the portfolio card'
        },
        {
          name: 'showAnalytics',
          type: 'boolean',
          defaultValue: true,
          description: 'Show detailed analytics'
        },
        {
          name: 'loading',
          type: 'boolean',
          defaultValue: false,
          description: 'Show loading state'
        },
        {
          name: 'walletAddress',
          type: 'string',
          defaultValue: '',
          description: 'Wallet address to track'
        },
        {
          name: 'timePeriod',
          type: 'select',
          defaultValue: '1W',
          description: 'Time period for analytics',
          options: [
            { value: '1D', label: '1 Day' },
            { value: '1W', label: '1 Week' },
            { value: '1M', label: '1 Month' },
            { value: '3M', label: '3 Months' },
            { value: '1Y', label: '1 Year' },
            { value: 'ALL', label: 'All Time' }
          ]
        }
      ]
    },
    {
      id: 'core-provider-config',
      name: 'Core Provider - Configuration',
      description: 'Configure API endpoints, environment, and feature flags for the entire component system',
      category: 'Core',
      tagName: 'euclid-core-provider',
      defaultProps: {
        environment: 'testnet',
        graphqlEndpoint: '',
        restEndpoint: '',
        apiTimeout: 10000,
        defaultSlippage: 0.5,
        refreshIntervals: JSON.stringify({
          marketData: 30000,
          balances: 60000,
          routes: 300000
        }),
        featureFlags: JSON.stringify({
          darkMode: true,
          transactionHistory: true,
          advancedRouting: true
        }),
        supportedChains: 'cosmoshub-4,osmosis-1,juno-1,stargaze-1,ethereum,polygon',
        supportedWallets: 'keplr,metamask,walletconnect,coinbase',
        defaultChain: 'osmosis-1',
        defaultWallet: 'keplr'
      },
      propDefinitions: [
        {
          name: 'environment',
          type: 'select',
          defaultValue: 'testnet',
          description: 'Environment preset for API endpoints',
          options: [
            { value: 'mainnet', label: 'Mainnet' },
            { value: 'testnet', label: 'Testnet' },
            { value: 'devnet', label: 'Devnet' }
          ]
        },
        {
          name: 'graphqlEndpoint',
          type: 'text',
          defaultValue: '',
          description: 'Custom GraphQL endpoint (overrides environment preset)'
        },
        {
          name: 'restEndpoint',
          type: 'text',
          defaultValue: '',
          description: 'Custom REST endpoint (overrides environment preset)'
        },
        {
          name: 'apiTimeout',
          type: 'number',
          defaultValue: 10000,
          description: 'API request timeout in milliseconds'
        },
        {
          name: 'defaultSlippage',
          type: 'number',
          defaultValue: 0.5,
          description: 'Default slippage tolerance percentage'
        },
        {
          name: 'defaultChain',
          type: 'select',
          defaultValue: 'osmosis-1',
          description: 'Default blockchain network',
          options: [
            { value: 'cosmoshub-4', label: 'Cosmos Hub' },
            { value: 'osmosis-1', label: 'Osmosis' },
            { value: 'juno-1', label: 'Juno' },
            { value: 'stargaze-1', label: 'Stargaze' },
            { value: 'ethereum', label: 'Ethereum' },
            { value: 'polygon', label: 'Polygon' }
          ]
        },
        {
          name: 'defaultWallet',
          type: 'select',
          defaultValue: 'keplr',
          description: 'Default wallet adapter',
          options: [
            { value: 'keplr', label: 'Keplr' },
            { value: 'metamask', label: 'MetaMask' },
            { value: 'walletconnect', label: 'WalletConnect' },
            { value: 'coinbase', label: 'Coinbase Wallet' }
          ]
        }
      ]
    }
  ];

  @Watch('selectedDemo')
  onSelectedDemoChange(newDemo: string) {
    this.activeTab = newDemo;
    this.saveActiveTabToStorage();
    this.initializeProps();
  }

  componentWillLoad() {
    // Load saved active tab or use default
    this.activeTab = this.loadActiveTabFromStorage();
    this.initializeProps();
  }

  private getStorageKey(demoId: string): string {
    return `euclid-demo-props-${demoId}`;
  }

  private getActiveTabStorageKey(): string {
    return 'euclid-demo-active-tab';
  }

  private saveActiveTabToStorage() {
    try {
      localStorage.setItem(this.getActiveTabStorageKey(), this.activeTab);
    } catch (error) {
      console.warn('Failed to save active tab to localStorage:', error);
    }
  }

  private loadActiveTabFromStorage(): string {
    try {
      const savedTab = localStorage.getItem(this.getActiveTabStorageKey());
      if (savedTab && this.componentDemos.find(d => d.id === savedTab)) {
        return savedTab;
      }
    } catch (error) {
      console.warn('Failed to load active tab from localStorage:', error);
    }

    // Fallback to prop or first demo
    return this.selectedDemo || this.componentDemos[0]?.id || 'data-list-tokens';
  }

  private savePropsToStorage() {
    try {
      const storageKey = this.getStorageKey(this.activeTab);
      localStorage.setItem(storageKey, JSON.stringify(this.currentProps));
    } catch (error) {
      console.warn('Failed to save props to localStorage:', error);
    }
  }

  private loadPropsFromStorage(demo: ComponentDemo): Record<string, PropValue> {
    try {
      const storageKey = this.getStorageKey(demo.id);
      const savedProps = localStorage.getItem(storageKey);

      if (savedProps) {
        const parsedProps = JSON.parse(savedProps);
        // Merge with defaults to ensure all required props exist
        return { ...demo.defaultProps, ...parsedProps };
      }
    } catch (error) {
      console.warn('Failed to load props from localStorage:', error);
    }

    // Fallback to defaults
    return { ...demo.defaultProps };
  }

  private initializeProps() {
    const demo = this.componentDemos.find(d => d.id === this.activeTab);
    if (demo) {
      this.currentProps = this.loadPropsFromStorage(demo);
    }
  }

  private getCurrentDemo(): ComponentDemo | undefined {
    return this.componentDemos.find(d => d.id === this.activeTab);
  }

  private updateProp(propName: string, value: PropValue) {
    this.currentProps = {
      ...this.currentProps,
      [propName]: value
    };

    // Save to localStorage immediately after updating
    this.savePropsToStorage();
  }

  private resetToDefaults() {
    const demo = this.getCurrentDemo();
    if (demo) {
      this.currentProps = { ...demo.defaultProps };
      this.savePropsToStorage();
    }
  }

  private generateComponentCode(): string {
    const demo = this.getCurrentDemo();
    if (!demo) return '';

    const props = Object.entries(this.currentProps)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : `${key}="false"`;
        }
        return `${key}="${value}"`;
      })
      .join('\n    ');

    return `<${demo.tagName}\n    ${props}>\n</${demo.tagName}>`;
  }

  private renderControlsPanel() {
    const demo = this.getCurrentDemo();
    if (!demo) return null;

    return (
      <div class="controls-panel">
        {/* Component Selector */}
        <div class="component-selector">
          <label class="selector-label">
            <span class="selector-title">Component</span>
            <select
              class="component-dropdown"
              onChange={(e) => {
                this.activeTab = (e.target as HTMLSelectElement).value;
                this.saveActiveTabToStorage();
                this.initializeProps();
              }}
            >
              {this.componentDemos.map(demo => (
                <option value={demo.id} selected={this.activeTab === demo.id}>
                  {demo.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div class="controls-header">
          <h3>Component Properties</h3>
          <div class="controls-actions">
            <button
              class="reset-button"
              onClick={() => this.resetToDefaults()}
              title="Reset to default values"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
            <button
              class={`code-toggle ${this.showCode ? 'active' : ''}`}
              onClick={() => this.showCode = !this.showCode}
              title={this.showCode ? 'Hide Code' : 'Show Code'}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </button>
          </div>
        </div>

        {this.showCode && (
          <div class="code-display">
            <pre><code>{this.generateComponentCode()}</code></pre>
          </div>
        )}

        <div class="controls-grid">
          {demo.propDefinitions.map(prop => this.renderControl(prop))}
        </div>

        {/* GitHub Link */}
        <div class="github-link">
          <a href="https://github.com/monkeyscanjump/euclid" target="_blank" rel="noopener noreferrer" class="github-link-anchor">
            <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span class="github-text">/ monkeyscanjump/euclid</span>
          </a>
        </div>
      </div>
    );
  }

  private renderControl(prop: PropDefinition) {
    const value = this.currentProps[prop.name];

    switch (prop.type) {
      case 'boolean':
        return (
          <div class="control-item">
            <label class="control-label">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => this.updateProp(prop.name, (e.target as HTMLInputElement).checked)}
              />
              <div class="control-text">
                <span class="control-name">{prop.name}</span>
                {prop.description && <div class="control-description">{prop.description}</div>}
              </div>
            </label>
          </div>
        );

      case 'number':
        return (
          <div class="control-item">
            <label class="control-label">
              <span class="control-name">{prop.name}</span>
              <input
                type="number"
                value={String(value)}
                min={prop.min}
                max={prop.max}
                onChange={(e) => this.updateProp(prop.name, parseInt((e.target as HTMLInputElement).value))}
              />
            </label>
            {prop.description && <div class="control-description">{prop.description}</div>}
          </div>
        );

      case 'string':
        return (
          <div class="control-item">
            <label class="control-label">
              <span class="control-name">{prop.name}</span>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => this.updateProp(prop.name, (e.target as HTMLInputElement).value)}
              />
            </label>
            {prop.description && <div class="control-description">{prop.description}</div>}
          </div>
        );

      case 'select':
        return (
          <div class="control-item">
            <label class="control-label">
              <span class="control-name">{prop.name}</span>
              <select
                onChange={(e) => this.updateProp(prop.name, (e.target as HTMLSelectElement).value)}
              >
                {prop.options?.map(option => (
                  <option value={String(option.value)} selected={value === option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {prop.description && <div class="control-description">{prop.description}</div>}
          </div>
        );

      default:
        return null;
    }
  }

  private renderDemo() {
    const demo = this.getCurrentDemo();
    if (!demo) return null;

    // Render using JSX with current props
    const props = this.currentProps;

    let componentElement;
    switch (demo.tagName) {
      case 'euclid-data-list':
        componentElement = (
          <euclid-data-list
            key={`${demo.id}-${JSON.stringify(props)}`}
            dataType={props.dataType as DataType || 'tokens'}
            displayMode={props.displayMode as DisplayMode || 'list-item'}
            cardTitle={String(props.cardTitle || 'Available Tokens')}
            itemsPerPage={Number(props.itemsPerPage || 10)}
            infiniteScroll={Boolean(props.infiniteScroll)}
            searchable={Boolean(props.searchable)}
            sortable={Boolean(props.sortable)}
            filterable={Boolean(props.filterable)}
            showStats={Boolean(props.showStats)}
            enableWorker={Boolean(props.enableWorker)}
            selectable={Boolean(props.selectable)}
            loading={Boolean(props.loading)}
            useParentScroll={Boolean(props.useParentScroll)}
            maxItems={Number(props.maxItems || 1000)}
            infiniteScrollTriggerItems={Number(props.infiniteScrollTriggerItems || 3)}
            showFields={String(props.showFields || '')}
            walletAddress={String(props.walletAddress || '')}
          />
        );
        break;

      case 'euclid-swap-card':
        componentElement = (
          <euclid-swap-card
            key={`${demo.id}-${JSON.stringify(props)}`}
            cardTitle={String(props.cardTitle || 'Swap Tokens')}
            showAdvanced={Boolean(props.showAdvanced)}
            loading={Boolean(props.loading)}
            disabled={Boolean(props.disabled)}
            walletAddress={String(props.walletAddress || '')}
          />
        );
        break;

      case 'euclid-liquidity-card':
        componentElement = (
          <euclid-liquidity-card
            key={`${demo.id}-${JSON.stringify(props)}`}
            cardTitle={String(props.cardTitle || 'Manage Liquidity')}
            mode={props.mode as 'add' | 'remove' || 'add'}
            loading={Boolean(props.loading)}
            disabled={Boolean(props.disabled)}
            walletAddress={String(props.walletAddress || '')}
          />
        );
        break;

      case 'euclid-portfolio-overview':
        componentElement = (
          <euclid-portfolio-overview
            key={`${demo.id}-${JSON.stringify(props)}`}
            cardTitle={String(props.cardTitle || 'Portfolio Overview')}
            showAnalytics={Boolean(props.showAnalytics)}
            loading={Boolean(props.loading)}
            walletAddress={String(props.walletAddress || '')}
            timePeriod={props.timePeriod as '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL' || '1W'}
          />
        );
        break;

      case 'euclid-core-provider':
        componentElement = (
          <div class="core-provider-demo">
            <div class="provider-info">
              <h3>🌌 Core Provider Configuration</h3>
              <p>This component provides configuration to all child components. Configure the settings to see how they affect the entire system.</p>

              <div class="config-summary">
                <h4>Current Configuration:</h4>
                <div class="config-details">
                  <div><strong>Environment:</strong> {props.environment || 'testnet'}</div>
                  <div><strong>GraphQL Endpoint:</strong> {props.graphqlEndpoint || ENVIRONMENT_PRESETS[String(props.environment || 'testnet')]?.graphqlEndpoint || DEFAULT_CONFIG.graphqlEndpoint}</div>
                  <div><strong>REST Endpoint:</strong> {props.restEndpoint || ENVIRONMENT_PRESETS[String(props.environment || 'testnet')]?.restEndpoint || DEFAULT_CONFIG.restEndpoint}</div>
                  <div><strong>API Timeout:</strong> {props.apiTimeout || DEFAULT_CONFIG.apiTimeout}ms</div>
                  <div><strong>Default Chain:</strong> {props.defaultChain || DEFAULT_CONFIG.defaultChain}</div>
                  <div><strong>Default Wallet:</strong> {props.defaultWallet || DEFAULT_CONFIG.defaultWallet}</div>
                </div>
              </div>
            </div>

            <euclid-core-provider
              environment={String(props.environment) as 'mainnet' | 'testnet' | 'devnet'}
              graphqlEndpoint={String(props.graphqlEndpoint || '')}
              restEndpoint={String(props.restEndpoint || '')}
              apiTimeout={Number(props.apiTimeout)}
              defaultSlippage={Number(props.defaultSlippage)}
              refreshIntervals={String(props.refreshIntervals)}
              featureFlags={String(props.featureFlags)}
              supportedChains={String(props.supportedChains)}
              supportedWallets={String(props.supportedWallets)}
              defaultChain={String(props.defaultChain)}
              defaultWallet={String(props.defaultWallet)}
            >
              <div class="provider-children">
                <h4>💡 Configured Components Preview:</h4>
                <p>Here you would see child components using the configuration above.</p>
                <div class="demo-components">
                  <euclid-data-list
                    dataType="tokens"
                    displayMode="compact"
                    cardTitle="Tokens (using configured endpoints)"
                    itemsPerPage={5}
                    searchable={false}
                  />
                </div>
              </div>
            </euclid-core-provider>
          </div>
        );
        break;

      default:
        componentElement = <div>Component not found</div>;
    }

    return componentElement;
  }

  render() {
    return (
      <div class="demo-playground">
        <div class="playground-content">
          <div class="controls-section">
            {this.renderControlsPanel()}
          </div>

          <div class="demo-section">
            <euclid-config-provider environment={this.environment}>
              {this.renderDemo()}
            </euclid-config-provider>
          </div>
        </div>
      </div>
    );
  }
}
