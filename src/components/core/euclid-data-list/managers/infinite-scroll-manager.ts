/**
 * InfiniteScrollManager - Handles all infinite scroll logic
 * Separation of concerns: Intersection Observer management, scroll detection, load more triggers
 */

export interface InfiniteScrollConfig {
  useParentScroll: boolean;
  triggerItems: number;
  threshold: number;
  debounceTime: number;
}

export interface InfiniteScrollState {
  displayedItemsCount: number;
  hasMoreData: boolean;
  isLoadingMore: boolean;
  isComponentVisible: boolean;
}

export interface InfiniteScrollCallbacks {
  onLoadMore: () => void;
  onStateChange: (state: InfiniteScrollState) => void;
}

export class InfiniteScrollManager {
  private config: InfiniteScrollConfig;
  private callbacks: InfiniteScrollCallbacks;
  private hostElement: HTMLElement;
  private contentElement?: HTMLElement;

  // Intersection Observer instances
  private componentObserver?: IntersectionObserver;
  private itemObserver?: IntersectionObserver;
  private triggerElements: Set<Element> = new Set();
  private loadMoreDebounceTimer?: NodeJS.Timeout;

  // State
  private state: InfiniteScrollState = {
    displayedItemsCount: 0,
    hasMoreData: true,
    isLoadingMore: false,
    isComponentVisible: true,
  };

  constructor(
    hostElement: HTMLElement,
    config: InfiniteScrollConfig,
    callbacks: InfiniteScrollCallbacks
  ) {
    this.hostElement = hostElement;
    this.config = config;
    this.callbacks = callbacks;
  }

  initialize(contentElement?: HTMLElement) {
    this.contentElement = contentElement;
    this.setupIntersectionObservers();
  }

  updateState(newState: Partial<InfiniteScrollState>) {
    this.state = { ...this.state, ...newState };
    this.callbacks.onStateChange(this.state);
  }

  updateTriggerElements() {
    if (!this.itemObserver) return;

    // Clear existing observations
    this.triggerElements.forEach(element => {
      this.itemObserver?.unobserve(element);
    });
    this.triggerElements.clear();

    // Find new trigger elements (last N items)
    const contentElement = this.hostElement?.shadowRoot?.querySelector('.data-content');
    if (!contentElement) return;

    const items = contentElement.querySelectorAll('.data-item');
    const triggerCount = Math.min(this.config.triggerItems, items.length);

    for (let i = items.length - triggerCount; i < items.length; i++) {
      if (i >= 0 && items[i]) {
        this.triggerElements.add(items[i]);
        this.itemObserver.observe(items[i]);
      }
    }
  }

  private findScrollContainer(element: Element): Element | null {
    let current = element.parentElement;

    while (current && current !== document.documentElement) {
      const style = window.getComputedStyle(current);
      const hasScrollY = style.overflowY === 'auto' || style.overflowY === 'scroll';
      const hasScrollGeneral = style.overflow === 'auto' || style.overflow === 'scroll';
      const hasScrollableContent = current.scrollHeight > current.clientHeight;

      const isScrollableContainer = hasScrollableContent && (
        hasScrollY ||
        hasScrollGeneral ||
        current.tagName === 'BODY' ||
        current.classList.contains('container') ||
        current.classList.contains('scroll') ||
        current.classList.contains('scrollable')
      );

      if (isScrollableContainer) {
        return current;
      }

      current = current.parentElement;
    }

    const body = document.body;
    if (body && body.scrollHeight > body.clientHeight) {
      return body;
    }

    return null;
  }

  private setupIntersectionObservers() {
    let scrollRoot: Element | null = null;

    if (this.config.useParentScroll) {
      scrollRoot = this.findScrollContainer(this.hostElement);
    } else {
      scrollRoot = this.contentElement || null;
    }

    // Component visibility observer
    this.componentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;
          this.updateState({ isComponentVisible: isVisible });

          if (!isVisible) {
            this.pauseItemObserver();
          } else {
            this.resumeItemObserver();
          }
        });
      },
      {
        root: this.config.useParentScroll ? scrollRoot : null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (this.hostElement) {
      this.componentObserver.observe(this.hostElement);
    }

    // Item trigger observer
    this.itemObserver = new IntersectionObserver(
      (entries) => {
        if (!this.state.isComponentVisible || this.state.isLoadingMore || !this.state.hasMoreData) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting && this.triggerElements.has(entry.target)) {
            this.handleLoadMore();
          }
        });
      },
      {
        root: scrollRoot,
        rootMargin: '20px',
        threshold: this.config.threshold
      }
    );
  }

  private handleLoadMore() {
    if (this.state.isLoadingMore || !this.state.hasMoreData) return;

    if (this.loadMoreDebounceTimer) {
      clearTimeout(this.loadMoreDebounceTimer);
    }

    this.loadMoreDebounceTimer = setTimeout(() => {
      this.callbacks.onLoadMore();
    }, this.config.debounceTime);
  }

  private pauseItemObserver() {
    if (this.itemObserver) {
      this.triggerElements.forEach(element => {
        this.itemObserver?.unobserve(element);
      });
    }
  }

  private resumeItemObserver() {
    if (this.itemObserver && this.triggerElements.size > 0) {
      this.triggerElements.forEach(element => {
        this.itemObserver?.observe(element);
      });
    }
  }

  destroy() {
    if (this.componentObserver) {
      this.componentObserver.disconnect();
      this.componentObserver = undefined;
    }

    if (this.itemObserver) {
      this.itemObserver.disconnect();
      this.itemObserver = undefined;
    }

    this.triggerElements.clear();

    if (this.loadMoreDebounceTimer) {
      clearTimeout(this.loadMoreDebounceTimer);
    }
  }
}
