import type {
  DataListConfig,
  TokenListConfig,
  ChainListConfig,
  PoolListConfig,
  FilterConfig,
  SortOption,
  StatConfig,
  UserPoolPosition,
} from './types';
import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../../../utils/types/api.types';

/**
 * Factory functions to create data list configurations for different data types
 */

/**
 * Creates a configuration for displaying tokens
 */
export function createTokensConfig(options: Partial<TokenListConfig> = {}): DataListConfig<TokenMetadata> {
  const {
    displayMode = 'card',
    cardTitle = 'Available Tokens',
    showFields = ['logo', 'name', 'price', 'change', 'volume24h', 'decimals', 'chains', 'tags', 'verified'],
    showFavorites = false,
    chainFilter = true,
    ...customOptions
  } = options;

  // Default filters for tokens
  const filters: FilterConfig[] = [];

  // Add favorites filter if enabled
  if (showFavorites) {
    filters.push({
      key: 'showFavorites',
      label: 'Show Favorites Only',
      type: 'boolean',
      filterFn: (item, value) => {
        if (!value) return true;
        // You would implement favorites logic here
        // For now, just return true
        return true;
      },
    });
  }

  // Add chain filter if enabled
  if (chainFilter) {
    filters.push({
      key: 'chainFilter',
      label: 'All Chains',
      type: 'select',
      filterFn: (item, value) => {
        if (!value) return true;
        const token = item as TokenMetadata;
        return token.chain_uids?.includes(value as string) || false;
      },
      optionsProvider: (items) => {
        const chains = new Set<string>();
        items.forEach(item => {
          const token = item as TokenMetadata;
          token.chain_uids?.forEach(chain => chains.add(chain));
        });
        return Array.from(chains)
          .map(chainId => ({
            value: chainId,
            label: chainId.toUpperCase(),
            count: items.filter(item =>
              (item as TokenMetadata).chain_uids?.includes(chainId)
            ).length,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },
    });
  }

  // Default sort options for tokens
  const sortOptions: SortOption[] = [
    {
      key: 'name',
      label: 'Name',
      sortFn: (a, b) => {
        const tokenA = a as TokenMetadata;
        const tokenB = b as TokenMetadata;
        return tokenA.displayName.localeCompare(tokenB.displayName);
      },
    },
    {
      key: 'price',
      label: 'Price',
      sortFn: (a, b) => {
        const tokenA = a as TokenMetadata;
        const tokenB = b as TokenMetadata;
        const priceA = parseFloat(tokenA.price || '0');
        const priceB = parseFloat(tokenB.price || '0');
        return priceA - priceB;
      },
    },
    {
      key: 'volume',
      label: 'Volume',
      sortFn: (a, b) => {
        const tokenA = a as TokenMetadata;
        const tokenB = b as TokenMetadata;
        const volumeA = tokenA.total_volume_24h || 0;
        const volumeB = tokenB.total_volume_24h || 0;
        return volumeA - volumeB;
      },
    },
    {
      key: 'change',
      label: 'Price Change',
      sortFn: (a, b) => {
        const tokenA = a as TokenMetadata;
        const tokenB = b as TokenMetadata;
        const changeA = tokenA.price_change_24h || 0;
        const changeB = tokenB.price_change_24h || 0;
        return changeA - changeB;
      },
    },
  ];

  // Default statistics for tokens
  const statConfigs: StatConfig[] = [
    {
      key: 'total',
      label: 'Total Tokens',
      calculateFn: (items) => items.length,
    },
    {
      key: 'chains',
      label: 'Chains',
      calculateFn: (items) => {
        const chains = new Set<string>();
        items.forEach(item => {
          const token = item as TokenMetadata;
          token.chain_uids?.forEach(chain => chains.add(chain));
        });
        return chains.size;
      },
    },
    {
      key: 'verified',
      label: 'Verified',
      calculateFn: (items) => {
        return items.filter(item => (item as TokenMetadata).is_verified).length;
      },
    },
  ];

  return {
    dataType: 'tokens',
    storeKey: 'tokens',
    itemComponent: 'euclid-token-item',
    displayMode,
    cardTitle,
    emptyStateMessage: 'No tokens found',
    loadingMessage: 'Loading tokens...',
    showFields,
    search: {
      enabled: true,
      placeholder: 'Search tokens...',
      searchFields: ['displayName', 'tokenId', 'name'],
    },
    filters,
    sorting: {
      enabled: true,
      defaultSortBy: 'name',
      defaultSortOrder: 'asc',
      options: sortOptions,
    },
    pagination: {
      enabled: true,
      itemsPerPage: 12,
      showPageNumbers: true,
      maxPageNumbers: 5,
    },
    statistics: {
      enabled: true,
      configs: statConfigs,
    },
    events: {
      itemSelect: true,
      itemHover: true,
    },
    ...customOptions,
  };
}

/**
 * Creates a configuration for displaying chains
 */
export function createChainsConfig(options: Partial<ChainListConfig> = {}): DataListConfig<EuclidChainConfig> {
  const {
    displayMode = 'list-item',
    cardTitle = 'Select Chain',
    showFields = ['logo', 'name', 'type'],
    typeFilter = true,
    showFactoryAddress = false,
    ...customOptions
  } = options;

  // Default filters for chains
  const filters: FilterConfig[] = [];

  // Add type filter if enabled
  if (typeFilter) {
    filters.push({
      key: 'typeFilter',
      label: 'All Types',
      type: 'select',
      options: [
        { value: 'EVM', label: 'EVM' },
        { value: 'Cosmwasm', label: 'CosmWasm' },
      ],
      filterFn: (item, value) => {
        if (!value) return true;
        const chain = item as EuclidChainConfig;
        return chain.type === value;
      },
    });
  }

  // Default sort options for chains
  const sortOptions: SortOption[] = [
    {
      key: 'name',
      label: 'Name',
      sortFn: (a, b) => {
        const chainA = a as EuclidChainConfig;
        const chainB = b as EuclidChainConfig;
        return chainA.display_name.localeCompare(chainB.display_name);
      },
    },
    {
      key: 'type',
      label: 'Type',
      sortFn: (a, b) => {
        const chainA = a as EuclidChainConfig;
        const chainB = b as EuclidChainConfig;
        return chainA.type.localeCompare(chainB.type);
      },
    },
    {
      key: 'chain_id',
      label: 'Chain ID',
      sortFn: (a, b) => {
        const chainA = a as EuclidChainConfig;
        const chainB = b as EuclidChainConfig;
        return chainA.chain_id.localeCompare(chainB.chain_id);
      },
    },
  ];

  // Default statistics for chains
  const statConfigs: StatConfig[] = [
    {
      key: 'total',
      label: 'Total Chains',
      calculateFn: (items) => items.length,
    },
    {
      key: 'evm',
      label: 'EVM Chains',
      calculateFn: (items) => {
        return items.filter(item => (item as EuclidChainConfig).type === 'EVM').length;
      },
    },
    {
      key: 'cosmwasm',
      label: 'CosmWasm Chains',
      calculateFn: (items) => {
        return items.filter(item => (item as EuclidChainConfig).type === 'Cosmwasm').length;
      },
    },
  ];

  const fieldsToShow = showFactoryAddress
    ? [...showFields, 'factory']
    : showFields;

  return {
    dataType: 'chains',
    storeKey: 'chains',
    itemComponent: 'euclid-chain-item',
    displayMode,
    cardTitle,
    emptyStateMessage: 'No chains found',
    loadingMessage: 'Loading chains...',
    showFields: fieldsToShow,
    search: {
      enabled: true,
      placeholder: 'Search chains...',
      searchFields: ['display_name', 'chain_id', 'chain_uid'],
    },
    filters,
    sorting: {
      enabled: true,
      defaultSortBy: 'name',
      defaultSortOrder: 'asc',
      options: sortOptions,
    },
    pagination: {
      enabled: false, // Chains are usually few, no pagination needed
      itemsPerPage: 0,
    },
    statistics: {
      enabled: true,
      configs: statConfigs,
    },
    events: {
      itemSelect: true,
      itemHover: true,
    },
    ...customOptions,
  };
}

/**
 * Creates a configuration for displaying pools
 */
export function createPoolsConfig(options: Partial<PoolListConfig> = {}): DataListConfig<PoolInfo> {
  const {
    displayMode = 'list-item',
    cardTitle = 'Liquidity Pools',
    showUserPositions = true,
    userPositions = [],
    walletAddress = '',
    ...customOptions
  } = options;

  // Default filters for pools
  const filters: FilterConfig[] = [];

  // Add user pools filter if enabled
  if (showUserPositions && walletAddress) {
    filters.push({
      key: 'showMyPools',
      label: 'Show My Pools Only',
      type: 'boolean',
      filterFn: (item, value) => {
        if (!value) return true;
        const pool = item as PoolInfo;
        return userPositions.some((pos: UserPoolPosition) => pos.poolId === pool.pool_id);
      },
    });
  }

  // Default sort options for pools
  const sortOptions: SortOption[] = [
    {
      key: 'apr',
      label: 'APR',
      sortFn: (a, b) => {
        const poolA = a as PoolInfo;
        const poolB = b as PoolInfo;
        const aprA = parseFloat((poolA.apr || '0%').replace('%', ''));
        const aprB = parseFloat((poolB.apr || '0%').replace('%', ''));
        return aprA - aprB;
      },
    },
    {
      key: 'tvl',
      label: 'TVL',
      sortFn: (a, b) => {
        const poolA = a as PoolInfo;
        const poolB = b as PoolInfo;
        const tvlA = parseFloat(poolA.total_liquidity || '0');
        const tvlB = parseFloat(poolB.total_liquidity || '0');
        return tvlA - tvlB;
      },
    },
    {
      key: 'volume',
      label: '24h Volume',
      sortFn: (a, b) => {
        const poolA = a as PoolInfo;
        const poolB = b as PoolInfo;
        const volumeA = parseFloat(poolA.volume_24h || '0');
        const volumeB = parseFloat(poolB.volume_24h || '0');
        return volumeA - volumeB;
      },
    },
    {
      key: 'fees',
      label: '24h Fees',
      sortFn: (a, b) => {
        const poolA = a as PoolInfo;
        const poolB = b as PoolInfo;
        const feesA = parseFloat(poolA.fees_24h || '0');
        const feesB = parseFloat(poolB.fees_24h || '0');
        return feesA - feesB;
      },
    },
  ];

  // Add user liquidity sort if positions are available
  if (showUserPositions && userPositions.length > 0) {
    sortOptions.push({
      key: 'myLiquidity',
      label: 'My Liquidity',
      sortFn: (a, b) => {
        const poolA = a as PoolInfo;
        const poolB = b as PoolInfo;
        const positionA = userPositions.find((pos: UserPoolPosition) => pos.poolId === poolA.pool_id);
        const positionB = userPositions.find((pos: UserPoolPosition) => pos.poolId === poolB.pool_id);
        const valueA = positionA ? positionA.value : 0;
        const valueB = positionB ? positionB.value : 0;
        return valueA - valueB;
      },
    });
  }

  // Default statistics for pools
  const statConfigs: StatConfig[] = [
    {
      key: 'total',
      label: 'Total Pools',
      calculateFn: (items) => items.length,
    },
    {
      key: 'totalTvl',
      label: 'Total TVL',
      calculateFn: (items) => {
        const totalTvl = items.reduce((sum, item) => {
          const pool = item as PoolInfo;
          return sum + parseFloat(pool.total_liquidity || '0');
        }, 0);
        return totalTvl;
      },
      formatFn: (value) => {
        const num = Number(value);
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
      },
    },
  ];

  // Add user-specific stats if positions are available
  if (showUserPositions && userPositions.length > 0) {
    statConfigs.push({
      key: 'userPositions',
      label: 'My Positions',
      calculateFn: () => userPositions.length,
    });

    statConfigs.push({
      key: 'userValue',
      label: 'My Total Value',
      calculateFn: () => {
        return userPositions.reduce((sum: number, pos: UserPoolPosition) => sum + pos.value, 0);
      },
      formatFn: (value) => {
        const num = Number(value);
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
      },
    });
  }

  return {
    dataType: 'pools',
    storeKey: 'pools',
    itemComponent: 'pool-item',
    displayMode,
    cardTitle,
    emptyStateMessage: 'No pools found matching your criteria',
    loadingMessage: 'Loading pools...',
    itemComponentProps: {
      walletAddress,
    },
    search: {
      enabled: true,
      placeholder: 'Search pools...',
      searchFields: ['token_1', 'token_2', 'pool_id'],
      searchFn: (item, query) => {
        const pool = item as PoolInfo;
        // This would be enhanced with token metadata for better search
        return pool.token_1.toLowerCase().includes(query) ||
               pool.token_2.toLowerCase().includes(query) ||
               pool.pool_id.toLowerCase().includes(query);
      },
    },
    filters,
    sorting: {
      enabled: true,
      defaultSortBy: 'apr',
      defaultSortOrder: 'desc',
      options: sortOptions,
    },
    pagination: {
      enabled: true,
      itemsPerPage: 10,
      showPageNumbers: true,
      maxPageNumbers: 5,
    },
    statistics: {
      enabled: true,
      configs: statConfigs,
    },
    events: {
      itemSelect: false, // Pools use custom events like addLiquidity, removeLiquidity
      itemHover: false,
      customEvents: ['addLiquidity', 'removeLiquidity', 'stakeTokens', 'claimRewards'],
    },
    ...customOptions,
  };
}

/**
 * Utility function to create a quick configuration based on data type
 */
export function createDataListConfig(
  dataType: 'tokens',
  options?: Partial<TokenListConfig>
): DataListConfig<TokenMetadata>;
export function createDataListConfig(
  dataType: 'chains',
  options?: Partial<ChainListConfig>
): DataListConfig<EuclidChainConfig>;
export function createDataListConfig(
  dataType: 'pools',
  options?: Partial<PoolListConfig>
): DataListConfig<PoolInfo>;
export function createDataListConfig(
  dataType: 'tokens' | 'chains' | 'pools',
  options: Record<string, unknown> = {}
): DataListConfig {
  switch (dataType) {
    case 'tokens':
      return createTokensConfig(options as Partial<TokenListConfig>);
    case 'chains':
      return createChainsConfig(options as Partial<ChainListConfig>);
    case 'pools':
      return createPoolsConfig(options as Partial<PoolListConfig>);
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
}
