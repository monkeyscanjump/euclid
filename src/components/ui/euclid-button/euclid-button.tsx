import { Component, Prop, h, Host } from '@stencil/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  tag: 'euclid-button',
  styleUrl: 'euclid-button.css',
  shadow: true,
})
export class EuclidButton {
  @Prop() variant: ButtonVariant = 'primary';
  @Prop() size: ButtonSize = 'md';
  @Prop() loading: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() fullWidth: boolean = false;
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';
  @Prop() href?: string;

  private handleClick = (event: MouseEvent) => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  };

  render() {
    const classes = {
      'euclid-button': true,
      [`euclid-button--${this.variant}`]: true,
      [`euclid-button--${this.size}`]: true,
      'euclid-button--loading': this.loading,
      'euclid-button--disabled': this.disabled,
      'euclid-button--full-width': this.fullWidth,
    };

    const commonProps = {
      class: classes,
      disabled: this.disabled || this.loading,
      onClick: this.handleClick,
      'aria-busy': this.loading ? 'true' : 'false',
    };

    // If href is provided, render as a link
    if (this.href && !this.disabled && !this.loading) {
      return (
        <Host>
          <a
            href={this.href}
            class={classes}
            role="button"
            aria-busy={this.loading ? 'true' : 'false'}
          >
            {this.loading && (
              <span class="euclid-button__spinner" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="euclid-button__spinner-icon">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray="60"
                    stroke-dashoffset="60"
                  />
                </svg>
              </span>
            )}
            <span class={{'euclid-button__content': true, 'euclid-button__content--hidden': this.loading}}>
              <slot></slot>
            </span>
          </a>
        </Host>
      );
    }

    // Render as button
    return (
      <Host>
        <button
          type={this.type}
          {...commonProps}
        >
          {this.loading && (
            <span class="euclid-button__spinner" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="euclid-button__spinner-icon">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-dasharray="60"
                  stroke-dashoffset="60"
                />
              </svg>
            </span>
          )}
          <span class={{'euclid-button__content': true, 'euclid-button__content--hidden': this.loading}}>
            <slot></slot>
          </span>
        </button>
      </Host>
    );
  }
}
