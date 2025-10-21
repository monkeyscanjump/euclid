/**
 * Wallet Adapter Utility
 *
 * Abstracts the actual connection logic for different wallet types.
 * Used by euclid-wallet-controller to maintain separation of concerns.
 */
var _a;
// Keplr Wallet Adapter
class KeplrAdapter {
    get keplr() {
        return window.keplr;
    }
    isInstalled() {
        return !!window.keplr;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'Keplr wallet not installed' };
            }
            // Suggest chain if not already added
            if (chainConfig.type === 'Cosmwasm') {
                try {
                    await this.keplr.experimentalSuggestChain({
                        chainId: chainConfig.chain_id,
                        chainName: chainConfig.display_name,
                        rpc: 'https://rpc.cosmos.network', // Default RPC
                        rest: 'https://api.cosmos.network', // Default REST
                        bip44: { coinType: 118 },
                        bech32Config: {
                            bech32PrefixAccAddr: this.getAddressPrefix(chainConfig.chain_id),
                            bech32PrefixAccPub: this.getAddressPrefix(chainConfig.chain_id) + 'pub',
                            bech32PrefixValAddr: this.getAddressPrefix(chainConfig.chain_id) + 'valoper',
                            bech32PrefixValPub: this.getAddressPrefix(chainConfig.chain_id) + 'valoperpub',
                            bech32PrefixConsAddr: this.getAddressPrefix(chainConfig.chain_id) + 'valcons',
                            bech32PrefixConsPub: this.getAddressPrefix(chainConfig.chain_id) + 'valconspub'
                        },
                        currencies: [{
                                coinDenom: 'ATOM', // Default
                                coinMinimalDenom: 'uatom',
                                coinDecimals: 6,
                            }],
                        feeCurrencies: [{
                                coinDenom: 'ATOM', // Default
                                coinMinimalDenom: 'uatom',
                                coinDecimals: 6,
                            }],
                        stakeCurrency: {
                            coinDenom: 'ATOM', // Default
                            coinMinimalDenom: 'uatom',
                            coinDecimals: 6,
                        }
                    });
                }
                catch (suggestError) {
                    console.warn('Failed to suggest chain to Keplr:', suggestError);
                }
            }
            // Enable the chain
            await this.keplr.enable(chainConfig.chain_id);
            // Get the offline signer and accounts
            const offlineSigner = this.keplr.getOfflineSigner(chainConfig.chain_id);
            const accounts = await offlineSigner.getAccounts();
            if (accounts.length === 0) {
                return { success: false, error: 'No accounts found' };
            }
            return {
                success: true,
                address: accounts[0].address,
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to Keplr',
            };
        }
    }
    async disconnect(chainUID) {
        // Keplr doesn't have a programmatic disconnect method
        // The user needs to disconnect from the Keplr extension directly
        console.log('Keplr disconnect requested for:', chainUID);
    }
    async getAddress(chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            // Use Keplr's getKey method to get the address
            const key = await this.keplr.getKey(chainUID);
            return key.bech32Address;
        }
        catch {
            return null;
        }
    }
    async switchChain(chainConfig) {
        try {
            await this.keplr.enable(chainConfig.chain_id);
            return true;
        }
        catch {
            return false;
        }
    }
    getAddressPrefix(chainId) {
        // Common Cosmos chain prefixes
        const prefixes = {
            'cosmoshub-4': 'cosmos',
            'osmosis-1': 'osmo',
            'juno-1': 'juno',
            'stargaze-1': 'stars',
        };
        return prefixes[chainId] || 'cosmos';
    }
}
// MetaMask Wallet Adapter
class MetaMaskAdapter {
    get ethereum() {
        return window.ethereum;
    }
    isInstalled() {
        return !!window.ethereum && window.ethereum.isMetaMask;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'MetaMask not installed' };
            }
            if (chainConfig.type !== 'EVM') {
                return { success: false, error: 'MetaMask only supports EVM chains' };
            }
            // Request account access
            const accounts = await this.ethereum.request({
                method: 'eth_requestAccounts'
            });
            if (!Array.isArray(accounts) || accounts.length === 0) {
                return { success: false, error: 'No accounts found' };
            }
            // Switch to or add the correct network
            const switched = await this.switchChain(chainConfig);
            if (!switched) {
                return { success: false, error: 'Failed to switch network' };
            }
            return {
                success: true,
                address: accounts[0],
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to MetaMask',
            };
        }
    }
    async disconnect(_chainUID) {
        // MetaMask doesn't have a programmatic disconnect method
        // The connection persists until the user disconnects from MetaMask directly
        // Parameter kept for interface consistency but not used in MetaMask
    }
    async getAddress(_chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            const accounts = await this.ethereum.request({
                method: 'eth_accounts'
            });
            return Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
        }
        catch {
            return null;
        }
    }
    async switchChain(chainConfig) {
        try {
            const chainIdHex = `0x${parseInt(chainConfig.chain_id).toString(16)}`;
            // Try to switch to the chain
            try {
                await this.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainIdHex }],
                });
                return true;
            }
            catch (switchError) {
                // Chain not added to MetaMask, try to add it
                if (switchError.code === 4902) {
                    await this.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                                chainId: chainIdHex,
                                chainName: chainConfig.display_name,
                                rpcUrls: ['https://rpc.example.com'], // Default RPC
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                blockExplorerUrls: chainConfig.explorer_url ? [chainConfig.explorer_url] : [],
                            }],
                    });
                    return true;
                }
                throw switchError;
            }
        }
        catch {
            return false;
        }
    }
}
// Cosmostation Adapter (similar to Keplr but for Cosmostation wallet)
class CosmostationAdapter {
    get cosmostation() {
        return window.cosmostation;
    }
    isInstalled() {
        return !!window.cosmostation;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'Cosmostation wallet not installed' };
            }
            if (chainConfig.type !== 'Cosmwasm') {
                return { success: false, error: 'Cosmostation only supports Cosmos chains' };
            }
            const account = await this.cosmostation.cosmos.request({
                method: 'cos_requestAccount',
                params: { chainName: chainConfig.chain_id },
            });
            return {
                success: true,
                address: account.address,
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to Cosmostation',
            };
        }
    }
    async disconnect(chainUID) {
        console.log('Cosmostation disconnect requested for:', chainUID);
    }
    async getAddress(chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            const account = await this.cosmostation.cosmos.request({
                method: 'cos_account',
                params: { chainName: chainUID },
            });
            return account?.address || null;
        }
        catch {
            return null;
        }
    }
    async switchChain(_chainConfig) {
        // Cosmostation handles chain switching automatically
        return true;
    }
}
// Phantom Wallet Adapter
class PhantomAdapter {
    get phantom() {
        return window.phantom?.ethereum;
    }
    isInstalled() {
        return !!this.phantom;
    }
    async connect(chainConfig) {
        try {
            if (!this.isInstalled()) {
                return { success: false, error: 'Phantom wallet not installed' };
            }
            if (chainConfig.type !== 'EVM') {
                return { success: false, error: 'Phantom only supports EVM chains' };
            }
            // Request account access
            const accounts = await this.phantom.request({
                method: 'eth_requestAccounts'
            });
            if (!Array.isArray(accounts) || accounts.length === 0) {
                return { success: false, error: 'No accounts found' };
            }
            return {
                success: true,
                address: accounts[0],
                chainId: chainConfig.chain_id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect to Phantom',
            };
        }
    }
    async disconnect(_chainUID) {
        // Phantom doesn't have a programmatic disconnect method
    }
    async getAddress(_chainUID) {
        try {
            if (!this.isInstalled())
                return null;
            const accounts = await this.phantom.request({
                method: 'eth_accounts'
            });
            return Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
        }
        catch {
            return null;
        }
    }
    async switchChain(chainConfig) {
        try {
            const chainIdHex = `0x${parseInt(chainConfig.chain_id).toString(16)}`;
            await this.phantom.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
// Wallet Adapter Factory
class WalletAdapterFactory {
    static getAdapter(walletType) {
        return this.adapters.get(walletType) || null;
    }
    static getAvailableWallets() {
        return Array.from(this.adapters.entries()).map(([type, adapter]) => ({
            type,
            installed: adapter.isInstalled(),
        }));
    }
    static async connectWallet(walletType, chainConfig) {
        const adapter = this.getAdapter(walletType);
        if (!adapter) {
            return { success: false, error: `Adapter not found for ${walletType}` };
        }
        return adapter.connect(chainConfig);
    }
    static async disconnectWallet(walletType, chainUID) {
        const adapter = this.getAdapter(walletType);
        if (adapter) {
            await adapter.disconnect(chainUID);
        }
    }
}
_a = WalletAdapterFactory;
WalletAdapterFactory.adapters = new Map();
(() => {
    _a.adapters.set('keplr', new KeplrAdapter());
    _a.adapters.set('metamask', new MetaMaskAdapter());
    _a.adapters.set('phantom', new PhantomAdapter());
    _a.adapters.set('cosmostation', new CosmostationAdapter());
})();

export { WalletAdapterFactory as W };
//# sourceMappingURL=p-BMm0inSs.js.map

//# sourceMappingURL=p-BMm0inSs.js.map