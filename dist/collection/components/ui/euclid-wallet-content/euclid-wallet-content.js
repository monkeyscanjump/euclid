import { h } from "@stencil/core";
import { appStore } from "../../../store/app.store";
export class EuclidWalletContent {
    constructor() {
        this.walletProviders = [
            // Mock data - in real app this would come from store/API
            { id: 'metamask', name: 'MetaMask', icon: '🦊', installed: true, description: 'Connect using MetaMask wallet' },
            { id: 'keplr', name: 'Keplr', icon: '🔗', installed: true, description: 'Connect using Keplr wallet' },
            { id: 'phantom', name: 'Phantom', icon: '👻', installed: false, description: 'Connect using Phantom wallet' },
            { id: 'walletconnect', name: 'WalletConnect', icon: '🌐', installed: true, description: 'Connect using WalletConnect' },
        ];
        this.handleWalletConnect = (provider) => {
            if (!provider.installed) {
                this.openInstallUrl(provider.id);
                return;
            }
            this.walletConnect.emit(provider);
            appStore.closeWalletModal();
        };
    }
    openInstallUrl(walletId) {
        const installUrls = {
            'metamask': 'https://metamask.io/download/',
            'keplr': 'https://www.keplr.app/download',
            'phantom': 'https://phantom.app/download',
            'walletconnect': 'https://walletconnect.com/',
        };
        const url = installUrls[walletId];
        if (url) {
            window.open(url, '_blank');
        }
    }
    render() {
        return (h("div", { key: '0f602499b579836e01cd2f0f3b649a7003c106b7', class: "wallet-content" }, h("div", { key: '96dc8993243289645b68261b499d1877f86531dd', class: "wallet-grid" }, this.walletProviders.map(provider => (h("button", { key: provider.id, class: {
                'wallet-card': true,
                'wallet-card--not-installed': !provider.installed
            }, onClick: () => this.handleWalletConnect(provider), type: "button" }, h("div", { class: "wallet-icon" }, h("span", { class: "wallet-emoji" }, provider.icon)), h("div", { class: "wallet-info" }, h("div", { class: "wallet-name" }, provider.name), h("div", { class: "wallet-description" }, provider.description), !provider.installed && (h("span", { class: "install-badge" }, "Install Required")))))))));
    }
    static get is() { return "euclid-wallet-content"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-wallet-content.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-wallet-content.css"]
        };
    }
    static get states() {
        return {
            "walletProviders": {}
        };
    }
    static get events() {
        return [{
                "method": "walletConnect",
                "name": "walletConnect",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "WalletProvider",
                    "resolved": "WalletProvider",
                    "references": {
                        "WalletProvider": {
                            "location": "local",
                            "path": "C:/Users/crist/monkeyscanjump/euclid/src/components/ui/euclid-wallet-content/euclid-wallet-content.tsx",
                            "id": "src/components/ui/euclid-wallet-content/euclid-wallet-content.tsx::WalletProvider"
                        }
                    }
                }
            }];
    }
}
//# sourceMappingURL=euclid-wallet-content.js.map
