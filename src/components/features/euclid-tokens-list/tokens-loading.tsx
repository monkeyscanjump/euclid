import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'tokens-loading',
  styleUrl: 'tokens-loading.css',
  shadow: true,
})
export class TokensLoading {
  /**
   * Number of skeleton cards to show
   */
  @Prop() count: number = 8;

  /**
   * Whether to show the loading state
   */
  @Prop() show: boolean = true;

  private renderSkeletonCard() {
    return (
      <div class="token-skeleton">
        <div class="token-skeleton__content">
          {/* Token icon and info */}
          <div class="token-skeleton__header">
            <div class="token-skeleton__icon"></div>
            <div class="token-skeleton__info">
              <div class="token-skeleton__line token-skeleton__line--title"></div>
              <div class="token-skeleton__line token-skeleton__line--subtitle"></div>
            </div>
          </div>

          {/* Price and volume */}
          <div class="token-skeleton__stats">
            <div class="token-skeleton__stat">
              <div class="token-skeleton__line token-skeleton__line--small"></div>
              <div class="token-skeleton__line token-skeleton__line--medium"></div>
            </div>
            <div class="token-skeleton__stat">
              <div class="token-skeleton__line token-skeleton__line--small"></div>
              <div class="token-skeleton__line token-skeleton__line--medium"></div>
            </div>
          </div>

          {/* Tags */}
          <div class="token-skeleton__tags">
            <div class="token-skeleton__tag"></div>
            <div class="token-skeleton__tag"></div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (!this.show) {
      return null;
    }

    return (
      <div class="tokens-loading">
        <div class="tokens-skeleton-grid">
          {Array.from({ length: this.count }, (_, index) => (
            <div key={index}>
              {this.renderSkeletonCard()}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
