/**
 * Lazy Routing Module - REST Routing Operations
 * Extracted from massive rest-client.ts for on-demand loading
 */

import { DEFAULT_CONFIG } from '../env';

// Import the proper type
import type { GetRoutesRequest } from '../types/api.types';

interface RoutingConfig {
  restEndpoint: string;
  apiTimeout: number;
}

interface RoutePath {
  total_price_impact: string;
  estimated_amount_out: string;
  steps: Array<{
    pool_id: string;
    token_in: string;
    token_out: string;
    amount_in: string;
    amount_out: string;
    price_impact: string;
  }>;
}

/**
 * Lightweight REST request executor for routing
 */
async function executeRoutingRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
  config?: Partial<RoutingConfig>
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { method = 'GET', body, headers = {} } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.apiTimeout);

  try {
    const url = new URL(path, finalConfig.restEndpoint);

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    const baseMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Routing request failed: ${baseMessage}`);
  }
}

/**
 * Get routes - extracted implementation
 */
export async function getRoutesImpl(request: GetRoutesRequest): Promise<RoutePath[]> {
  const queryParams = new URLSearchParams({
    amount_in: request.amount_in,
    token_in: request.token_in,
    token_out: request.token_out,
  });

  if (request.external !== undefined) {
    queryParams.append('external', request.external.toString());
  }

  if (request.chain_uids && request.chain_uids.length > 0) {
    request.chain_uids.forEach(uid => {
      queryParams.append('chain_uids', uid);
    });
  }

  const result = await executeRoutingRequest<{ paths: RoutePath[] }>(`/routes?${queryParams}`);
  return result.paths || [];
}

/**
 * Get optimal route - extracted implementation
 */
export async function getOptimalRouteImpl(request: GetRoutesRequest): Promise<RoutePath | null> {
  const result = await executeRoutingRequest<{ route: RoutePath | null }>('/routes/optimal', {
    method: 'POST',
    body: request,
  });

  return result.route;
}

/**
 * Get best route (wrapper around getRoutes with optimization) - extracted implementation
 */
export async function getBestRouteImpl(request: GetRoutesRequest): Promise<RoutePath | null> {
  const routes = await getRoutesImpl(request);

  if (routes.length === 0) {
    return null;
  }

  // Sort by total price impact (lower is better)
  return routes.sort((a, b) =>
    parseFloat(a.total_price_impact) - parseFloat(b.total_price_impact)
  )[0];
}
