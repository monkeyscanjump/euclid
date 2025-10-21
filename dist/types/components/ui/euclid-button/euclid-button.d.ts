export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export declare class EuclidButton {
    variant: ButtonVariant;
    size: ButtonSize;
    loading: boolean;
    disabled: boolean;
    fullWidth: boolean;
    type: 'button' | 'submit' | 'reset';
    href?: string;
    private handleClick;
    render(): any;
}
//# sourceMappingURL=euclid-button.d.ts.map