import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import type { PoolInfo, TokenMetadata } from '../../../utils/types/api.types';

export interface UserPoolPosition {
  poolId: string;
  poolAddress: string;
  lpTokenBalance: string;
  shareOfPool: number;
  tokenAAmount: string;
  tokenBAmount: string;
  value: number;
  unclaimedRewards?: number;
  stakingRewards?: number;
}

@Component({
  tag: 'pool-item',
  styleUrl: 'pool-item.css',
  shadow: true,
})
export class PoolItem {
  @Prop() pool!: PoolInfo;
  @Prop() tokens: TokenMetadata[] = [];
  @Prop() position?: UserPoolPosition;
  @Prop() walletAddress?: string;

  @Event() addLiquidity: EventEmitter<PoolInfo>;
  @Event() removeLiquidity: EventEmitter<{ pool: PoolInfo; position: UserPoolPosition }>;
  @Event() stakeTokens: EventEmitter<{ pool: PoolInfo; position?: UserPoolPosition }>;
  @Event() claimRewards: EventEmitter<{ pool: PoolInfo; position: UserPoolPosition }>;

  private getTokenMetadata(tokenId: string): TokenMetadata | null {
    return this.tokens.find(token => token.tokenId === tokenId) || null;
  }

  private formatNumber(value: number, decimals: number = 2): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
    return value.toFixed(decimals);
  }

  private formatAPR(aprString: string): string {
    // Remove % if present and parse as float
    const aprValue = parseFloat(aprString.replace('%', '') || '0');
    // Format to 3 decimal places and add % back
    return `${aprValue.toFixed(3)}%`;
  }

  render() {
    const token1Meta = this.getTokenMetadata(this.pool.token_1);
    const token2Meta = this.getTokenMetadata(this.pool.token_2);
    const token1Name = token1Meta?.displayName || this.pool.token_1.toUpperCase();
    const token2Name = token2Meta?.displayName || this.pool.token_2.toUpperCase();

    // Debug: Log raw API values
    console.log('🔍 Raw pool data:', {
      pool_id: this.pool.pool_id,
      token_1: this.pool.token_1,
      token_2: this.pool.token_2,
      total_liquidity_raw: this.pool.total_liquidity,
      volume_24h_raw: this.pool.volume_24h,
      fees_24h_raw: this.pool.fees_24h,
      apr_raw: this.pool.apr,
      formatted_apr: parseFloat(this.pool.apr || '0').toFixed(2),
      formatted_tvl: this.formatNumber(parseFloat(this.pool.total_liquidity || '0'))
    });

    return (
      <div class="pool-item">
        <div class="pool-main">
          <div class="pool-tokens">
            <div class="token-logos">
              <img
                src={token1Meta?.image || '/assets/default-token.svg'}
                alt={token1Name}
                class={`token-logo ${token1Name.toLowerCase().includes('euclid') ? 'light-logo' : ''}`.trim()}
                onError={(e) => (e.target as HTMLImageElement).src = '/assets/default-token.svg'}
              />
              <img
                src={token2Meta?.image || '/assets/default-token.svg'}
                alt={token2Name}
                class={`token-logo token-logo-overlap ${token2Name.toLowerCase().includes('euclid') ? 'light-logo' : ''}`.trim()}
                onError={(e) => (e.target as HTMLImageElement).src = '/assets/default-token.svg'}
              />
            </div>
            <div class="pool-details">
              <div class="pool-name">{token1Name}/{token2Name}</div>
              <div class="pool-fee">0.3% Fee</div>
            </div>
          </div>

          <div class="pool-metrics">
            <div class="metric">
              <div class="metric-label">APR</div>
              <div class="metric-value apy">{this.formatAPR(this.pool.apr || '0')}</div>
            </div>
            <div class="metric">
              <div class="metric-label">TVL</div>
              <div class="metric-value">${this.formatNumber(parseFloat(this.pool.total_liquidity || '0'))}</div>
            </div>
            <div class="metric">
              <div class="metric-label">24h Volume</div>
              <div class="metric-value">${this.formatNumber(parseFloat(this.pool.volume_24h || '0'))}</div>
            </div>
            <div class="metric">
              <div class="metric-label">24h Fees</div>
              <div class="metric-value">${this.formatNumber(parseFloat(this.pool.fees_24h || '0'))}</div>
            </div>
          </div>
        </div>

        {this.walletAddress && this.position && (
          <div class="pool-position">
            <div class="position-details">
              <div class="position-value">${this.formatNumber(this.position.value)}</div>
              <div class="position-share">{this.position.shareOfPool.toFixed(4)}% of pool</div>
              {this.position.unclaimedRewards && this.position.unclaimedRewards > 0 && (
                <div class="unclaimed-rewards">
                  ${this.formatNumber(this.position.unclaimedRewards)} rewards
                </div>
              )}
            </div>
          </div>
        )}

        <div class="pool-actions">
          <euclid-button
            variant="primary"
            size="sm"
            onClick={() => this.addLiquidity.emit(this.pool)}
          >
            Add Liquidity
          </euclid-button>

          {this.position && (
            <euclid-button
              variant="secondary"
              size="sm"
              onClick={() => this.removeLiquidity.emit({ pool: this.pool, position: this.position! })}
            >
              Remove
            </euclid-button>
          )}

          {this.position && this.position.unclaimedRewards && this.position.unclaimedRewards > 0 && (
            <euclid-button
              variant="ghost"
              size="sm"
              onClick={() => this.claimRewards.emit({ pool: this.pool, position: this.position! })}
            >
              Claim Rewards
            </euclid-button>
          )}
        </div>
      </div>
    );
  }
}
