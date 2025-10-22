/**
 * User Data Endpoints - Lazy Loaded
 * User balances, portfolio, and account data endpoints
 */

import type { EndpointCategory } from './base';

export const USER_ENDPOINTS: EndpointCategory = {
  name: 'user',
  endpoints: [
    {
      id: 'getUserBalances',
      method: 'POST',
      path: '/graphql',
      type: 'graphql',
      query: `
        query Vcoin($user: CrossChainUserInput) {
          vcoin {
            user_balance(user: $user) {
              balances {
                amount
                token_id
              }
            }
          }
        }
      `,
      cacheStrategy: 'minimal',
      priority: 'high',
    },
  ],
};

export default USER_ENDPOINTS;
