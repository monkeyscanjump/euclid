import { p as proxyCustomElement, H, d as createEvent, h } from './p-neZz74Yz.js';
import { a as appStore } from './p-nYiGBV1C.js';

const euclidWalletContentCss = ":host{display:block}.wallet-content{width:100%}.wallet-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));gap:var(--euclid-spacing-3)}.wallet-card{display:flex;flex-direction:column;align-items:center;padding:var(--euclid-spacing-4);border:2px solid var(--euclid-border);border-radius:var(--euclid-radius-lg);background:var(--euclid-surface);cursor:pointer;transition:all var(--euclid-transition-duration-fast);text-align:center}.wallet-card:hover:not(.wallet-card--not-installed){border-color:var(--euclid-border-hover);background:var(--euclid-surface-secondary);transform:translateY(-1px)}.wallet-card--not-installed{opacity:0.6}.wallet-card--not-installed:hover{border-color:var(--euclid-warning-300);background:var(--euclid-warning-50);transform:translateY(-1px)}.wallet-icon{width:3rem;height:3rem;border-radius:var(--euclid-radius-lg);display:flex;align-items:center;justify-content:center;margin-bottom:var(--euclid-spacing-3);background:var(--euclid-surface-secondary)}.wallet-emoji{font-size:1.5rem}.wallet-info{display:flex;flex-direction:column;gap:var(--euclid-spacing-1);width:100%}.wallet-name{font-size:var(--euclid-text-size-sm);font-weight:var(--euclid-font-weight-medium);color:var(--euclid-text-primary)}.wallet-description{font-size:var(--euclid-text-size-xs);color:var(--euclid-text-secondary);line-height:1.3}.install-badge{display:inline-block;font-size:var(--euclid-text-size-xs);padding:var(--euclid-spacing-1) var(--euclid-spacing-2);border-radius:var(--euclid-radius-sm);background:var(--euclid-warning-100);color:var(--euclid-warning-700);margin-top:var(--euclid-spacing-2);font-weight:var(--euclid-font-weight-medium)}@media (max-width: 640px){.wallet-grid{grid-template-columns:repeat(2, 1fr);gap:var(--euclid-spacing-2)}.wallet-card{padding:var(--euclid-spacing-3)}.wallet-icon{width:2.5rem;height:2.5rem}}@media (max-width: 480px){.wallet-grid{grid-template-columns:1fr}}.wallet-card:focus-visible{outline:2px solid var(--euclid-border-focus);outline-offset:2px}";

const EuclidWalletContent = /*@__PURE__*/ proxyCustomElement(class EuclidWalletContent extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.walletConnect = createEvent(this, "walletConnect");
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
    static get style() { return euclidWalletContentCss; }
}, [257, "euclid-wallet-content", {
        "walletProviders": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["euclid-wallet-content"];
    components.forEach(tagName => { switch (tagName) {
        case "euclid-wallet-content":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, EuclidWalletContent);
            }
            break;
    } });
}
defineCustomElement();

export { EuclidWalletContent as E, defineCustomElement as d };
//# sourceMappingURL=p-DYCg_zbS.js.map

//# sourceMappingURL=p-DYCg_zbS.js.map