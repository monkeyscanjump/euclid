import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';

@Component({
  tag: 'euclid-base-modal',
  styleUrl: 'euclid-base-modal.css',
  shadow: true,
})
export class EuclidBaseModal {
  @Element() el!: HTMLElement;
  private searchInputRef?: HTMLInputElement;
  private modalRef?: HTMLElement;

  /**
   * Whether the modal is open
   */
  @Prop({ mutable: true }) open: boolean = false;

    /**
   * Modal title text
   */
  @Prop() modalTitle: string = 'Modal';

  /**
   * Whether to show search input
   */
  @Prop() showSearch: boolean = false;

  /**
   * Search input placeholder
   */
  @Prop() searchPlaceholder: string = 'Search...';

  /**
   * Current search query
   */
  @Prop({ mutable: true }) searchQuery: string = '';

  /**
   * Whether to show list selector
   */
  @Prop() showListSelector: boolean = false;

  /**
   * List selector options
   */
  @Prop() listOptions: Array<{ value: string; label: string }> = [];

  /**
   * Selected list option
   */
  @Prop({ mutable: true }) selectedList: string = '';

  /**
   * Loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Loading message
   */
  @Prop() loadingMessage: string = 'Loading...';

  /**
   * Error message to display
   */
  @Prop() error?: string;

  /**
   * Empty state message
   */
  @Prop() emptyMessage?: string;

  /**
   * Maximum width of modal
   */
  @Prop() maxWidth: string = '480px';

  /**
   * Whether to show backdrop blur
   */
  @Prop() backdropBlur: boolean = true;

  /**
   * Whether clicking overlay closes modal
   */
  @Prop() closeOnOverlayClick: boolean = true;

  /**
   * Whether to auto-focus search input when opened
   */
  @Prop() autoFocusSearch: boolean = true;

  @State() private isAnimating: boolean = false;

  /**
   * Emitted when the modal is closed
   */
  @Event() modalClose!: EventEmitter<void>;

  /**
   * Emitted when search input changes
   */
  @Event() searchInput!: EventEmitter<string>;

  /**
   * Emitted when list selector changes
   */
  @Event() listChange!: EventEmitter<string>;

  /**
   * Emitted when modal is opened
   */
  @Event() modalOpen!: EventEmitter<void>;

  componentDidLoad() {
    if (this.open) {
      this.handleOpen();
    }
  }

  componentDidUpdate() {
    if (this.open && this.autoFocusSearch) {
      this.focusSearchInput();
    }
  }

  @Listen('keydown', { target: 'document' })
  handleKeyDown(event: KeyboardEvent) {
    if (!this.open) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeModal();
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        // Allow parent components to handle navigation
        break;
    }
  }

  private handleOpen() {
    this.isAnimating = true;

    setTimeout(() => {
      this.focusSearchInput();
      this.isAnimating = false;
      this.modalOpen.emit();
    }, 150);
  }

  private closeModal() {
    this.isAnimating = true;

    setTimeout(() => {
      this.open = false;
      this.isAnimating = false;
      this.searchQuery = '';
      this.modalClose.emit();
    }, 150);
  }

  private focusSearchInput() {
    if (this.showSearch && this.searchInputRef && this.autoFocusSearch) {
      this.searchInputRef.focus();
    }
  }

  private handleOverlayClick = (event: Event) => {
    if (this.closeOnOverlayClick && event.target === this.modalRef) {
      this.closeModal();
    }
  };

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchInput.emit(this.searchQuery);
  };

  private handleListChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.selectedList = target.value;
    this.listChange.emit(this.selectedList);
  };

  render() {
    if (!this.open) {
      return null;
    }

    const modalClass = {
      'modal-overlay': true,
      'modal-overlay--animating': this.isAnimating,
      'modal-overlay--blur': this.backdropBlur,
    };

    const contentClass = {
      'modal-content': true,
      'modal-content--loading': this.loading,
    };

    return (
      <div
        class={modalClass}
        ref={(el) => this.modalRef = el}
        onClick={this.handleOverlayClick}
      >
        <div
          class={contentClass}
          style={{ maxWidth: this.maxWidth }}
        >
          {/* Header */}
          <div class="modal-header">
            <h2 class="modal-title">{this.modalTitle}</h2>
            <button
              class="close-button"
              onClick={() => this.closeModal()}
              type="button"
              aria-label="Close modal"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Search Section */}
          {this.showSearch && (
            <div class="search-section">
              <div class="search-input-container">
                <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  ref={(el) => this.searchInputRef = el}
                  type="text"
                  placeholder={this.searchPlaceholder}
                  value={this.searchQuery}
                  onInput={this.handleSearchInput}
                  class="search-input"
                />
              </div>

              {/* List Selector */}
              {this.showListSelector && this.listOptions.length > 1 && (
                <select
                  class="list-selector"
                  onInput={this.handleListChange}
                >
                  {this.listOptions.map(option => (
                    <option
                      key={option.value}
                      value={option.value}
                      selected={option.value === this.selectedList}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Error State */}
          {this.error && (
            <div class="error-section">
              <p class="error-message">{this.error}</p>
            </div>
          )}

          {/* Loading State */}
          {this.loading && (
            <div class="loading-section">
              <div class="loading-spinner">
                <div class="spinner"></div>
              </div>
              <p class="loading-text">{this.loadingMessage}</p>
            </div>
          )}

          {/* Content Slot */}
          {!this.loading && !this.error && (
            <div class="modal-body">
              <slot name="content"></slot>

              {/* Empty State */}
              {this.emptyMessage && (
                <div class="empty-state">
                  <p class="empty-message">{this.emptyMessage}</p>
                  <slot name="empty-actions"></slot>
                </div>
              )}
            </div>
          )}

          {/* Footer Slot */}
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    );
  }
}
