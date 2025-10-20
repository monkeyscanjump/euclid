import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'pools-loading',
  styleUrl: 'pools-loading.css',
  shadow: true,
})
export class PoolsLoading {
  @Prop() count: number = 6;

  render() {
    return (
      <div class="pools-loading">
        {Array.from({ length: this.count }, (_, i) => (
          <div key={i} class="pool-skeleton">
            <div class="skeleton-header">
              <div class="skeleton-tokens">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-avatar skeleton-avatar-overlap"></div>
                <div class="skeleton-text skeleton-text-lg"></div>
              </div>
              <div class="skeleton-metrics">
                <div class="skeleton-metric">
                  <div class="skeleton-text skeleton-text-sm"></div>
                  <div class="skeleton-text skeleton-text-md"></div>
                </div>
                <div class="skeleton-metric">
                  <div class="skeleton-text skeleton-text-sm"></div>
                  <div class="skeleton-text skeleton-text-md"></div>
                </div>
                <div class="skeleton-metric">
                  <div class="skeleton-text skeleton-text-sm"></div>
                  <div class="skeleton-text skeleton-text-md"></div>
                </div>
              </div>
            </div>
            <div class="skeleton-actions">
              <div class="skeleton-button"></div>
              <div class="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
