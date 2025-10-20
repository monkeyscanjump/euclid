import { Component, h } from '@stencil/core';
import { appStore } from '../../../store/app.store';

@Component({
  tag: 'euclid-demo-buttons',
  styleUrl: 'euclid-demo-buttons.css',
  shadow: true,
})
export class EuclidDemoButtons {

  private openTokenModal = () => {
    appStore.openTokenModal();
  };

  private openWalletModal = () => {
    appStore.openWalletModal();
  };

  render() {
    return (
      <div class="demo-container">
        <h3>Simple Modal Demo</h3>
        <div class="button-group">
          <euclid-button onClick={this.openTokenModal}>
            Select Token
          </euclid-button>

          <euclid-button onClick={this.openWalletModal}>
            Connect Wallet
          </euclid-button>
        </div>

        <p class="description">
          Click these buttons to see how simple it is to open modals with the new system.
          Just call <code>appStore.openTokenModal()</code> or <code>appStore.openWalletModal()</code>!
        </p>
      </div>
    );
  }
}
