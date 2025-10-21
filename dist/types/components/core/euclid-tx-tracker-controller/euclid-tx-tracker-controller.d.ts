export declare class EuclidTxTrackerController {
    isInitialized: boolean;
    private trackingTransactions;
    private trackingInterval;
    componentDidLoad(): Promise<void>;
    disconnectedCallback(): void;
    private initialize;
    private startTracking;
    private stopTracking;
    trackTransaction(txHash: string, chainUID: string, type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer'): Promise<void>;
    private checkPendingTransactions;
    private checkTransactionStatus;
    private refreshUserDataAfterSuccess;
    getTrackingStats(): {
        totalTracking: number;
        byType: Record<string, number>;
        byChain: Record<string, number>;
    };
    checkTransactionManually(txHash: string, chainUID: string): Promise<{
        success: boolean;
        status?: string;
        error?: string;
    }>;
    handleTransactionSubmitted(event: CustomEvent<{
        txHash: string;
        chainUID: string;
        type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer';
    }>): Promise<void>;
    handleTrackTransactionRequest(event: CustomEvent<{
        txHash: string;
        chainUID: string;
        type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer';
    }>): Promise<void>;
    handleStopTrackingTransaction(event: CustomEvent<{
        txHash: string;
    }>): void;
    handleGetTrackingStats(): void;
    onInitializedChange(newValue: boolean): void;
    render(): any;
}
//# sourceMappingURL=euclid-tx-tracker-controller.d.ts.map