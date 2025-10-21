export declare class EuclidModal {
    el: HTMLElement;
    private appState;
    private previousActiveElement;
    private previousBodyOverflow;
    private previousBodyPaddingRight;
    private scrollBarWidth;
    componentWillLoad(): void;
    componentDidLoad(): void;
    disconnectedCallback(): void;
    handleKeyDown(event: KeyboardEvent): void;
    private closeModal;
    /**
     * Calculate scrollbar width for cross-framework compatibility
     */
    private getScrollBarWidth;
    /**
     * Handle modal state changes (opening/closing)
     */
    private handleModalStateChange;
    /**
     * SIMPLE AS FUCK body scroll prevention
     */
    private onModalOpen;
    /**
     * SIMPLE AS FUCK restore body scroll
     */
    private onModalClose;
    /**
     * Focus trapping for accessibility
     */
    private handleTabKey;
    private handleOverlayClick;
    render(): any;
}
//# sourceMappingURL=euclid-modal.d.ts.map