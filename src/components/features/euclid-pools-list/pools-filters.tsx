import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

export interface PoolFilters {
  search: string;
  sortBy: 'apr' | 'tvl' | 'volume' | 'fees' | 'myLiquidity';
  sortOrder: 'asc' | 'desc';
  showMyPools: boolean;
}

@Component({
  tag: 'pools-filters',
  styleUrl: 'pools-filters.css',
  shadow: true,
})
export class PoolsFilters {
  @Prop() filters!: PoolFilters;
  @Prop() walletAddress: string = '';

  @Event() filtersChanged: EventEmitter<PoolFilters>;

  private handleSearchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filtersChanged.emit({ ...this.filters, search: target.value });
  };

  private handleSortChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.filtersChanged.emit({
      ...this.filters,
      sortBy: target.value as 'apr' | 'tvl' | 'volume' | 'fees' | 'myLiquidity'
    });
  };

  private handleMyPoolsToggle = () => {
    this.filtersChanged.emit({ ...this.filters, showMyPools: !this.filters.showMyPools });
  };

  private clearFilters = () => {
    this.filtersChanged.emit({
      search: '',
      sortBy: 'apr',
      sortOrder: 'desc',
      showMyPools: false,
    });
  };

  render() {
    const hasWallet = !!this.walletAddress;

    return (
      <div class="pools-filters">
        <input
          class="search-input"
          type="text"
          placeholder="Search pools by token name..."
          value={this.filters.search}
          onInput={this.handleSearchChange}
        />

        <select class="sort-select" onChange={this.handleSortChange}>
          <option value="apr" selected={this.filters.sortBy === 'apr'}>APR (High to Low)</option>
          <option value="tvl" selected={this.filters.sortBy === 'tvl'}>TVL (High to Low)</option>
          <option value="volume" selected={this.filters.sortBy === 'volume'}>Volume (High to Low)</option>
          <option value="fees" selected={this.filters.sortBy === 'fees'}>Fees (High to Low)</option>
          {hasWallet && <option value="myLiquidity" selected={this.filters.sortBy === 'myLiquidity'}>My Liquidity</option>}
        </select>

        {hasWallet && (
          <label class="my-pools-checkbox">
            <input
              type="checkbox"
              checked={this.filters.showMyPools}
              onChange={this.handleMyPoolsToggle}
            />
            My Pools Only
          </label>
        )}
      </div>
    );
  }
}
