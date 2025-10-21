import { Component, h, Event, EventEmitter } from '@stencil/core';
import { appStore } from '../../../store/app.store';
import type { TokenMetadata } from '../../../utils/types/api.types';

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  address?: string;
  balance?: string;
  tokenId?: string;
  displayName?: string;
  coinDecimal?: number;
  chain_uid?: string;
  chainUID?: string;
  logo?: string;
  price?: number;
  priceUsd?: string;
}

@Component({
  tag: 'euclid-token-content',
  styleUrl: 'euclid-token-content.css',
  shadow: true,
})
export class EuclidTokenContent {
  @Event() tokenSelect!: EventEmitter<{
    token: TokenInfo;
    selectorType: 'input' | 'output';
  }>;

  private convertTokenMetadataToTokenInfo(token: TokenMetadata): TokenInfo {
    return {
      tokenId: token.tokenId,
      symbol: token.symbol || token.displayName.toUpperCase(),
      name: token.displayName,
      decimals: token.coinDecimal,
      logoUrl: token.logo || token.image,
      balance: '0', // Would need to fetch from wallet
      displayName: token.displayName,
      coinDecimal: token.coinDecimal,
      chain_uid: token.chain_uid || token.chain_uids?.[0] || '',
      chainUID: token.chainUID || token.chain_uid || token.chain_uids?.[0] || '',
      address: token.address || token.tokenId,
      logo: token.logo || token.image,
      price: token.price ? parseFloat(token.price) : undefined,
      priceUsd: token.price,
    };
  }

  private handleTokenSelected = (event: CustomEvent<TokenMetadata>) => {
    const tokenMetadata = event.detail;
    const tokenInfo = this.convertTokenMetadataToTokenInfo(tokenMetadata);
    const selectorType = appStore.state.tokenSelectorType || 'input';

    this.tokenSelect.emit({
      token: tokenInfo,
      selectorType
    });

    appStore.closeTokenModal();
  };

  render() {
    return (
      <div class="token-content">
        <euclid-tokens-list
          cardTitle="Select Token"
          itemsPerPage={20}
          onTokenSelected={this.handleTokenSelected}
        />
      </div>
    );
  }
}
