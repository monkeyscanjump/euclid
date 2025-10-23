import { walletStore } from '../store/wallet.store';
import { marketStore } from '../store/market.store';
import { parseCommaSeparated } from './string-helpers';
import { logger } from './logger';

export interface ConnectedWallet {
  id: string;
  address: string;
  chainUID: string;
  chainName: string;
  chainLogo: string;
  chainType: string;
  walletType: string;
  provider: string;
  label?: string;
  autoConnect?: boolean; // Auto-reconnect when session expires
}

/**
 * Get all saved wallets from the store
 */
export function getAllWallets(): ConnectedWallet[] {
  const wallets: ConnectedWallet[] = [];

  // Read from wallet store state.connectedWallets
  if (walletStore.state.connectedWallets) {
    for (const [chainUID, wallet] of Object.entries(walletStore.state.connectedWallets)) {
      const chain = marketStore.state.chains.find(c => c.chain_uid === chainUID);
      if (chain && wallet.address) {
        wallets.push({
          id: `${chainUID}-${wallet.address}`,
          address: wallet.address,
          chainUID,
          chainName: chain.display_name,
          chainLogo: chain.logo,
          chainType: chain.type,
          walletType: wallet.walletType || 'unknown',
          provider: wallet.walletType || 'Unknown',
          label: wallet.name || `${wallet.walletType || 'Wallet'} (${chain.display_name})`,
          autoConnect: wallet.autoConnect ?? false
        });
      }
    }
  }

  return wallets;
}

/**
 * @deprecated Use getAllWallets() instead
 */
export function getConnectedWallets(): ConnectedWallet[] {
  return getAllWallets();
}/**
 * ADD CUSTOM WALLETS TO THE LIST
 */
export function addCustomWallets(
  existingWallets: ConnectedWallet[],
  customAddresses: string,
  chainUID: string = 'osmosis-1'
): ConnectedWallet[] {
  if (!customAddresses.trim()) return existingWallets;

  const addresses = parseCommaSeparated(customAddresses);
  const wallets = [...existingWallets];

  for (const address of addresses) {
    // Don't duplicate
    const alreadyExists = wallets.some(w => w.address === address && w.chainUID === chainUID);
    if (!alreadyExists) {
      const chain = marketStore.state.chains.find(c => c.chain_uid === chainUID);
      if (chain) {
        wallets.push({
          id: `custom-${chainUID}-${address}`,
          address,
          chainUID,
          chainName: chain.display_name,
          chainLogo: chain.logo,
          chainType: chain.type,
          walletType: 'custom',
          provider: 'Custom',
          label: `Custom Wallet (${chain.display_name})`,
          autoConnect: false
        });
      }
    }
  }

  return wallets;
}

/**
 * GET WALLETS FOR A SPECIFIC CHAIN
 * @deprecated Just use getAllWallets().filter(w => w.chainUID === chainUID)
 */
export function getWalletsForChain(chainUID: string): ConnectedWallet[] {
  return getAllWallets().filter(wallet => wallet.chainUID === chainUID);
}

/**
 * SETUP WALLET STORE LISTENERS FOR A COMPONENT
 */
export function setupWalletStoreListeners(refreshCallback: () => void) {
  walletStore.onChange('connectedWallets', refreshCallback);
  walletStore.onChange('address', refreshCallback);
  walletStore.onChange('wallets', refreshCallback);
}

/**
 * ADD MANUAL/CUSTOM WALLET TO WALLET STORE
 */
export function addCustomWallet(
  address: string,
  chainUID: string,
  label: string,
  walletType: 'custom' = 'custom'
): boolean {
  try {
    // Validate inputs
    if (!address || !chainUID || !label) {
      throw new Error('Address, chain, and label are required');
    }

    // Check if wallet already exists for this chain
    const existingWallet = walletStore.getWalletByChain(chainUID);
    if (existingWallet && existingWallet.address === address) {
      logger.warn('WalletUtils', 'Wallet already exists for this chain and address');
      return false;
    }

    // Add wallet to store
    walletStore.addWallet(chainUID, {
      address,
      walletType,
      balances: [],
      name: label,
      autoConnect: false // Default auto-connect to OFF for new wallets
    });

    logger.info('WalletUtils', `Added ${walletType} wallet`, { address, chainUID, label });
    return true;
  } catch (error) {
    logger.error('WalletUtils', 'Failed to add custom wallet', error);
    return false;
  }
}

/**
 * REMOVE WALLET FROM WALLET STORE
 */
export function removeWallet(chainUID: string): boolean {
  try {
    walletStore.removeWallet(chainUID);
    logger.info('WalletUtils', `Removed wallet for chain: ${chainUID}`);
    return true;
  } catch (error) {
    logger.error('WalletUtils', 'Failed to remove wallet', error);
    return false;
  }
}
