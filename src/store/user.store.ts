import { createStore } from '@stencil/store';
import type {
  UserAddress,
  UserBalance,
  UserTransaction
} from '../utils/types/euclid-api.types';
import type { LiquidityPosition } from '../utils/types/state.types';

export interface UserState {
  isConnected: boolean;
  isLoading: boolean;
  addresses: UserAddress[];
  balances: UserBalance[];
  liquidityPositions: LiquidityPosition[];
  transactions: UserTransaction[];
  totalPortfolioValue: string;
  lastUpdated: string | null;
  error: string | null;
}

const initialState: UserState = {
  isConnected: false,
  isLoading: false,
  addresses: [],
  balances: [],
  liquidityPositions: [],
  transactions: [],
  totalPortfolioValue: '0',
  lastUpdated: null,
  error: null,
};

const { state: userState, onChange, reset } = createStore<UserState>(initialState);

// Export the store instance
export const userStore = {
  state: userState,
  onChange,
  reset,

  // Connection management
  setConnected: (isConnected: boolean) => {
    userState.isConnected = isConnected;
    if (!isConnected) {
      userStore.clearData();
    }
  },

  setLoading: (isLoading: boolean) => {
    userState.isLoading = isLoading;
  },

  setError: (error: string | null) => {
    userState.error = error;
  },

  // Address management
  setAddresses: (addresses: UserAddress[]) => {
    userState.addresses = [...addresses];
    userState.lastUpdated = new Date().toISOString();
  },

  addAddress: (address: UserAddress) => {
    const existingIndex = userState.addresses.findIndex(
      a => a.address === address.address && a.chainUID === address.chainUID
    );

    if (existingIndex >= 0) {
      userState.addresses[existingIndex] = address;
    } else {
      userState.addresses = [...userState.addresses, address];
    }
    userState.lastUpdated = new Date().toISOString();
  },

  removeAddress: (address: string, chainUID: string) => {
    userState.addresses = userState.addresses.filter(
      a => !(a.address === address && a.chainUID === chainUID)
    );

    // Also remove related balances
    userState.balances = userState.balances.filter(
      b => !(b.address === address && b.chainUID === chainUID)
    );

    userState.lastUpdated = new Date().toISOString();
  },

  getAddress: (chainUID: string): UserAddress | undefined => {
    return userState.addresses.find(a => a.chainUID === chainUID);
  },

  // Balance management
  setBalances: (balances: UserBalance[]) => {
    userState.balances = [...balances];
    userStore.updatePortfolioValue();
    userState.lastUpdated = new Date().toISOString();
  },

  addBalances: (newBalances: UserBalance[]) => {
    const updatedBalances = [...userState.balances];

    newBalances.forEach(newBalance => {
      const existingIndex = updatedBalances.findIndex(
        b => b.tokenId === newBalance.tokenId &&
             b.address === newBalance.address &&
             b.chainUID === newBalance.chainUID
      );

      if (existingIndex >= 0) {
        updatedBalances[existingIndex] = newBalance;
      } else {
        updatedBalances.push(newBalance);
      }
    });

    userState.balances = updatedBalances;
    userStore.updatePortfolioValue();
    userState.lastUpdated = new Date().toISOString();
  },

  updateBalance: (tokenId: string, address: string, chainUID: string, newAmount: string) => {
    const existingIndex = userState.balances.findIndex(
      b => b.tokenId === tokenId && b.address === address && b.chainUID === chainUID
    );

    if (existingIndex >= 0) {
      userState.balances[existingIndex].amount = newAmount;
    } else {
      userState.balances = [...userState.balances, {
        tokenId,
        amount: newAmount,
        chainUID,
        address,
      }];
    }

    userStore.updatePortfolioValue();
    userState.lastUpdated = new Date().toISOString();
  },

  getBalance: (tokenId: string, chainUID?: string): UserBalance | undefined => {
    return userState.balances.find(b => {
      if (chainUID) {
        return b.tokenId === tokenId && b.chainUID === chainUID;
      }
      return b.tokenId === tokenId;
    });
  },

  getTotalBalance: (tokenId: string): string => {
    const balances = userState.balances.filter(b => b.tokenId === tokenId);
    return balances.reduce((total, balance) => {
      return (BigInt(total) + BigInt(balance.amount)).toString();
    }, '0');
  },

  // Liquidity position management
  setLiquidityPositions: (positions: LiquidityPosition[]) => {
    userState.liquidityPositions = [...positions];
    userState.lastUpdated = new Date().toISOString();
  },

  addLiquidityPositions: (newPositions: LiquidityPosition[]) => {
    const updatedPositions = [...userState.liquidityPositions];

    newPositions.forEach(newPosition => {
      const existingIndex = updatedPositions.findIndex(
        p => p.poolId === newPosition.poolId
      );

      if (existingIndex >= 0) {
        updatedPositions[existingIndex] = newPosition;
      } else {
        updatedPositions.push(newPosition);
      }
    });

    userState.liquidityPositions = updatedPositions;
    userState.lastUpdated = new Date().toISOString();
  },

  removeLiquidityPosition: (poolId: string) => {
    userState.liquidityPositions = userState.liquidityPositions.filter(
      p => p.poolId !== poolId
    );
    userState.lastUpdated = new Date().toISOString();
  },

  getLiquidityPosition: (poolId: string): LiquidityPosition | undefined => {
    return userState.liquidityPositions.find(p => p.poolId === poolId);
  },

  // Transaction management
  setTransactions: (transactions: UserTransaction[]) => {
    userState.transactions = [...transactions];
    userState.lastUpdated = new Date().toISOString();
  },

  addTransaction: (transaction: UserTransaction) => {
    userState.transactions = [transaction, ...userState.transactions];
    userState.lastUpdated = new Date().toISOString();
  },

  updateTransactionStatus: (txHash: string, status: UserTransaction['status']) => {
    const existingIndex = userState.transactions.findIndex(t => t.txHash === txHash);
    if (existingIndex >= 0) {
      userState.transactions[existingIndex].status = status;
      userState.lastUpdated = new Date().toISOString();
    }
  },

  // Portfolio calculations
  updatePortfolioValue: () => {
    // This is a simplified calculation
    // In a real app, you'd need token prices from the market store
    let totalValue = BigInt(0);

    userState.balances.forEach(balance => {
      // For now, assume 1:1 USD value for simplicity
      // In practice, you'd multiply by token price from market data
      totalValue += BigInt(balance.amount);
    });

    userState.totalPortfolioValue = totalValue.toString();
  },

  // Utility methods
  clearData: () => {
    userState.addresses = [];
    userState.balances = [];
    userState.liquidityPositions = [];
    userState.transactions = [];
    userState.totalPortfolioValue = '0';
    userState.lastUpdated = null;
    userState.error = null;
  },

  // Check if user has sufficient balance for a transaction
  hasSufficientBalance: (tokenId: string, amount: string, chainUID?: string): boolean => {
    const balance = userStore.getBalance(tokenId, chainUID);
    if (!balance) return false;

    try {
      return BigInt(balance.amount) >= BigInt(amount);
    } catch {
      return false;
    }
  },

  // Get formatted balance string
  getFormattedBalance: (tokenId: string, decimals: number = 6, chainUID?: string): string => {
    const balance = userStore.getBalance(tokenId, chainUID);
    if (!balance) return '0';

    try {
      const amount = BigInt(balance.amount);
      const divisor = BigInt(10 ** decimals);
      const wholePart = amount / divisor;
      const fractionalPart = amount % divisor;

      if (fractionalPart === BigInt(0)) {
        return wholePart.toString();
      }

      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      const trimmedFractional = fractionalStr.replace(/0+$/, '');

      return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
    } catch {
      return '0';
    }
  },

  isDataStale: (): boolean => {
    if (!userState.lastUpdated) return true;

    const lastUpdate = new Date(userState.lastUpdated);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    // Consider data stale after 5 minutes
    return diffMinutes > 5;
  },
} as any;
