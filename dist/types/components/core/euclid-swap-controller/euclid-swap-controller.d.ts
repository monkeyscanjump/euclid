export declare class EuclidSwapController {
    isInitialized: boolean;
    private routePollingInterval;
    private routePollingActive;
    componentDidLoad(): Promise<void>;
    disconnectedCallback(): void;
    private initialize;
    private handleTokenChange;
    private handleAmountChange;
    private debounceTimeout;
    private debounceRouteFetch;
    private startRoutePolling;
    private stopRoutePolling;
    private fetchRoutes;
    private getUserAddressForChain;
    executeSwap(): Promise<{
        success: boolean;
        txHash?: string;
        error?: string;
    }>;
    private calculateMinimumReceived;
    handleSwapExecution(): Promise<void>;
    handleRouteRefresh(): void;
    handleStopPolling(): void;
    handleStartPolling(): void;
    onInitializedChange(newValue: boolean): void;
    render(): any;
}
//# sourceMappingURL=euclid-swap-controller.d.ts.map