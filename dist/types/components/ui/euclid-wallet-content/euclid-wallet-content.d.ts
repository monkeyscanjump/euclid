import { EventEmitter } from '../../../stencil-public-runtime';
export interface WalletProvider {
    id: string;
    name: string;
    icon: string;
    installed: boolean;
    description: string;
}
export declare class EuclidWalletContent {
    private walletProviders;
    walletConnect: EventEmitter<WalletProvider>;
    private handleWalletConnect;
    private openInstallUrl;
    render(): any;
}
//# sourceMappingURL=euclid-wallet-content.d.ts.map