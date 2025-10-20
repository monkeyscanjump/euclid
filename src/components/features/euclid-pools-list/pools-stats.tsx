import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'pools-stats',
  styleUrl: 'pools-stats.css',
  shadow: true,
})
export class PoolsStats {
  @Prop() totalPools: number = 0;
  @Prop() filteredPools: number = 0;
  @Prop() totalTvl: number = 0;
  @Prop() userPositions: number = 0;
  @Prop() walletAddress?: string;

  private formatNumber(value: number, decimals: number = 2): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
    return value.toFixed(decimals);
  }

  render() {
    return (
      <div class="pools-stats">
        <div class="stat-item">
          <div class="stat-label">Total Pools</div>
          <div class="stat-value">{this.totalPools}</div>
        </div>

        <div class="stat-item">
          <div class="stat-label">Filtered</div>
          <div class="stat-value">{this.filteredPools}</div>
        </div>

        <div class="stat-item">
          <div class="stat-label">Total TVL</div>
          <div class="stat-value">${this.formatNumber(this.totalTvl)}</div>
        </div>

        {this.walletAddress && (
          <div class="stat-item">
            <div class="stat-label">My Positions</div>
            <div class="stat-value">{this.userPositions}</div>
          </div>
        )}
      </div>
    );
  }
}
