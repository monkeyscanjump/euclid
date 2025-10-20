import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import type { TokenMetadata } from '../../../utils/types/api.types';

@Component({
  tag: 'token-item',
  styleUrl: 'token-item.css',
  shadow: true,
})
export class TokenItem {
  @Prop() token!: TokenMetadata;

  @Event() tokenClick: EventEmitter<TokenMetadata>;

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

  private handleClick = () => {
    this.tokenClick.emit(this.token);
  };

  render() {
    const priceChange24h = this.token.price_change_24h || 0;
    const isPositiveChange = priceChange24h > 0;
    const isNegativeChange = priceChange24h < 0;

    return (
      <div class="token-item" onClick={this.handleClick}>
        <div class="token-header">
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
          <div class="token-info">
            <div class="token-name">{this.token.displayName}</div>
            <div class="token-id">{this.token.tokenId}</div>
          </div>
          {this.token.is_verified && (
            <div class="verified-badge" title="Verified Token">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.18L16.59,7.59L18,9L10,17Z"/>
              </svg>
            </div>
          )}
        </div>

        <div class="token-metrics">
          <div class="metric-row">
            <span class="metric-label">Price</span>
            <span class="metric-value">{this.formatPrice(this.token.price)}</span>
          </div>

          {priceChange24h !== 0 && (
            <div class="metric-row">
              <span class="metric-label">24h Change</span>
              <span class={{
                'metric-value': true,
                'price-change': true,
                'price-positive': isPositiveChange,
                'price-negative': isNegativeChange,
              }}>
                {this.formatPriceChange(priceChange24h)}
              </span>
            </div>
          )}

          {this.token.total_volume_24h > 0 && (
            <div class="metric-row">
              <span class="metric-label">24h Volume</span>
              <span class="metric-value">{this.formatVolume(this.token.total_volume_24h)}</span>
            </div>
          )}

          <div class="metric-row">
            <span class="metric-label">Decimals</span>
            <span class="metric-value">{this.token.coinDecimal}</span>
          </div>
        </div>

        {this.token.tags && this.token.tags.length > 0 && (
          <div class="token-tags">
            {this.token.tags.slice(0, 3).map(tag => (
              <span key={tag} class={`tag tag--${tag}`}>{tag}</span>
            ))}
          </div>
        )}

        {this.token.chain_uids && this.token.chain_uids.length > 0 && (
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
        )}
      </div>
    );
  }
}
