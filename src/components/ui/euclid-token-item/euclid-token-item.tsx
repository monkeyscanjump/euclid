import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import type { TokenMetadata } from '../../../utils/types/api.types';

export type TokenDisplayMode = 'card' | 'list-item' | 'compact';
export type TokenField = 'logo' | 'name' | 'price' | 'change' | 'change7d' | 'volume' | 'volume24h' | 'chains' | 'tags' | 'verified' | 'dex' | 'decimals' | 'description' | 'minSwap';

@Component({
  tag: 'euclid-token-item',
  styleUrl: 'euclid-token-item.css',
  shadow: true,
})
export class EuclidTokenItem {
  @Prop() token!: TokenMetadata;
  @Prop() displayMode: TokenDisplayMode = 'card';
  @Prop() showFields: TokenField[] = ['logo', 'name', 'price', 'change', 'volume24h', 'decimals', 'chains', 'tags', 'verified'];
  @Prop() selectable: boolean = true;
  @Prop() selected: boolean = false;

  @Event() tokenClick: EventEmitter<TokenMetadata>;

  private handleClick = () => {
    if (this.selectable) {
      this.tokenClick.emit(this.token);
    }
  };

  private shouldShowField(field: TokenField): boolean {
    return this.showFields.includes(field);
  }

  private formatPrice(price: string | undefined): string {
    if (!price || price === '0' || price === '0.0' || price === '0.000000') return '$0.00';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice === 0) return '$0.00';
    if (numPrice < 0.000001) return `$${numPrice.toExponential(2)}`;
    if (numPrice < 0.01) return `$${numPrice.toFixed(6)}`;
    if (numPrice < 1) return `$${numPrice.toFixed(4)}`;
    return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatPriceChange(change: number): string {
    if (change === 0) return '0.00%';
    const abs = Math.abs(change);
    if (abs < 0.01) return `${change > 0 ? '+' : ''}${change.toFixed(4)}%`;
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  }

  private formatVolume(volume: number): string {
    if (volume === 0) return '$0';
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  }

  private renderLogo() {
    if (!this.shouldShowField('logo')) return null;

    return (
      <div class="token-logo-container">
        {this.token.image ? (
          <img
            src={this.token.image}
            alt={this.token.displayName}
            class="token-logo"
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
          />
        ) : (
          <svg viewBox="0 0 64 64" class="token-logo fallback-logo" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M31.968,0c-1.9626667,28.448-3.552,29.984-32,32c28.448,1.9626667,29.984,3.552,32,32c1.9626667-28.448,3.552-29.984,32-32C35.52,29.984,33.9306667,28.448,31.968,0z"/>
          </svg>
        )}
      </div>
    );
  }

  private renderVerifiedBadge() {
    if (!this.shouldShowField('verified') || !this.token.is_verified) return null;

    return (
      <div class="verified-badge" title="Verified Token">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.18L16.59,7.59L18,9L10,17Z"/>
        </svg>
      </div>
    );
  }

  private renderTags() {
    if (!this.shouldShowField('tags') || !this.token.tags || this.token.tags.length === 0) return null;

    return (
      <div class="token-tags">
        {this.token.tags.slice(0, 3).map(tag => (
          <span key={tag} class={`tag tag--${tag}`}>{tag}</span>
        ))}
      </div>
    );
  }

  private renderChains() {
    if (!this.shouldShowField('chains') || !this.token.chain_uids || this.token.chain_uids.length === 0) return null;

    return (
      <div class="token-chains">
        <span class="chains-label">Chains:</span>
        <div class="chains-list">
          {this.token.chain_uids.slice(0, 3).map(chain => (
            <span key={chain} class="chain-badge">{chain}</span>
          ))}
          {this.token.chain_uids.length > 3 && (
            <span class="chain-badge more">+{this.token.chain_uids.length - 3}</span>
          )}
        </div>
      </div>
    );
  }

  private renderCompactMode() {
    return (
      <div class="token-compact">
        {this.renderLogo()}
        <div class="compact-info">
          {this.shouldShowField('name') && (
            <span class="compact-name">{this.token.displayName}</span>
          )}
          {this.shouldShowField('price') && (
            <span class="compact-price">{this.formatPrice(this.token.price)}</span>
          )}
        </div>
        {this.renderVerifiedBadge()}
      </div>
    );
  }

  private renderListItemMode() {
    const priceChange24h = this.token.price_change_24h || 0;
    const isPositiveChange = priceChange24h > 0;
    const isNegativeChange = priceChange24h < 0;

    return (
      <div class="token-list-item">
        <div class="list-item-left">
          {this.renderLogo()}
          {this.shouldShowField('name') && (
            <div class="token-info">
              <div class="token-name">{this.token.displayName}</div>
              <div class="token-id">{this.token.tokenId}</div>
            </div>
          )}
        </div>
        <div class="list-item-center">
          {this.shouldShowField('price') && (
            <div class="token-price">{this.formatPrice(this.token.price)}</div>
          )}
          {this.shouldShowField('change') && priceChange24h !== 0 && (
            <div class={{
              'token-change': true,
              'change-positive': isPositiveChange,
              'change-negative': isNegativeChange,
            }}>
              {this.formatPriceChange(priceChange24h)}
            </div>
          )}
        </div>
        <div class="list-item-right">
          {this.shouldShowField('volume24h') && this.token.total_volume_24h && this.token.total_volume_24h > 0 && (
            <div class="token-volume">{this.formatVolume(this.token.total_volume_24h)}</div>
          )}
          {this.renderVerifiedBadge()}
        </div>
      </div>
    );
  }

  private renderCardMode() {
    const priceChange24h = this.token.price_change_24h || 0;
    const priceChange7d = this.token.price_change_7d || 0;
    const isPositiveChange24h = priceChange24h > 0;
    const isNegativeChange24h = priceChange24h < 0;
    const isPositiveChange7d = priceChange7d > 0;
    const isNegativeChange7d = priceChange7d < 0;

    return (
      <div class="token-card">
        <div class="card-header">
          {this.renderLogo()}
          {this.shouldShowField('name') && (
            <div class="token-info">
              <div class="token-name">{this.token.displayName}</div>
              <div class="token-id">{this.token.tokenId}</div>
            </div>
          )}
          {this.renderVerifiedBadge()}
        </div>

        <div class="card-metrics">
          {this.shouldShowField('price') && (
            <div class="metric-row">
              <span class="metric-label">Price</span>
              <span class="metric-value">{this.formatPrice(this.token.price)}</span>
            </div>
          )}

          {this.shouldShowField('change') && priceChange24h !== 0 && (
            <div class="metric-row">
              <span class="metric-label">24h Change</span>
              <span class={{
                'metric-value': true,
                'price-change': true,
                'price-positive': isPositiveChange24h,
                'price-negative': isNegativeChange24h,
              }}>
                {this.formatPriceChange(priceChange24h)}
              </span>
            </div>
          )}

          {this.shouldShowField('change7d') && priceChange7d !== 0 && (
            <div class="metric-row">
              <span class="metric-label">7d Change</span>
              <span class={{
                'metric-value': true,
                'price-change': true,
                'price-positive': isPositiveChange7d,
                'price-negative': isNegativeChange7d,
              }}>
                {this.formatPriceChange(priceChange7d)}
              </span>
            </div>
          )}

          {this.shouldShowField('volume24h') && this.token.total_volume_24h && this.token.total_volume_24h > 0 && (
            <div class="metric-row">
              <span class="metric-label">24h Volume</span>
              <span class="metric-value">{this.formatVolume(this.token.total_volume_24h)}</span>
            </div>
          )}

          {this.shouldShowField('decimals') && (
            <div class="metric-row">
              <span class="metric-label">Decimals</span>
              <span class="metric-value">{this.token.coinDecimal}</span>
            </div>
          )}

          {this.shouldShowField('minSwap') && this.token.min_swap_value && this.token.min_swap_value > 0 && (
            <div class="metric-row">
              <span class="metric-label">Min Swap</span>
              <span class="metric-value">{this.token.min_swap_value}</span>
            </div>
          )}
        </div>

        <div class="card-footer">
          {this.renderTags()}
          {this.renderChains()}

          {this.shouldShowField('dex') && this.token.dex && this.token.dex.length > 0 && (
            <div class="token-dex">
              <span class="chains-label">DEX:</span>
              <div class="chains-list">
                {this.token.dex.slice(0, 3).map(dex => (
                  <span key={dex} class="chain-badge">{dex.toUpperCase()}</span>
                ))}
                {this.token.dex.length > 3 && (
                  <span class="chain-badge more">+{this.token.dex.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {this.shouldShowField('description') && this.token.description && this.token.description.trim() !== '' && (
            <div class="token-description">
              <span class="chains-label">INFO:</span>
              <span class="description-text">
                {this.token.description.length > 60
                  ? `${this.token.description.substring(0, 60)}...`
                  : this.token.description
                }
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const containerClasses = {
      'token-item': true,
      [`token-item--${this.displayMode}`]: true,
      'token-item--selectable': this.selectable,
      'token-item--selected': this.selected,
    };

    return (
      <div class={containerClasses} onClick={this.handleClick}>
        {this.displayMode === 'compact' && this.renderCompactMode()}
        {this.displayMode === 'list-item' && this.renderListItemMode()}
        {this.displayMode === 'card' && this.renderCardMode()}
      </div>
    );
  }
}
