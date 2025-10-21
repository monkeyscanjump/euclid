import { EventEmitter } from '../../../stencil-public-runtime';
export interface TokenInfo {
    symbol: string;
    name: string;
    decimals: number;
    logoUrl?: string;
    balance?: string;
}
export declare class EuclidTokenInput {
    private inputRef?;
    /**
     * The current token selection
     */
    token?: TokenInfo;
    /**
     * The input value (amount)
     */
    value: string;
    /**
     * Placeholder text for the input
     */
    placeholder: string;
    /**
     * Whether the input is disabled
     */
    disabled: boolean;
    /**
     * Whether to show the balance
     */
    showBalance: boolean;
    /**
     * Whether to show the max button
     */
    showMax: boolean;
    /**
     * Label for the input
     */
    label?: string;
    /**
     * Error message to display
     */
    error?: string;
    /**
     * Loading state
     */
    loading: boolean;
    /**
     * Whether the token selector is clickable
     */
    tokenSelectable: boolean;
    private focused;
    private hasError;
    private userBalance?;
    /**
     * Emitted when the input value changes
     */
    valueChange: EventEmitter<string>;
    /**
     * Emitted when the token selector is clicked
     */
    tokenSelect: EventEmitter<void>;
    /**
     * Emitted when the max button is clicked
     */
    maxClick: EventEmitter<void>;
    onValueChange(newValue: string): void;
    onErrorChange(newError: string | undefined): void;
    onTokenChange(): void;
    componentWillLoad(): void;
    disconnectedCallback(): void;
    private setupStoreSubscriptions;
    private updateUserBalance;
    private validateInput;
    private handleInputChange;
    private handleInputFocus;
    private handleInputBlur;
    private handleTokenClick;
    private handleMaxClick;
    private formatBalance;
    render(): any;
}
//# sourceMappingURL=euclid-token-input.d.ts.map