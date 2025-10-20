import { Component, h, State, Listen, Element } from '@stencil/core';
import { appStore } from '../../../store/app.store';

@Component({
  tag: 'euclid-modal',
  styleUrl: 'euclid-modal.css',
  shadow: true,
})
export class EuclidModal {
  @Element() el!: HTMLElement;

  @State() private appState = appStore.state;

  componentWillLoad() {
    appStore.onChange('walletModalOpen', () => {
      this.appState = { ...appStore.state };
    });
    appStore.onChange('tokenModalOpen', () => {
      this.appState = { ...appStore.state };
    });
  }

  @Listen('keydown', { target: 'document' })
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && (this.appState.walletModalOpen || this.appState.tokenModalOpen)) {
      this.closeModal();
    }
  }

  private closeModal() {
    appStore.closeWalletModal();
    appStore.closeTokenModal();
  }

  private handleOverlayClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  };

  render() {
    const isOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;

    if (!isOpen) {
      return null;
    }

    let title = '';
    let content = null;

    if (this.appState.walletModalOpen) {
      title = 'Connect Wallet';
      content = <euclid-wallet-content />;
    } else if (this.appState.tokenModalOpen) {
      title = 'Select Token';
      content = <euclid-token-content />;
    }

    return (
      <div class="modal-overlay" onClick={this.handleOverlayClick}>
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">{title}</h2>
            <button
              class="close-button"
              onClick={() => this.closeModal()}
              type="button"
              aria-label="Close modal"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
              </svg>
            </button>
          </div>

          <div class="modal-content">
            {content}
          </div>
        </div>
      </div>
    );
  }
}
