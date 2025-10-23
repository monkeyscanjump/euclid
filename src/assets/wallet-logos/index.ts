/**
 * Wallet Logo Assets
 *
 * SVG logos for all supported wallet providers
 */

// Wallet logo imports
import metamaskLogo from './metamask.svg';
import keplrLogo from './keplr.svg';
import phantomLogo from './phantom.svg';
import cosmostationLogo from './cosmostation.svg';
import walletconnectLogo from './walletconnect.svg';

// Wallet logo mapping
export const walletLogos = {
  metamask: metamaskLogo,
  keplr: keplrLogo,
  phantom: phantomLogo,
  cosmostation: cosmostationLogo,
  walletconnect: walletconnectLogo,
} as const;

// Utility function to get wallet logo
export function getWalletLogo(walletType: keyof typeof walletLogos): string {
  return walletLogos[walletType] || '';
}

// Supported wallet types
export type SupportedWalletType = keyof typeof walletLogos;

// Wallet metadata with proper logos
export const walletMetadata = {
  metamask: {
    name: 'MetaMask',
    logo: metamaskLogo,
    description: 'Connect using MetaMask wallet',
    supportedChains: ['EVM'],
  },
  keplr: {
    name: 'Keplr',
    logo: keplrLogo,
    description: 'Connect using Keplr wallet',
    supportedChains: ['Cosmos', 'CosmWasm'],
  },
  phantom: {
    name: 'Phantom',
    logo: phantomLogo,
    description: 'Connect using Phantom wallet',
    supportedChains: ['EVM', 'Solana'],
  },
  cosmostation: {
    name: 'Cosmostation',
    logo: cosmostationLogo,
    description: 'Connect using Cosmostation wallet',
    supportedChains: ['Cosmos', 'CosmWasm'],
  },
  walletconnect: {
    name: 'WalletConnect',
    logo: walletconnectLogo,
    description: 'Connect using WalletConnect',
    supportedChains: ['EVM', 'Cosmos'],
  },
} as const;

export default walletLogos;
