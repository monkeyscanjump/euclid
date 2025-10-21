/**
 * PaginationManager - Handles pagination and infinite scroll data management
 * Separation of concerns: Page calculations, data slicing, item count management
 */

import type { DataItem } from '../types';

export interface PaginationConfig {
  itemsPerPage: number;
  maxItems: number;
  infiniteScroll: boolean;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  displayedItemsCount: number;
  hasMoreData: boolean;
}

export interface PaginationCallbacks {
  onStateChange: (state: PaginationState) => void;
  onPageChange: (page: number, totalPages: number, itemsPerPage: number) => void;
  onInfiniteScrollStateChange: (isLoading: boolean, hasMore: boolean, displayedCount: number) => void;
}

export class PaginationManager {
  private config: PaginationConfig;
  private callbacks: PaginationCallbacks;
  private filteredData: DataItem[] = [];

  private state: PaginationState = {
    currentPage: 1,
    totalPages: 1,
    displayedItemsCount: 0,
    hasMoreData: true,
  };

  constructor(config: PaginationConfig, callbacks: PaginationCallbacks) {
    this.config = config;
    this.callbacks = callbacks;

    if (config.infiniteScroll) {
      this.state.displayedItemsCount = config.itemsPerPage;
    }
  }

  updateData(filteredData: DataItem[]) {
    this.filteredData = filteredData;
    this.updatePagination();
  }

  getPaginatedData(): DataItem[] {
    if (this.config.infiniteScroll) {
      return this.filteredData.slice(0, this.state.displayedItemsCount);
    }

    if (this.config.itemsPerPage <= 0) {
      return this.filteredData;
    }

    const startIndex = (this.state.currentPage - 1) * this.config.itemsPerPage;
    const endIndex = startIndex + this.config.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  loadMore(): { newDisplayedCount: number; hasMore: boolean } {
    if (!this.config.infiniteScroll) {
      return { newDisplayedCount: this.state.displayedItemsCount, hasMore: false };
    }

    const currentCount = this.state.displayedItemsCount;
    const totalAvailable = this.filteredData.length;
    const requestedCount = Math.min(this.config.itemsPerPage, totalAvailable - currentCount);

    if (requestedCount <= 0) {
      this.state.hasMoreData = false;
      this.callbacks.onStateChange(this.state);
      return { newDisplayedCount: currentCount, hasMore: false };
    }

    const newDisplayedCount = Math.min(
      currentCount + requestedCount,
      totalAvailable,
      this.config.maxItems
    );

    this.state.displayedItemsCount = newDisplayedCount;
    this.state.hasMoreData = newDisplayedCount < totalAvailable && newDisplayedCount < this.config.maxItems;

    this.callbacks.onStateChange(this.state);
    this.callbacks.onInfiniteScrollStateChange(false, this.state.hasMoreData, newDisplayedCount);

    return { newDisplayedCount, hasMore: this.state.hasMoreData };
  }

  goToPage(page: number): boolean {
    if (this.config.infiniteScroll) {
      return false; // No pagination in infinite scroll mode
    }

    if (page >= 1 && page <= this.state.totalPages) {
      this.state.currentPage = page;
      this.callbacks.onStateChange(this.state);
      this.callbacks.onPageChange(page, this.state.totalPages, this.config.itemsPerPage);
      return true;
    }
    return false;
  }

  resetToFirstPage() {
    this.state.currentPage = 1;

    if (this.config.infiniteScroll) {
      this.state.displayedItemsCount = Math.min(this.config.itemsPerPage, this.filteredData.length);
      this.state.hasMoreData = this.state.displayedItemsCount < this.filteredData.length &&
                               this.state.displayedItemsCount < this.config.maxItems;
    }

    this.callbacks.onStateChange(this.state);
  }

  private updatePagination() {
    if (this.config.infiniteScroll) {
      this.state.displayedItemsCount = Math.min(this.state.displayedItemsCount, this.filteredData.length, this.config.maxItems);
      this.state.hasMoreData = this.state.displayedItemsCount < this.filteredData.length &&
                               this.state.displayedItemsCount < this.config.maxItems;
      this.state.totalPages = 1;
      this.state.currentPage = 1;
    } else {
      if (this.config.itemsPerPage > 0) {
        this.state.totalPages = Math.ceil(this.filteredData.length / this.config.itemsPerPage);

        if (this.state.currentPage > this.state.totalPages && this.state.totalPages > 0) {
          this.state.currentPage = 1;
        }
      } else {
        this.state.totalPages = 1;
        this.state.currentPage = 1;
      }
    }

    this.callbacks.onStateChange(this.state);
  }

  getState(): PaginationState {
    return { ...this.state };
  }
}
