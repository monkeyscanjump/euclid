export declare class EuclidWalletController {
    isInitialized: boolean;
    componentDidLoad(): Promise<void>;
    private initialize;
    private detectAvailableWallets;
    private setupWalletEventListeners;
    private handleEvmAccountChange;
    private handleEvmChainChange;
    private handleKeplrKeystoreChange;
    private disconnectEvmWallets;
    handleWalletConnectionRequest(event: CustomEvent<{
        chainUID: string;
        walletType: string;
    }>): Promise<void>;
    handleWalletDisconnectionRequest(event: CustomEvent<{
        chainUID: string;
    }>): void;
    private connectWallet;
    render(): any;
}
//# sourceMappingURL=euclid-wallet-controller.d.ts.map