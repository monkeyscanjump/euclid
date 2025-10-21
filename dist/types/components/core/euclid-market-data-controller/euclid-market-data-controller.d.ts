export declare class EuclidMarketDataController {
    isInitialized: boolean;
    private refreshInterval;
    componentDidLoad(): Promise<void>;
    disconnectedCallback(): void;
    private initialize;
    private loadInitialData;
    private setupPeriodicRefresh;
    private refreshMarketData;
    handleInitialDataLoad(): Promise<void>;
    handleRefreshRequest(): Promise<void>;
    handleTokenDetailsRequest(event: CustomEvent<{
        tokenId: string;
    }>): Promise<void>;
    handleChainDetailsRequest(event: CustomEvent<{
        chainUID: string;
    }>): Promise<void>;
    render(): any;
}
//# sourceMappingURL=euclid-market-data-controller.d.ts.map