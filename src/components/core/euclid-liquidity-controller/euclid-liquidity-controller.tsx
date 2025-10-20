import { Component, Listen, State, Watch } from '@stencil/core';
import { liquidityStore } from '../../../store/liquidity.store';
import { walletStore } from '../../../store/wallet.store';
import { apiClient } from '../../../utils/api-client';
import { EUCLID_EVENTS, dispatchEuclidEvent } from '../../../utils/events';

interface TransactionResponse {
  txHash?: string;
  transactionHash?: string;
}

@Component({
  tag: 'euclid-liquidity-controller',
  shadow: true,
})
export class EuclidLiquidityController {
  @State() isInitialized = false;

  async componentDidLoad() {
    await this.initialize();
  }

  private async initialize() {
    console.log('💧 Initializing Liquidity Controller...');

    // Subscribe to liquidity store changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (liquidityStore.onChange as any)('selectedPool', () => this.handlePoolChange());

    this.isInitialized = true;
    console.log('✅ Liquidity Controller initialized');
  }

  private handlePoolChange() {
    const { selectedPool } = liquidityStore.state;
    if (selectedPool) {
      console.log('🏊 Pool selected for liquidity operations:', selectedPool.id);
    }
  }

  // Execute add liquidity transaction
  async executeAddLiquidity(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const { selectedPool, token1, token2, token1Amount, token2Amount } = liquidityStore.state;

      if (!selectedPool || !token1 || !token2 || !token1Amount || !token2Amount) {
        return { success: false, error: 'Missing required liquidity parameters' };
      }

      // Check if wallets are connected for both tokens
      const token1Wallet = walletStore.getWallet(token1.chainUID);
      const token2Wallet = walletStore.getWallet(token2.chainUID);

      if (!token1Wallet?.isConnected) {
        return { success: false, error: `Wallet not connected for ${token1.symbol}` };
      }

      if (!token2Wallet?.isConnected) {
        return { success: false, error: `Wallet not connected for ${token2.symbol}` };
      }

      // Check sufficient balances
      if (!walletStore.hasSufficientBalance(token1.chainUID, token1.id, token1Amount)) {
        return { success: false, error: `Insufficient ${token1.symbol} balance` };
      }

      if (!walletStore.hasSufficientBalance(token2.chainUID, token2.id, token2Amount)) {
        return { success: false, error: `Insufficient ${token2.symbol} balance` };
      }

      liquidityStore.setAddingLiquidity(true);

      console.log('💧 Executing add liquidity...', {
        pool: selectedPool.id,
        token1: token1.symbol,
        token2: token2.symbol,
        amount1: token1Amount,
        amount2: token2Amount,
      });

      // Execute add liquidity via API
      const result = await apiClient.createAddLiquidityTransaction({
        poolId: selectedPool.id,
        token1Id: token1.id,
        token2Id: token2.id,
        token1Amount,
        token2Amount,
        token1UserAddress: token1Wallet.address,
        token2UserAddress: token2Wallet.address,
        slippage: 0.5, // Default 0.5% slippage
        deadline: Math.floor(Date.now() / 1000) + 1200, // 20 minutes
      });

      if (result.success && result.data) {
        const transactionData = result.data as TransactionResponse;
        const { txHash } = transactionData;

                // Get wallet info and track the transaction
        const connectedWallets = walletStore.getAllConnectedWallets();
        const walletInfo = connectedWallets[0]; // Use primary wallet
        const primaryChain = walletInfo.chainUID;

        walletStore.addTransaction(primaryChain, {
          txHash: txHash || (result.data as TransactionResponse)?.transactionHash || 'pending',
          fromAddress: walletInfo.address,
          chainUID: primaryChain,
          type: 'add_liquidity',
          status: 'pending',
          timestamp: Date.now().toString(),
          amount: token1Amount,
          tokenId: token1.symbol,
        });

        // Emit global event for transaction tracking
        dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.SUBMITTED, {
          txHash,
          chainUID: primaryChain,
          type: 'add_liquidity',
        });

        console.log('✅ Add liquidity transaction submitted:', txHash);
        return { success: true, txHash };
      } else {
        return { success: false, error: result.error || 'Add liquidity execution failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Add liquidity execution error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      liquidityStore.setAddingLiquidity(false);
    }
  }

  // Execute remove liquidity transaction
  async executeRemoveLiquidity(
    poolId: string,
    lpTokenAmount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const position = liquidityStore.getPosition(poolId);
      if (!position) {
        return { success: false, error: 'Liquidity position not found' };
      }

      const { pool } = position;
      const primaryWallet = walletStore.getWallet(pool.token1.chainUID);

      if (!primaryWallet?.isConnected) {
        return { success: false, error: `Wallet not connected for ${pool.token1.chainUID}` };
      }

      // Check sufficient LP token balance
      const lpBalance = walletStore.getWalletBalance(pool.token1.chainUID, `lp-${poolId}`);
      if (!lpBalance || BigInt(lpBalance.amount) < BigInt(lpTokenAmount)) {
        return { success: false, error: 'Insufficient LP token balance' };
      }

      liquidityStore.setRemovingLiquidity(true);

      console.log('💧 Executing remove liquidity...', {
        poolId,
        lpAmount: lpTokenAmount,
      });

      // Execute remove liquidity via API
      const result = await apiClient.createRemoveLiquidityTransaction({
        poolId,
        lpTokenAmount,
        userAddress: primaryWallet.address,
        slippage: 0.5, // Default 0.5% slippage
        deadline: Math.floor(Date.now() / 1000) + 1200, // 20 minutes
      });

      if (result.success && result.data) {
        const transactionData = result.data as TransactionResponse;
        const { txHash } = transactionData;

        // Add transaction to wallet store
        const walletInfo = walletStore.getWallet(pool.token1.chainUID);
        walletStore.addTransaction(pool.token1.chainUID, {
          txHash,
          fromAddress: walletInfo.address,
          chainUID: pool.token1.chainUID,
          type: 'remove_liquidity',
          status: 'pending',
          timestamp: Date.now().toString(),
          amount: lpTokenAmount,
          tokenId: `LP-${pool.token1.symbol}-${pool.token2.symbol}`,
        });

        // Emit global event for transaction tracking
        dispatchEuclidEvent(EUCLID_EVENTS.TRANSACTION.SUBMITTED, {
          txHash,
          chainUID: pool.token1.chainUID,
          type: 'remove_liquidity',
        });

        console.log('✅ Remove liquidity transaction submitted:', txHash);
        return { success: true, txHash };
      } else {
        return { success: false, error: result.error || 'Remove liquidity execution failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Remove liquidity execution error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      liquidityStore.setRemovingLiquidity(false);
    }
  }

  // Event listeners
  @Listen(EUCLID_EVENTS.LIQUIDITY.ADD_REQUEST, { target: 'window' })
  async handleAddLiquidityExecution() {
    console.log('💧 Add liquidity execution requested via event');
    const result = await this.executeAddLiquidity();

    // Emit result event
    if (result.success) {
      dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.ADD_SUCCESS, {
        txHash: result.txHash,
      });
    } else {
      dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.ADD_FAILED, {
        error: result.error,
      });
    }
  }

  @Listen(EUCLID_EVENTS.LIQUIDITY.REMOVE_REQUEST, { target: 'window' })
  async handleRemoveLiquidityExecution(event: CustomEvent<{ poolId: string; lpTokenAmount: string }>) {
    console.log('💧 Remove liquidity execution requested via event');
    const { poolId, lpTokenAmount } = event.detail;
    const result = await this.executeRemoveLiquidity(poolId, lpTokenAmount);

    // Emit result event
    if (result.success) {
      dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.REMOVE_SUCCESS, {
        txHash: result.txHash,
      });
    } else {
      dispatchEuclidEvent(EUCLID_EVENTS.LIQUIDITY.REMOVE_FAILED, {
        error: result.error,
      });
    }
  }

  @Watch('isInitialized')
  onInitializedChange(newValue: boolean) {
    if (newValue) {
      console.log('💧 Liquidity Controller ready for operations');
    }
  }

  render() {
    // This is a headless controller - no visual output
    return null;
  }
}
