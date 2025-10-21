import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import type { EuclidChainConfig } from '../../../utils/types/api.types';

export type ChainDisplayMode = 'card' | 'list-item' | 'compact';
export type ChainField = 'logo' | 'name' | 'type' | 'chain_id' | 'factory';

@Component({
  tag: 'euclid-chain-item',
  styleUrl: 'euclid-chain-item.css',
  shadow: true,
})
export class EuclidChainItem {
  /**
   * Chain data to display
   */
  @Prop() chain!: EuclidChainConfig;

  /**
   * Display mode: card (full info), list-item (compact row), compact (minimal)
   */
  @Prop() displayMode: ChainDisplayMode = 'list-item';

  /**
   * Fields to show in the display
   */
  @Prop() showFields: ChainField[] = ['logo', 'name', 'type'];

  /**
   * Whether the item is selectable (shows hover states, emits events)
   */
  @Prop() selectable: boolean = false;

  /**
   * Whether the item is currently selected
   */
  @Prop() selected: boolean = false;

  /**
   * Whether the item is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Emitted when the chain item is clicked (only if selectable)
   */
  @Event() chainSelect!: EventEmitter<EuclidChainConfig>;

  /**
   * Emitted when the chain item is hovered
   */
  @Event() chainHover!: EventEmitter<EuclidChainConfig>;

  private handleClick = () => {
    if (this.selectable && !this.disabled) {
      this.chainSelect.emit(this.chain);
    }
  };

  private handleMouseEnter = () => {
    if (this.selectable && !this.disabled) {
      this.chainHover.emit(this.chain);
    }
  };

  private shouldShowField(field: ChainField): boolean {
    return this.showFields.includes(field);
  }

  private getChainTypeColor(): string {
    switch (this.chain.type) {
      case 'EVM':
        return 'var(--euclid-accent-blue)';
      case 'Cosmwasm':
        return 'var(--euclid-accent-purple)';
      default:
        return 'var(--euclid-text-secondary)';
    }
  }

  private getChainTypeLabel(): string {
    switch (this.chain.type) {
      case 'EVM':
        return 'EVM';
      case 'Cosmwasm':
        return 'CosmWasm';
      default:
        return String(this.chain.type);
    }
  }

  render() {
    const classes = {
      'chain-item': true,
      [`chain-item--${this.displayMode}`]: true,
      'chain-item--selectable': this.selectable,
      'chain-item--selected': this.selected,
      'chain-item--disabled': this.disabled,
    };

    const handleClick = this.selectable ? this.handleClick : undefined;
    const handleMouseEnter = this.selectable ? this.handleMouseEnter : undefined;

    return (
      <div
        class={classes}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        role={this.selectable ? 'button' : undefined}
        tabindex={this.selectable && !this.disabled ? 0 : undefined}
      >
        {/* Logo */}
        {this.shouldShowField('logo') && (
          <div class="chain-logo">
            {this.chain.logo ? (
              <img src={this.chain.logo} alt={this.chain.display_name} />
            ) : (
              <div class="chain-logo-fallback">
                {this.chain.display_name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Main Info */}
        <div class="chain-info">
          {this.shouldShowField('name') && (
            <div class="chain-name">{this.chain.display_name}</div>
          )}

          {this.displayMode !== 'compact' && (
            <div class="chain-details">
              {this.shouldShowField('type') && (
                <span
                  class="chain-type"
                  style={{ color: this.getChainTypeColor() }}
                >
                  {this.getChainTypeLabel()}
                </span>
              )}

              {this.shouldShowField('chain_id') && (
                <span class="chain-id">ID: {this.chain.chain_id}</span>
              )}
            </div>
          )}
        </div>

        {/* Additional Info (Card mode only) */}
        {this.displayMode === 'card' && (
          <div class="chain-extra">
            {this.shouldShowField('factory') && this.chain.factory_address && (
              <div class="chain-factory">
                <span class="factory-label">Factory:</span>
                <span class="factory-address">
                  {this.chain.factory_address.slice(0, 8)}...{this.chain.factory_address.slice(-6)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Selection Indicator */}
        {this.selectable && this.selected && (
          <div class="selection-indicator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        )}
      </div>
    );
  }
}
