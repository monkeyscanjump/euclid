/**
 * Shared types for EuclidDataList component and managers
 */

import type { TokenMetadata, EuclidChainConfig, PoolInfo } from '../../../utils/types/api.types';

export type DataType = 'tokens' | 'chains' | 'pools';
export type DisplayMode = 'card' | 'list-item' | 'compact' | 'grid';

// Union type for all data items
export type DataItem = TokenMetadata | EuclidChainConfig | PoolInfo;

export interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showFavorites?: boolean;
  typeFilter?: string;
  chainFilter?: string;
  showMyPools?: boolean;
}
