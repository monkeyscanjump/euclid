export declare class EuclidUserDataController {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    private refreshTimer;
    private retryCount;
    private maxRetries;
    componentDidLoad(): Promise<void>;
    disconnectedCallback(): void;
    private initialize;
    private handleWalletConnection;
    private handleWalletDisconnection;
    private loadUserBalances;
    private loadLiquidityPositions;
    private loadUserTransactions;
    private calculatePoolShare;
    private calculateTokenAmount;
    private calculatePositionValue;
    private setupPeriodicRefresh;
    private clearPeriodicRefresh;
    private refreshUserData;
    private handleLoadError;
    handleRefreshRequest(): Promise<void>;
    handleClearRequest(): void;
    onInitializedChange(newValue: boolean): void;
    render(): any;
}
//# sourceMappingURL=euclid-user-data-controller.d.ts.map