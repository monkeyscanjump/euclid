// Euclid Protocol API types - based on official documentation

// Common Cross-Chain Types
export interface CrossChainUser {
  address: string;
  chain_uid: string;
}

export interface CrossChainUserInput {
  address?: string;
  chain_uid?: string;
}

export type Limit =
  | { less_than_or_equal: string }
  | { equal: string }
  | { greater_than_or_equal: string };

export interface CrossChainUserWithLimit {
  limit?: Limit | null;
  user: CrossChainUser;
}

// Token Types
export type TokenType =
  | { native: { denom: string } }
  | { smart: { contract_address: string } }
  | { voucher: Record<string, never> };

export interface TokenWithDenom {
  token: string;
  token_type: TokenType;
}

export interface TokenWithDenomAndAmount {
  token: string;
  amount: string;
  token_type: TokenType;
}

export interface PairWithDenomAndAmount {
  token_1: TokenWithDenomAndAmount;
  token_2: TokenWithDenomAndAmount;
}

// Chain Types
export interface ChainInfo {
  chain_id: string;
  chain_uid: string;
  display_name: string;
  factory_address: string;
  token_factory_address: string;
  explorer_url: string;
  logo: string;
  type: 'EVM' | 'Cosmwasm';
}

// Token Denom Response
export interface TokenDenom {
  chain_uid: string;
  token_type: TokenType;
}

export interface TokenDenomsResponse {
  denoms: TokenDenom[];
}

// Escrow Types
export interface EscrowInfo {
  chain_uid: string;
  balance: string;
  chain_id: string;
}

// Route Types
export interface RouteHop {
  route: string[];
  dex: string;
  amount_in: string;
  amount_out: string;
  chain_uid: string;
  amount_out_for_hops: string[];
}

export interface RoutePath {
  path: RouteHop[];
  total_price_impact: string;
}

export interface RouteResponse {
  paths: RoutePath[];
}

// Swap Types
export interface SwapPath {
  path: Array<{
    route: string[];
    dex: string;
    chain_uid?: string;
    amount_in?: string;
    amount_out?: string;
  }>;
}

export interface PartnerFee {
  partner_fee_bps: number;
  recipient: string;
}

export interface SwapRequest {
  amount_in: string;
  asset_in: TokenWithDenom;
  slippage: string;
  cross_chain_addresses?: CrossChainUserWithLimit[];
  partnerFee?: PartnerFee;
  sender: CrossChainUser;
  swap_path: SwapPath;
  timeout?: string;
}

export interface SimulateSwapResponse {
  amount_out: string;
  asset_out: string;
}

// Liquidity Types
export interface AddLiquidityRequest {
  slippage_tolerance_bps: number;
  timeout?: string;
  pair_info: PairWithDenomAndAmount;
  sender: CrossChainUser;
}

// Pool Types
export interface Pair {
  token_1: string;
  token_2: string;
}

export interface MyPoolInfo {
  height: number;
  vlp: string;
  user: CrossChainUser;
  pair: Pair;
}

// Transaction Response Types
export interface CosmWasmMessage {
  contractAddress: string;
  msg: Record<string, unknown>;
  funds: Array<{ denom: string; amount: string }>;
}

export interface EVMMessage {
  chainId: string;
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
}

export interface CosmWasmTransactionResponse {
  type: 'cosmwasm';
  sender: CrossChainUser;
  contract: string;
  chain_id: string;
  rpc_url: string;
  rest_url: string;
  msgs: CosmWasmMessage[];
  meta?: string;
}

export interface EVMTransactionResponse {
  type: 'evm';
  sender: CrossChainUser;
  chain_id: string;
  contract: string;
  rpc_url: string;
  rest_url: string;
  msgs: EVMMessage[];
  meta?: string;
}

export type TransactionResponse = CosmWasmTransactionResponse | EVMTransactionResponse;

// GraphQL Response Wrappers
export interface ChainsResponse {
  chains: {
    all_chains: ChainInfo[];
  };
}

export interface TokensResponse {
  router: {
    all_tokens: {
      tokens: string[];
    };
  };
}

export interface TokenDenomsGraphQLResponse {
  router: {
    token_denoms: TokenDenomsResponse;
  };
}

export interface EscrowsResponse {
  router: {
    escrows: EscrowInfo[];
  };
}

export interface SimulateSwapGraphQLResponse {
  router: {
    simulate_swap: SimulateSwapResponse;
  };
}

export interface MyPoolsResponse {
  pool: {
    my_pools: MyPoolInfo[];
  };
}

// User-related types for the store
export interface UserAddress {
  address: string;
  chainUID: string;
  walletType: 'keplr' | 'metamask' | 'walletconnect';
  isConnected: boolean;
}

export interface UserBalance {
  tokenId: string;
  amount: string;
  chainUID: string;
  address: string;
}

export interface UserTransaction {
  txHash: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'transfer';
  status: 'pending' | 'confirmed' | 'failed';
  fromAddress: string;
  toAddress?: string;
  amount: string;
  tokenId: string;
  chainUID: string;
  timestamp: string;
  fee?: string;
  blockHeight?: number;
}
