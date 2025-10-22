import { Component, h, Prop } from '@stencil/core';
import { DEFAULT_CONFIG, ENVIRONMENT_PRESETS, mergeConfig, type EuclidConfig } from '../../../utils/env';

/**
 * Lightweight configuration provider that only provides configuration context
 * without automatically loading controllers. This allows for more granular control
 * over which controllers are loaded.
 */
@Component({
  tag: 'euclid-config-provider',
})
export class EuclidConfigProvider {
  // Configuration Props
  @Prop() environment?: 'mainnet' | 'testnet' | 'devnet' = 'testnet';
  @Prop() graphqlEndpoint?: string;
  @Prop() restEndpoint?: string;
  @Prop() apiTimeout?: number;
  @Prop() defaultSlippage?: number;
  @Prop() refreshIntervals?: string; // JSON string for complex object
  @Prop() featureFlags?: string; // JSON string for feature flags
  @Prop() supportedChains?: string; // Comma-separated list
  @Prop() supportedWallets?: string; // Comma-separated list
  @Prop() defaultChain?: string;
  @Prop() defaultWallet?: string;

  // Computed configuration for child components
  private euclidConfig: EuclidConfig;

  componentWillLoad() {
    this.euclidConfig = this.computeConfiguration();
    this.provideConfigToChildren();
  }

  private computeConfiguration(): EuclidConfig {
    // Start with default config
    let config = { ...DEFAULT_CONFIG };

    // Apply environment preset if specified
    if (this.environment && ENVIRONMENT_PRESETS[this.environment]) {
      config = mergeConfig(config, ENVIRONMENT_PRESETS[this.environment]);
    }

    // Apply individual prop overrides
    const overrides: Partial<EuclidConfig> = {};

    if (this.graphqlEndpoint) overrides.graphqlEndpoint = this.graphqlEndpoint;
    if (this.restEndpoint) overrides.restEndpoint = this.restEndpoint;
    if (this.apiTimeout !== undefined) overrides.apiTimeout = this.apiTimeout;
    if (this.defaultChain) overrides.defaultChain = this.defaultChain;
    if (this.defaultWallet) overrides.defaultWallet = this.defaultWallet;

    if (this.supportedChains) {
      overrides.supportedChains = this.supportedChains.split(',').map(s => s.trim());
    }

    if (this.supportedWallets) {
      overrides.supportedWallets = this.supportedWallets.split(',').map(s => s.trim());
    }

    if (this.defaultSlippage !== undefined) {
      overrides.ui = { ...config.ui, defaultSlippage: this.defaultSlippage };
    }

    // Parse JSON props
    if (this.refreshIntervals) {
      try {
        overrides.refreshIntervals = JSON.parse(this.refreshIntervals);
      } catch (e) {
        console.warn('Invalid refreshIntervals JSON, using defaults:', e);
      }
    }

    if (this.featureFlags) {
      try {
        overrides.features = JSON.parse(this.featureFlags);
      } catch (e) {
        console.warn('Invalid featureFlags JSON, using defaults:', e);
      }
    }

    return mergeConfig(config, overrides);
  }

  private provideConfigToChildren() {
    // Store configuration in a way that child controllers can access it
    (globalThis as unknown as { __euclidConfig: EuclidConfig }).__euclidConfig = this.euclidConfig;

    // Also dispatch a custom event for configuration updates
    window.dispatchEvent(new CustomEvent('euclid:config-updated', {
      detail: { config: this.euclidConfig }
    }));
  }

  render() {
    return (
      <slot></slot>
    );
  }
}
