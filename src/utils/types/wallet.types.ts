/**
 * Clean Wallet Types - No more hardcoded enums everywhere!
 */

import type { UserBalance } from './api.types';
import type { EuclidChainConfig, TransactionResponse } from './api.types';

// Supported wallet types
export type WalletType =
  | 'metamask'
  | 'keplr'
  | 'phantom'
  | 'cosmostation'
  | 'walletconnect'
  | 'custom';

// Extension-based wallet types (exclude custom/manual)
export type ExtensionWalletType = Exclude<WalletType, 'custom'>;

// Core wallet types that are fully supported
export type CoreWalletType = 'metamask' | 'keplr' | 'phantom';

// Core wallet types as array for reusable checks
export const CORE_WALLET_TYPES: CoreWalletType[] = ['metamask', 'keplr', 'phantom'];

// All supported wallet types as array for validation
export const ALL_WALLET_TYPES: WalletType[] = ['metamask', 'keplr', 'phantom', 'cosmostation', 'walletconnect', 'custom'];

// EVM-compatible wallet types
export const EVM_WALLET_TYPES: WalletType[] = ['metamask', 'phantom', 'walletconnect'];

// Cosmos-compatible wallet types
export const COSMOS_WALLET_TYPES: WalletType[] = ['keplr', 'cosmostation'];

// Helper functions - NO MORE HARDCODED STRINGS!
export function isCoreWalletType(walletType: string): walletType is CoreWalletType {
  return CORE_WALLET_TYPES.includes(walletType as CoreWalletType);
}

export function isValidWalletType(walletType: string): walletType is WalletType {
  return ALL_WALLET_TYPES.includes(walletType as WalletType);
}

export function isEvmWalletType(walletType: string): boolean {
  return EVM_WALLET_TYPES.includes(walletType as WalletType);
}

export function isCosmosWalletType(walletType: string): boolean {
  return COSMOS_WALLET_TYPES.includes(walletType as WalletType);
}

// Chain types
export type ChainType = 'EVM' | 'Cosmwasm';

// Wallet interface - clean and simple
export interface Wallet {
  address: string;
  chainUID: string;
  walletType: WalletType;
  balances: UserBalance[];
  chainName?: string;
  chainType?: ChainType;
  chainLogo?: string;
  addedAt?: Date;
  lastUsed?: Date;
  autoConnect?: boolean;
  name?: string; // Display label
}

// Wallet connection result
export interface WalletConnection {
  address: string;
  chainId: string;
}

// Wallet adapter interface
export interface WalletAdapter {
  type: CoreWalletType;
  isAvailable(): boolean;
  connect(chainId?: string): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  getCurrentAccount?(): Promise<{ address: string; chainId: string; name?: string } | null>;
  getBalance(address: string): Promise<string>;
  signAndBroadcast(transaction: TransactionResponse): Promise<string>;
  switchChain(chainId: string): Promise<void>;
  addChain(config: EuclidChainConfig): Promise<void>;
}
