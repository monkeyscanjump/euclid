import { h } from "@stencil/core";
import { appStore } from "../../../store/app.store";
export class EuclidModal {
    constructor() {
        this.appState = appStore.state;
        this.previousActiveElement = null;
        this.previousBodyOverflow = '';
        this.previousBodyPaddingRight = '';
        this.scrollBarWidth = 0;
        this.handleOverlayClick = (event) => {
            if (event.target === event.currentTarget) {
                this.closeModal();
            }
        };
    }
    componentWillLoad() {
        console.log('🚀 Modal componentWillLoad');
        console.log('📊 Initial appState:', this.appState);
        console.log('📊 Initial store state:', appStore.state);
        // Calculate scrollbar width for body scroll prevention
        this.scrollBarWidth = this.getScrollBarWidth();
        console.log('📏 Scrollbar width:', this.scrollBarWidth);
        appStore.onChange('walletModalOpen', () => {
            console.log('👛 Wallet modal state changed:', appStore.state.walletModalOpen);
            const wasOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
            const newState = { ...appStore.state };
            const isNowOpen = newState.walletModalOpen || newState.tokenModalOpen;
            this.appState = newState;
            console.log('👛 Wallet modal state transition:', { wasOpen, isNowOpen });
            this.handleModalStateChange(wasOpen, isNowOpen);
        });
        appStore.onChange('tokenModalOpen', () => {
            console.log('🪙 Token modal state changed:', appStore.state.tokenModalOpen);
            const wasOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
            const newState = { ...appStore.state };
            const isNowOpen = newState.walletModalOpen || newState.tokenModalOpen;
            this.appState = newState;
            console.log('🪙 Token modal state transition:', { wasOpen, isNowOpen });
            this.handleModalStateChange(wasOpen, isNowOpen);
        });
    }
    componentDidLoad() {
        console.log('🎬 componentDidLoad called');
        // Handle initial state if modal is already open
        const isOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
        console.log('🎬 componentDidLoad isOpen:', isOpen);
        if (isOpen) {
            console.log('🎬 componentDidLoad calling onModalOpen');
            this.onModalOpen();
        }
    }
    disconnectedCallback() {
        // Cleanup when component is removed
        this.onModalClose();
    }
    handleKeyDown(event) {
        const isOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
        if (!isOpen)
            return;
        if (event.key === 'Escape') {
            this.closeModal();
        }
        // Focus trapping
        if (event.key === 'Tab') {
            this.handleTabKey(event);
        }
    }
    closeModal() {
        appStore.closeWalletModal();
        appStore.closeTokenModal();
    }
    /**
     * Calculate scrollbar width for cross-framework compatibility
     */
    getScrollBarWidth() {
        if (typeof window === 'undefined')
            return 0;
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);
        const inner = document.createElement('div');
        outer.appendChild(inner);
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        document.body.removeChild(outer);
        return scrollbarWidth;
    }
    /**
     * Handle modal state changes (opening/closing)
     */
    handleModalStateChange(wasOpen, isNowOpen) {
        console.log('🔄 handleModalStateChange:', { wasOpen, isNowOpen });
        if (!wasOpen && isNowOpen) {
            console.log('▶️ Opening modal');
            this.onModalOpen();
        }
        else if (wasOpen && !isNowOpen) {
            console.log('⏹️ Closing modal');
            this.onModalClose();
        }
        else {
            console.log('➡️ No state change needed');
        }
    }
    /**
     * SIMPLE AS FUCK body scroll prevention
     */
    onModalOpen() {
        console.log('🔒 onModalOpen called');
        if (typeof window === 'undefined') {
            console.log('❌ No window, returning');
            return;
        }
        try {
            // Store current active element
            this.previousActiveElement = document.activeElement;
            console.log('💾 Stored active element:', this.previousActiveElement);
            // SIMPLE: Just lock the fucking body scroll
            const body = document.body;
            this.previousBodyOverflow = body.style.overflow || '';
            body.style.overflow = 'hidden';
            console.log('🔒 BODY SCROLL LOCKED!', {
                previousOverflow: this.previousBodyOverflow,
                newOverflow: body.style.overflow
            });
            // Focus the modal container
            requestAnimationFrame(() => {
                const modalContainer = this.el.shadowRoot?.querySelector('.modal-container');
                if (modalContainer) {
                    modalContainer.focus();
                    console.log('🎯 Modal focused');
                }
            });
        }
        catch (error) {
            console.error('❌ Error in onModalOpen:', error);
        }
    }
    /**
     * SIMPLE AS FUCK restore body scroll
     */
    onModalClose() {
        console.log('🔓 onModalClose called');
        if (typeof window === 'undefined') {
            console.log('❌ No window, returning');
            return;
        }
        try {
            // SIMPLE: Just restore the fucking body scroll
            const body = document.body;
            body.style.overflow = this.previousBodyOverflow;
            console.log('🔓 BODY SCROLL RESTORED!', {
                restoredOverflow: this.previousBodyOverflow,
                currentOverflow: body.style.overflow
            });
            // Restore focus to previous element
            if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
                this.previousActiveElement.focus();
                console.log('🎯 Focus restored to:', this.previousActiveElement);
            }
            this.previousActiveElement = null;
        }
        catch (error) {
            console.error('❌ Error in onModalClose:', error);
        }
    }
    /**
     * Focus trapping for accessibility
     */
    handleTabKey(event) {
        const shadowRoot = this.el.shadowRoot;
        if (!shadowRoot)
            return;
        const modal = shadowRoot.querySelector('.modal-container');
        if (!modal)
            return;
        // Get all focusable elements within the modal (including shadow DOM elements)
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0)
            return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        // Check if current active element is within our shadow DOM
        const activeElement = shadowRoot.activeElement || document.activeElement;
        if (event.shiftKey) {
            // Shift + Tab (backwards)
            if (activeElement === firstElement || !modal.contains(activeElement)) {
                lastElement?.focus();
                event.preventDefault();
            }
        }
        else {
            // Tab (forwards)
            if (activeElement === lastElement || !modal.contains(activeElement)) {
                firstElement?.focus();
                event.preventDefault();
            }
        }
    }
    render() {
        const isOpen = this.appState.walletModalOpen || this.appState.tokenModalOpen;
        console.log('🎭 Modal render called:', {
            isOpen,
            walletOpen: this.appState.walletModalOpen,
            tokenOpen: this.appState.tokenModalOpen
        });
        if (!isOpen) {
            console.log('🚫 Modal not open, returning null');
            // Make sure scroll is restored if modal is closed
            if (document.body.style.overflow === 'hidden') {
                console.log('🔓 FORCE restoring scroll on closed modal');
                document.body.style.overflow = this.previousBodyOverflow || '';
            }
            return null;
        }
        // FORCE scroll lock if modal is open (backup safety net)
        if (document.body.style.overflow !== 'hidden') {
            console.log('🔒 FORCE locking scroll in render');
            this.previousBodyOverflow = document.body.style.overflow || '';
            document.body.style.overflow = 'hidden';
        }
        let title = '';
        let content = null;
        if (this.appState.walletModalOpen) {
            title = 'Connect Wallet';
            content = h("euclid-wallet-content", null);
            console.log('👛 Rendering wallet modal');
        }
        else if (this.appState.tokenModalOpen) {
            title = 'Select Token';
            content = h("euclid-token-content", null);
            console.log('🪙 Rendering token modal');
        }
        return (h("div", { class: "modal-overlay", onClick: this.handleOverlayClick, role: "dialog", "aria-modal": "true", "aria-hidden": "false" }, h("div", { class: "modal-container", role: "document", tabindex: "-1", "aria-labelledby": "modal-title", "aria-describedby": "modal-content" }, h("div", { class: "modal-header" }, h("h2", { id: "modal-title", class: "modal-title" }, title), h("button", { class: "close-button", onClick: () => this.closeModal(), type: "button", "aria-label": "Close modal" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" }, h("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" })))), h("div", { id: "modal-content", class: "modal-content" }, content))));
    }
    static get is() { return "euclid-modal"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["euclid-modal.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["euclid-modal.css"]
        };
    }
    static get states() {
        return {
            "appState": {}
        };
    }
    static get elementRef() { return "el"; }
    static get listeners() {
        return [{
                "name": "keydown",
                "method": "handleKeyDown",
                "target": "document",
                "capture": false,
                "passive": false
            }];
    }
}
//# sourceMappingURL=euclid-modal.js.map
