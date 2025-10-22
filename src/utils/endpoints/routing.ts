/**
 * Routing Endpoints - Lazy Loaded
 * Swap routing, path finding, and optimization endpoints
 */

import type { EndpointCategory } from './base';

export const ROUTING_ENDPOINTS: EndpointCategory = {
  name: 'routing',
  endpoints: [
    {
      id: 'getRoutes',
      method: 'GET',
      path: '/routes',
      type: 'rest',
      cacheStrategy: 'minimal',
      priority: 'high',
    },
    {
      id: 'getOptimalRoute',
      method: 'POST',
      path: '/routes/optimal',
      type: 'rest',
      cacheStrategy: 'minimal',
      priority: 'high',
    },
    {
      id: 'getMultiRoutes',
      method: 'POST',
      path: '/routes/multi',
      type: 'rest',
      cacheStrategy: 'minimal',
      priority: 'high',
    },
    {
      id: 'getRouteStatistics',
      method: 'GET',
      path: '/routes/statistics',
      type: 'rest',
      cacheStrategy: 'moderate',
      priority: 'low',
    },
    {
      id: 'getRouteFees',
      method: 'POST',
      path: '/routes/fees',
      type: 'rest',
      cacheStrategy: 'minimal',
      priority: 'normal',
    },
    {
      id: 'simulateRoute',
      method: 'POST',
      path: '/routes/simulate',
      type: 'rest',
      cacheStrategy: 'none',
      priority: 'normal',
    },
  ],
};

export default ROUTING_ENDPOINTS;
