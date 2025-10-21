import { Component, Prop, h, State, Element, Watch } from '@stencil/core';
import type { DataType, DisplayMode } from '../../core/euclid-data-list/types';

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
  type: 'string' | 'number' | 'boolean' | 'select';
  defaultValue: PropValue;
  description?: string;
  options?: Array<{ value: PropValue; label: string }>;
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
    }
  ];

  @Watch('selectedDemo')
  onSelectedDemoChange(newDemo: string) {
    this.activeTab = newDemo;
    this.initializeProps();
  }

  componentWillLoad() {
    this.activeTab = this.selectedDemo;
    this.initializeProps();
  }

  private initializeProps() {
    const demo = this.componentDemos.find(d => d.id === this.activeTab);
    if (demo) {
      this.currentProps = { ...demo.defaultProps };
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
          <button
            class={`code-toggle ${this.showCode ? 'active' : ''}`}
            onClick={() => this.showCode = !this.showCode}
          >
            {this.showCode ? 'Hide Code' : 'Show Code'}
          </button>
        </div>

        {this.showCode && (
          <div class="code-display">
            <pre><code>{this.generateComponentCode()}</code></pre>
          </div>
        )}

        <div class="controls-grid">
          {demo.propDefinitions.map(prop => this.renderControl(prop))}
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
              <span class="control-name">{prop.name}</span>
            </label>
            {prop.description && <div class="control-description">{prop.description}</div>}
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
            cardTitle={String(props.cardTitle || 'Swap Tokens')}
            showAdvanced={Boolean(props.showAdvanced)}
            loading={Boolean(props.loading)}
            disabled={Boolean(props.disabled)}
            walletAddress={String(props.walletAddress || '')}
            defaultSlippage={Number(props.defaultSlippage || 0.5)}
          />
        );
        break;

      case 'euclid-liquidity-card':
        componentElement = (
          <euclid-liquidity-card
            cardTitle={String(props.cardTitle || 'Manage Liquidity')}
            mode={props.mode as 'add' | 'remove' || 'add'}
            loading={Boolean(props.loading)}
            disabled={Boolean(props.disabled)}
            walletAddress={String(props.walletAddress || '')}
            defaultSlippage={Number(props.defaultSlippage || 0.5)}
          />
        );
        break;

      case 'euclid-portfolio-overview':
        componentElement = (
          <euclid-portfolio-overview
            cardTitle={String(props.cardTitle || 'Portfolio Overview')}
            showAnalytics={Boolean(props.showAnalytics)}
            loading={Boolean(props.loading)}
            walletAddress={String(props.walletAddress || '')}
            timePeriod={props.timePeriod as '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL' || '1W'}
          />
        );
        break;

      default:
        componentElement = <div>Component not found</div>;
    }

    return (
      <div class="demo-preview">
        <div class="demo-content">
          {componentElement}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div class="demo-playground">
        <div class="playground-content">
          <div class="controls-section">
            {this.renderControlsPanel()}
          </div>

          <div class="demo-section">
            {this.renderDemo()}
          </div>
        </div>
      </div>
    );
  }
}
