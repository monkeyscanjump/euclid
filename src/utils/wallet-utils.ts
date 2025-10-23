import { walletStore } from '../store/wallet.store';
import { marketStore } from '../store/market.store';

export interface ConnectedWallet {
  id: string;
  address: string;
  chainUID: string;
  chainName: string;
  chainLogo: string;
  chainType: string;
  walletType: string;
  provider: string;
  isConnected: boolean;
  label?: string;
}

/**
 * READS ONLY FROM WALLET STORE STATE
 */
export function getConnectedWallets(): ConnectedWallet[] {
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
          walletType: wallet.walletType || 'Connected',
          provider: wallet.walletType || 'Unknown',
          isConnected: true,
          label: `${wallet.name || wallet.walletType || 'Wallet'} (${chain.display_name})`
        });
      }
    }
  }

  return wallets;
}/**
 * ADD CUSTOM WALLETS TO THE LIST
 */
export function addCustomWallets(
  existingWallets: ConnectedWallet[],
  customAddresses: string,
  chainUID: string = 'osmosis-1'
): ConnectedWallet[] {
  if (!customAddresses.trim()) return existingWallets;

  const addresses = customAddresses.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);
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
          isConnected: false,
          label: `Custom Wallet (${chain.display_name})`
        });
      }
    }
  }

  return wallets;
}

/**
 * GET WALLETS FOR A SPECIFIC CHAIN
 */
export function getWalletsForChain(chainUID: string): ConnectedWallet[] {
  return getConnectedWallets().filter(wallet => wallet.chainUID === chainUID);
}

/**
 * SETUP WALLET STORE LISTENERS FOR A COMPONENT
 */
export function setupWalletStoreListeners(refreshCallback: () => void) {
  walletStore.onChange('connectedWallets', refreshCallback);
  walletStore.onChange('isConnected', refreshCallback);
  walletStore.onChange('address', refreshCallback);
  walletStore.onChange('wallets', refreshCallback);
}
