/**
 * Auto-connect manager for wallet extensions
 * Handles automatic reconnection when extension sessions expire
 */

import { walletAdapterFactory } from './wallet-adapters';
import { walletStore } from '../store/wallet.store';
import { CoreWalletType } from './types/wallet.types';

/**
 * Try to auto-reconnect a wallet if session expired
 */
export async function tryAutoConnect(
  walletType: CoreWalletType,
  expectedAddress: string,
  chainId?: string
): Promise<boolean> {
  try {
    const adapter = walletAdapterFactory.getAdapter(walletType);

    if (!adapter.isAvailable()) {
      return false;
    }

    // Try to connect (this will prompt user if needed)
    const account = await adapter.connect(chainId);

    // Verify it's the same address we expect
    if (account.address === expectedAddress) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check all saved wallets with auto-connect enabled
 * and try to reconnect them if their sessions expired
 */
export async function processAutoConnects(): Promise<void> {
  const wallets = walletStore.state.connectedWallets;
  if (!wallets) return;

  for (const [, wallet] of Object.entries(wallets)) {
    // Skip if auto-connect is disabled
    if (!wallet.autoConnect) continue;

    // Skip custom wallets (they don't have extensions)
    if (wallet.walletType === 'custom') continue;

    try {
      const adapter = walletAdapterFactory.getAdapter(wallet.walletType as CoreWalletType);
      if (!adapter.isAvailable()) continue;

      // Try to auto-reconnect if session expired
      const reconnected = await tryAutoConnect(
        wallet.walletType as CoreWalletType,
        wallet.address,
        wallet.chainUID
      );

      if (reconnected) {
        // Reconnected successfully - no need to update lastConnectedAt since it's removed
      }

    } catch {
      // Auto-connect failed, continue with other wallets
    }
  }
}

/**
 * Start auto-connect monitoring
 * Checks every 30 seconds for expired sessions
 */
export function startAutoConnectMonitoring(): () => void {
  const interval = setInterval(processAutoConnects, 30000);

  // Also check immediately on startup
  setTimeout(processAutoConnects, 2000);

  return () => clearInterval(interval);
}
