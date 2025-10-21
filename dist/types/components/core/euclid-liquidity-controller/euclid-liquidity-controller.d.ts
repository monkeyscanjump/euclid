export declare class EuclidLiquidityController {
    isInitialized: boolean;
    componentDidLoad(): Promise<void>;
    private initialize;
    private handlePoolChange;
    executeAddLiquidity(): Promise<{
        success: boolean;
        txHash?: string;
        error?: string;
    }>;
    executeRemoveLiquidity(poolId: string, lpTokenAmount: string): Promise<{
        success: boolean;
        txHash?: string;
        error?: string;
    }>;
    handleAddLiquidityExecution(): Promise<void>;
    handleRemoveLiquidityExecution(event: CustomEvent<{
        poolId: string;
        lpTokenAmount: string;
    }>): Promise<void>;
    onInitializedChange(newValue: boolean): void;
    render(): any;
}
//# sourceMappingURL=euclid-liquidity-controller.d.ts.map