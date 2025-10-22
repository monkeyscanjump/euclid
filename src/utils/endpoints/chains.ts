/**
 * Chain Endpoints - Lazy Loaded
 * Blockchain network and chain configuration endpoints
 */

import type { EndpointCategory } from './base';

export const CHAIN_ENDPOINTS: EndpointCategory = {
  name: 'chains',
  endpoints: [
    {
      id: 'getChains',
      method: 'POST',
      path: '/graphql',
      type: 'graphql',
      query: `
        query Chains($showAllChains: Boolean, $type: String) {
          chains {
            all_chains(show_all_chains: $showAllChains, type: $type) {
              chain_id
              chain_uid
              display_name
              factory_address
              token_factory_address
              explorer_url
              logo
              type
            }
          }
        }
      `,
      cacheStrategy: 'aggressive',
      cacheTTL: 300000, // 5 minutes
      priority: 'high',
    },
  ],
};

export default CHAIN_ENDPOINTS;
