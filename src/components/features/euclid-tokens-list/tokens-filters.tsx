import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

export interface TokenFilters {
  search: string;
  sortBy: 'name' | 'price' | 'volume' | 'marketCap';
  sortOrder: 'asc' | 'desc';
  showFavorites: boolean;
  chainFilter: string;
}

@Component({
  tag: 'tokens-filters',
  styleUrl: 'tokens-filters.css',
  shadow: true,
})
export class TokensFilters {
  @Prop() filters!: TokenFilters;
  @Prop() chains: string[] = [];

  @Event() filtersChanged: EventEmitter<TokenFilters>;

  private handleSearchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.filtersChanged.emit({ ...this.filters, search: target.value });
  };

  private handleSortChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.filtersChanged.emit({
      ...this.filters,
      sortBy: target.value as 'name' | 'price' | 'volume' | 'marketCap'
    });
  };

  private handleChainChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.filtersChanged.emit({ ...this.filters, chainFilter: target.value });
  };

  render() {
    return (
      <div class="tokens-filters">
        <input
          class="search-input"
          type="text"
          placeholder="Search tokens by name or symbol..."
          value={this.filters.search}
          onInput={this.handleSearchChange}
        />

        <select class="sort-select" onChange={this.handleSortChange}>
          <option value="name" selected={this.filters.sortBy === 'name'}>Name (A-Z)</option>
          <option value="price" selected={this.filters.sortBy === 'price'}>Price (High to Low)</option>
          <option value="volume" selected={this.filters.sortBy === 'volume'}>Volume (High to Low)</option>
          <option value="marketCap" selected={this.filters.sortBy === 'marketCap'}>Market Cap</option>
        </select>

        {this.chains.length > 0 && (
          <select class="chain-select" onChange={this.handleChainChange}>
            <option value="" selected={this.filters.chainFilter === ''}>All Chains</option>
            {this.chains.map(chain => (
              <option key={chain} value={chain} selected={this.filters.chainFilter === chain}>
                {chain}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }
}
