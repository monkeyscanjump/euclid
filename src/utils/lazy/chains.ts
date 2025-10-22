/**
 * Lazy Chains Module - COMPLETE GraphQL Chain Operations
 * Extracted from massive graphql-client.ts for on-demand loading
 *
 * IMPLEMENTS ALL DOCUMENTED CHAIN ENDPOINTS:
 * ✅ getChains (all_chains)
 * ✅ getContracts (contracts)
 * ✅ getChainConfig (chain_config)
 * ✅ getEvmChainConfig (evm_chain_config)
 * ✅ getKeplrConfig (keplr_config)
 * ✅ getRouterConfig (router_config)
 * ✅ getAllEvmChains (all_evm_chains)
 */

import { DEFAULT_CONFIG } from '../env';

interface ChainConfig {
  graphqlEndpoint: string;
  apiTimeout: number;
}

/**
 * Lightweight GraphQL query executor for chains
 */
async function executeChainQuery<T>(query: string, variables?: Record<string, unknown>, config?: Partial<ChainConfig>): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.apiTimeout);

  try {
    const response = await fetch(finalConfig.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);
    const baseMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Chain query failed: ${baseMessage}`);
  }
}

/**
 * Get all supported chains - extracted implementation
 */
export async function getChainsImpl(options?: { showAllChains?: boolean; type?: string }) {
  const query = `
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
  `;

  const result = await executeChainQuery<{
    chains: {
      all_chains: Array<{
        chain_id: string;
        chain_uid: string;
        display_name: string;
        factory_address: string;
        token_factory_address: string;
        explorer_url: string;
        logo: string;
        type: string;
      }>;
    };
  }>(query, options);

  return result.chains.all_chains;
}

/**
 * Get contracts for a specific chain - NEW IMPLEMENTATION
 */
export async function getContractsImpl(options?: { chainUId?: string; type?: string }) {
  const query = `
    query Contracts($type: String, $chainUId: String) {
      chains {
        contracts(type: $type, chainUId: $chainUId) {
          ContractAddress
          ChainUID
          Type
        }
      }
    }
  `;

  const result = await executeChainQuery<{
    chains: {
      contracts: Array<{
        ContractAddress: string;
        ChainUID: string;
        Type: string;
      }>;
    };
  }>(query, options);

  return result.chains.contracts;
}

/**
 * Get chain configuration - FIXED TO MATCH DOCUMENTATION
 */
export async function getChainConfigImpl(options: { chainUid?: string; chainId?: string }) {
  const query = `
    query ChainConfig($chainUid: String, $chainId: String) {
      chains {
        chain_config(chain_uid: $chainUid, chain_id: $chainId) {
          chain_id
          chain_uid
          display_name
          explorer_url
          factory_address
          token_factory_address
          logo
          type
        }
      }
    }
  `;

  const result = await executeChainQuery<{
    chains: {
      chain_config: {
        chain_id: string;
        chain_uid: string;
        display_name: string;
        explorer_url: string;
        factory_address: string;
        token_factory_address: string;
        logo: string;
        type: string;
      };
    };
  }>(query, options);

  return result.chains.chain_config;
}

/**
 * Get EVM chain configuration - NEW IMPLEMENTATION
 */
/**
 * Get EVM chain configuration - FIXED TO MATCH DOCUMENTATION
 */
export async function getEvmChainConfigImpl(options: { chainUid?: string; chainId?: string }) {
  const query = `
    query Evm_chain_config($chainUid: String, $chainId: String) {
      chains {
        evm_chain_config(chain_uid: $chainUid, chain_id: $chainId) {
          chain_id
          chain_uid
          explorer_url
          name
          native_currency {
            decimals
            name
            symbol
          }
          rpc_urls {
            default {
              http
            }
          }
        }
      }
    }
  `;

  const result = await executeChainQuery<{
    chains: {
      evm_chain_config: {
        chain_id: string;
        chain_uid: string;
        explorer_url: string;
        name: string;
        native_currency: {
          decimals: number;
          name: string;
          symbol: string;
        };
        rpc_urls: {
          default: {
            http: string[];
          };
        };
      };
    };
  }>(query, options);

  return result.chains.evm_chain_config;
}

/**
 * Get Keplr wallet configuration - NEW IMPLEMENTATION
 */
/**
 * Get Keplr configuration - FIXED TO MATCH DOCUMENTATION
 */
export async function getKeplrConfigImpl(options: { chainId?: string; chainUid?: string }) {
  const query = `
    query Keplr_config($chainId: String, $chainUid: String) {
      chains {
        keplr_config(chain_id: $chainId, chain_uid: $chainUid) {
          chainID
          chainName
          rpc
          rest
          explorer_url
          coinType
          features
          stakeCurrency {
            coinDenom
            coinMinimalDenom
            coinDecimals
            coinGeckoID
          }
          gasPriceStep {
            low
            average
            high
          }
          feeCurrencies {
            coinDenom
            coinMinimalDenom
            coinDecimals
            coinGeckoID
            gasPriceStep {
              low
              average
              high
            }
          }
          currencies {
            coinDenom
            coinMinimalDenom
            coinDecimals
            coinGeckoID
          }
          bech32Config {
            bech32PrefixAccAddr
            bech32PrefixAccPub
            bech32PrefixValAddr
            bech32PrefixValPub
            bech32PrefixConsAddr
            bech32PrefixConsPub
          }
          bip44 {
            coinType
          }
        }
      }
    }
  `;

  const result = await executeChainQuery<{
    chains: {
      keplr_config: {
        chainID: string;
        chainName: string;
        rpc: string;
        rest: string;
        explorer_url: string;
        coinType: string;
        features: string;
        stakeCurrency: {
          coinDenom: string;
          coinMinimalDenom: string;
          coinDecimals: number;
          coinGeckoID: string;
        };
        gasPriceStep: {
          low: number;
          average: number;
          high: number;
        };
        feeCurrencies: Array<{
          coinDenom: string;
          coinMinimalDenom: string;
          coinDecimals: number;
          coinGeckoID: string;
          gasPriceStep: {
            low: number;
            average: number;
            high: number;
          };
        }>;
        currencies: Array<{
          coinDenom: string;
          coinMinimalDenom: string;
          coinDecimals: number;
          coinGeckoID: string;
        }>;
        bech32Config: {
          bech32PrefixAccAddr: string;
          bech32PrefixAccPub: string;
          bech32PrefixValAddr: string;
          bech32PrefixValPub: string;
          bech32PrefixConsAddr: string;
          bech32PrefixConsPub: string;
        };
        bip44: {
          coinType: number;
        };
      };
    };
  }>(query, options);

  return result.chains.keplr_config;
}

/**
 * Get router configuration - FIXED TO MATCH DOCUMENTATION
 */
export async function getRouterConfigImpl() {
  const query = `
    query Router_config {
      chains {
        router_config {
          contract_address
          chain_uid
          type
          explorer_url
          logo
        }
      }
    }
  `;

  const result = await executeChainQuery<{
    chains: {
      router_config: Array<{
        contract_address: string;
        chain_uid: string;
        type: string;
        explorer_url: string;
        logo: string;
      }>;
    };
  }>(query);

  return result.chains.router_config;
}

/**
 * Get all EVM chains - NEW IMPLEMENTATION
 */
/**
 * Get all EVM chains - FIXED TO MATCH DOCUMENTATION
 */
export async function getAllEvmChainsImpl() {
  const query = `
    query AllEvmChains {
      chains {
        all_evm_chains {
          chain_id
          chain_uid
          explorer_url
          name
          native_currency {
            decimals
            name
            symbol
          }
          rpc_urls {
            default {
              http
            }
          }
        }
      }
    }
  `;

  const result = await executeChainQuery<{
    chains: {
      all_evm_chains: Array<{
        chain_id: string;
        chain_uid: string;
        explorer_url: string;
        name: string;
        native_currency: {
          decimals: number;
          name: string;
          symbol: string;
        };
        rpc_urls: {
          default: {
            http: string[];
          };
        };
      }>;
    };
  }>(query);

  return result.chains.all_evm_chains;
}
