/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, NgZone } from '@angular/core';

import { ProxyCmp } from './angular-component-lib/utils';

import type { Components } from '@monkeyscanjump/euclid/components';

import { defineCustomElement as defineEuclidButton } from '@monkeyscanjump/euclid/components/euclid-button.js';
import { defineCustomElement as defineEuclidCoreProvider } from '@monkeyscanjump/euclid/components/euclid-core-provider.js';
import { defineCustomElement as defineEuclidLiquidityCard } from '@monkeyscanjump/euclid/components/euclid-liquidity-card.js';
import { defineCustomElement as defineEuclidLiquidityController } from '@monkeyscanjump/euclid/components/euclid-liquidity-controller.js';
import { defineCustomElement as defineEuclidMarketDataController } from '@monkeyscanjump/euclid/components/euclid-market-data-controller.js';
import { defineCustomElement as defineEuclidModal } from '@monkeyscanjump/euclid/components/euclid-modal.js';
import { defineCustomElement as defineEuclidPoolsList } from '@monkeyscanjump/euclid/components/euclid-pools-list.js';
import { defineCustomElement as defineEuclidPortfolioOverview } from '@monkeyscanjump/euclid/components/euclid-portfolio-overview.js';
import { defineCustomElement as defineEuclidSwapCard } from '@monkeyscanjump/euclid/components/euclid-swap-card.js';
import { defineCustomElement as defineEuclidSwapController } from '@monkeyscanjump/euclid/components/euclid-swap-controller.js';
import { defineCustomElement as defineEuclidTokenContent } from '@monkeyscanjump/euclid/components/euclid-token-content.js';
import { defineCustomElement as defineEuclidTokenInput } from '@monkeyscanjump/euclid/components/euclid-token-input.js';
import { defineCustomElement as defineEuclidTokensList } from '@monkeyscanjump/euclid/components/euclid-tokens-list.js';
import { defineCustomElement as defineEuclidTxTrackerController } from '@monkeyscanjump/euclid/components/euclid-tx-tracker-controller.js';
import { defineCustomElement as defineEuclidUserDataController } from '@monkeyscanjump/euclid/components/euclid-user-data-controller.js';
import { defineCustomElement as defineEuclidWalletContent } from '@monkeyscanjump/euclid/components/euclid-wallet-content.js';
import { defineCustomElement as defineEuclidWalletController } from '@monkeyscanjump/euclid/components/euclid-wallet-controller.js';
import { defineCustomElement as definePoolItem } from '@monkeyscanjump/euclid/components/pool-item.js';
import { defineCustomElement as definePoolsFilters } from '@monkeyscanjump/euclid/components/pools-filters.js';
import { defineCustomElement as definePoolsLoading } from '@monkeyscanjump/euclid/components/pools-loading.js';
import { defineCustomElement as definePoolsStats } from '@monkeyscanjump/euclid/components/pools-stats.js';
import { defineCustomElement as defineTokenItem } from '@monkeyscanjump/euclid/components/token-item.js';
import { defineCustomElement as defineTokensFilters } from '@monkeyscanjump/euclid/components/tokens-filters.js';
import { defineCustomElement as defineTokensLoading } from '@monkeyscanjump/euclid/components/tokens-loading.js';
@ProxyCmp({
  defineCustomElementFn: defineEuclidButton,
  inputs: ['disabled', 'fullWidth', 'href', 'loading', 'size', 'type', 'variant']
})
@Component({
  selector: 'euclid-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['disabled', 'fullWidth', 'href', 'loading', 'size', 'type', 'variant'],
})
export class EuclidButton {
  protected el: HTMLEuclidButtonElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidButton extends Components.EuclidButton {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidCoreProvider
})
@Component({
  selector: 'euclid-core-provider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidCoreProvider {
  protected el: HTMLEuclidCoreProviderElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidCoreProvider extends Components.EuclidCoreProvider {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidLiquidityCard,
  inputs: ['cardTitle', 'defaultSlippage', 'disabled', 'loading', 'lpTokenAmount', 'mode', 'pools', 'positions', 'selectedPool', 'tokenAAmount', 'tokenBAmount', 'tokens', 'walletAddress']
})
@Component({
  selector: 'euclid-liquidity-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['cardTitle', 'defaultSlippage', 'disabled', 'loading', 'lpTokenAmount', 'mode', 'pools', 'positions', 'selectedPool', 'tokenAAmount', 'tokenBAmount', 'tokens', 'walletAddress'],
  outputs: ['liquidityAdded', 'liquidityRemoved', 'poolSelected', 'quoteRequested'],
})
export class EuclidLiquidityCard {
  protected el: HTMLEuclidLiquidityCardElement;
  @Output() liquidityAdded = new EventEmitter<CustomEvent<{ pool: [object Object]; tokenAAmount: string; tokenBAmount: string; expectedLpTokens: string; slippage: number; }>>();
  @Output() liquidityRemoved = new EventEmitter<CustomEvent<{ pool: [object Object]; lpTokenAmount: string; expectedTokenA: string; expectedTokenB: string; slippage: number; }>>();
  @Output() poolSelected = new EventEmitter<CustomEvent<IEuclidLiquidityCardPoolInfo>>();
  @Output() quoteRequested = new EventEmitter<CustomEvent<{ pool: IEuclidLiquidityCardPoolInfo; tokenAAmount?: string; tokenBAmount?: string; lpTokenAmount?: string; mode: 'add' | 'remove'; }>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { LiquidityPoolInfo as IEuclidLiquidityCardLiquidityPoolInfo } from '@monkeyscanjump/euclid/components';
import type { PoolInfo as IEuclidLiquidityCardPoolInfo } from '@monkeyscanjump/euclid/components';

export declare interface EuclidLiquidityCard extends Components.EuclidLiquidityCard {

  liquidityAdded: EventEmitter<CustomEvent<{ pool: [object Object]; tokenAAmount: string; tokenBAmount: string; expectedLpTokens: string; slippage: number; }>>;

  liquidityRemoved: EventEmitter<CustomEvent<{ pool: [object Object]; lpTokenAmount: string; expectedTokenA: string; expectedTokenB: string; slippage: number; }>>;

  poolSelected: EventEmitter<CustomEvent<IEuclidLiquidityCardPoolInfo>>;

  quoteRequested: EventEmitter<CustomEvent<{ pool: IEuclidLiquidityCardPoolInfo; tokenAAmount?: string; tokenBAmount?: string; lpTokenAmount?: string; mode: 'add' | 'remove'; }>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidLiquidityController
})
@Component({
  selector: 'euclid-liquidity-controller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidLiquidityController {
  protected el: HTMLEuclidLiquidityControllerElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidLiquidityController extends Components.EuclidLiquidityController {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidMarketDataController
})
@Component({
  selector: 'euclid-market-data-controller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidMarketDataController {
  protected el: HTMLEuclidMarketDataControllerElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidMarketDataController extends Components.EuclidMarketDataController {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidModal
})
@Component({
  selector: 'euclid-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidModal {
  protected el: HTMLEuclidModalElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidModal extends Components.EuclidModal {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidPoolsList,
  inputs: ['cardTitle', 'itemsPerPage', 'loading', 'pools', 'positions', 'tokenMetadata', 'walletAddress']
})
@Component({
  selector: 'euclid-pools-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['cardTitle', 'itemsPerPage', 'loading', 'pools', 'positions', 'tokenMetadata', 'walletAddress'],
  outputs: ['poolSelected', 'addLiquidity', 'removeLiquidity', 'stakeTokens', 'claimRewards', 'filtersChanged'],
})
export class EuclidPoolsList {
  protected el: HTMLEuclidPoolsListElement;
  @Output() poolSelected = new EventEmitter<CustomEvent<IEuclidPoolsListPoolInfo>>();
  @Output() addLiquidity = new EventEmitter<CustomEvent<IEuclidPoolsListPoolInfo>>();
  @Output() removeLiquidity = new EventEmitter<CustomEvent<{ pool: IEuclidPoolsListPoolInfo; position: [object Object] }>>();
  @Output() stakeTokens = new EventEmitter<CustomEvent<{ pool: IEuclidPoolsListPoolInfo; position?: [object Object] }>>();
  @Output() claimRewards = new EventEmitter<CustomEvent<{ pool: IEuclidPoolsListPoolInfo; position: [object Object] }>>();
  @Output() filtersChanged = new EventEmitter<CustomEvent<IEuclidPoolsListPoolFilters>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { PoolInfo as IEuclidPoolsListPoolInfo } from '@monkeyscanjump/euclid/components';
import type { UserPoolPosition as IEuclidPoolsListUserPoolPosition } from '@monkeyscanjump/euclid/components';
import type { PoolFilters as IEuclidPoolsListPoolFilters } from '@monkeyscanjump/euclid/components';

export declare interface EuclidPoolsList extends Components.EuclidPoolsList {

  poolSelected: EventEmitter<CustomEvent<IEuclidPoolsListPoolInfo>>;

  addLiquidity: EventEmitter<CustomEvent<IEuclidPoolsListPoolInfo>>;

  removeLiquidity: EventEmitter<CustomEvent<{ pool: IEuclidPoolsListPoolInfo; position: [object Object] }>>;

  stakeTokens: EventEmitter<CustomEvent<{ pool: IEuclidPoolsListPoolInfo; position?: [object Object] }>>;

  claimRewards: EventEmitter<CustomEvent<{ pool: IEuclidPoolsListPoolInfo; position: [object Object] }>>;

  filtersChanged: EventEmitter<CustomEvent<IEuclidPoolsListPoolFilters>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidPortfolioOverview,
  inputs: ['cardTitle', 'chartData', 'loading', 'poolPositions', 'portfolioStats', 'showAnalytics', 'stakingPositions', 'timePeriod', 'tokenBalances', 'transactions', 'walletAddress']
})
@Component({
  selector: 'euclid-portfolio-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['cardTitle', 'chartData', 'loading', 'poolPositions', 'portfolioStats', 'showAnalytics', 'stakingPositions', 'timePeriod', 'tokenBalances', 'transactions', 'walletAddress'],
  outputs: ['positionSelected', 'managePosition', 'stakeMore', 'unstake', 'claimRewards', 'viewTransaction', 'timePeriodChanged'],
})
export class EuclidPortfolioOverview {
  protected el: HTMLEuclidPortfolioOverviewElement;
  @Output() positionSelected = new EventEmitter<CustomEvent<IEuclidPortfolioOverviewPoolPosition>>();
  @Output() managePosition = new EventEmitter<CustomEvent<IEuclidPortfolioOverviewPoolPosition>>();
  @Output() stakeMore = new EventEmitter<CustomEvent<IEuclidPortfolioOverviewStakingPosition>>();
  @Output() unstake = new EventEmitter<CustomEvent<IEuclidPortfolioOverviewStakingPosition>>();
  @Output() claimRewards = new EventEmitter<CustomEvent<IEuclidPortfolioOverviewPoolPosition | StakingPosition>>();
  @Output() viewTransaction = new EventEmitter<CustomEvent<IEuclidPortfolioOverviewTransaction>>();
  @Output() timePeriodChanged = new EventEmitter<CustomEvent<string>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { PoolPosition as IEuclidPortfolioOverviewPoolPosition } from '@monkeyscanjump/euclid/components';
import type { StakingPosition as IEuclidPortfolioOverviewStakingPosition } from '@monkeyscanjump/euclid/components';
import type { Transaction as IEuclidPortfolioOverviewTransaction } from '@monkeyscanjump/euclid/components';

export declare interface EuclidPortfolioOverview extends Components.EuclidPortfolioOverview {

  positionSelected: EventEmitter<CustomEvent<IEuclidPortfolioOverviewPoolPosition>>;

  managePosition: EventEmitter<CustomEvent<IEuclidPortfolioOverviewPoolPosition>>;

  stakeMore: EventEmitter<CustomEvent<IEuclidPortfolioOverviewStakingPosition>>;

  unstake: EventEmitter<CustomEvent<IEuclidPortfolioOverviewStakingPosition>>;

  claimRewards: EventEmitter<CustomEvent<IEuclidPortfolioOverviewPoolPosition | StakingPosition>>;

  viewTransaction: EventEmitter<CustomEvent<IEuclidPortfolioOverviewTransaction>>;

  timePeriodChanged: EventEmitter<CustomEvent<string>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidSwapCard,
  inputs: ['cardTitle', 'defaultSlippage', 'disabled', 'inputAmount', 'inputToken', 'loading', 'outputToken', 'showAdvanced', 'tokens', 'walletAddress']
})
@Component({
  selector: 'euclid-swap-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['cardTitle', 'defaultSlippage', 'disabled', 'inputAmount', 'inputToken', 'loading', 'outputToken', 'showAdvanced', 'tokens', 'walletAddress'],
  outputs: ['swapInitiated', 'tokenSelect', 'quoteRequested', 'settingsChanged'],
})
export class EuclidSwapCard {
  protected el: HTMLEuclidSwapCardElement;
  @Output() swapInitiated = new EventEmitter<CustomEvent<{ inputToken: [object Object]; outputToken: [object Object]; inputAmount: string; outputAmount: string; settings: [object Object]; quote: [object Object]; }>>();
  @Output() tokenSelect = new EventEmitter<CustomEvent<{ type: 'input' | 'output'; token: [object Object]; }>>();
  @Output() quoteRequested = new EventEmitter<CustomEvent<{ inputToken: [object Object]; outputToken: [object Object]; inputAmount: string; }>>();
  @Output() settingsChanged = new EventEmitter<CustomEvent<IEuclidSwapCardSwapSettings>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { SwapToken as IEuclidSwapCardSwapToken } from '@monkeyscanjump/euclid/components';
import type { SwapSettings as IEuclidSwapCardSwapSettings } from '@monkeyscanjump/euclid/components';
import type { SwapQuote as IEuclidSwapCardSwapQuote } from '@monkeyscanjump/euclid/components';

export declare interface EuclidSwapCard extends Components.EuclidSwapCard {

  swapInitiated: EventEmitter<CustomEvent<{ inputToken: [object Object]; outputToken: [object Object]; inputAmount: string; outputAmount: string; settings: [object Object]; quote: [object Object]; }>>;

  tokenSelect: EventEmitter<CustomEvent<{ type: 'input' | 'output'; token: [object Object]; }>>;

  quoteRequested: EventEmitter<CustomEvent<{ inputToken: [object Object]; outputToken: [object Object]; inputAmount: string; }>>;

  settingsChanged: EventEmitter<CustomEvent<IEuclidSwapCardSwapSettings>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidSwapController
})
@Component({
  selector: 'euclid-swap-controller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidSwapController {
  protected el: HTMLEuclidSwapControllerElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidSwapController extends Components.EuclidSwapController {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidTokenContent
})
@Component({
  selector: 'euclid-token-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  outputs: ['tokenSelect'],
})
export class EuclidTokenContent {
  protected el: HTMLEuclidTokenContentElement;
  @Output() tokenSelect = new EventEmitter<CustomEvent<{ token: [object Object]; selectorType: 'input' | 'output'; }>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { TokenInfo as IEuclidTokenContentTokenInfo } from '@monkeyscanjump/euclid/components';

export declare interface EuclidTokenContent extends Components.EuclidTokenContent {

  tokenSelect: EventEmitter<CustomEvent<{ token: [object Object]; selectorType: 'input' | 'output'; }>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidTokenInput,
  inputs: ['disabled', 'error', 'label', 'loading', 'placeholder', 'showBalance', 'showMax', 'token', 'tokenSelectable', 'value']
})
@Component({
  selector: 'euclid-token-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['disabled', 'error', 'label', 'loading', 'placeholder', 'showBalance', 'showMax', 'token', 'tokenSelectable', 'value'],
  outputs: ['valueChange', 'tokenSelect', 'maxClick'],
})
export class EuclidTokenInput {
  protected el: HTMLEuclidTokenInputElement;
  @Output() valueChange = new EventEmitter<CustomEvent<string>>();
  @Output() tokenSelect = new EventEmitter<CustomEvent<void>>();
  @Output() maxClick = new EventEmitter<CustomEvent<void>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidTokenInput extends Components.EuclidTokenInput {
  /**
   * Emitted when the input value changes
   */
  valueChange: EventEmitter<CustomEvent<string>>;
  /**
   * Emitted when the token selector is clicked
   */
  tokenSelect: EventEmitter<CustomEvent<void>>;
  /**
   * Emitted when the max button is clicked
   */
  maxClick: EventEmitter<CustomEvent<void>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidTokensList,
  inputs: ['cardTitle', 'itemsPerPage', 'loading', 'tokens']
})
@Component({
  selector: 'euclid-tokens-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['cardTitle', 'itemsPerPage', 'loading', 'tokens'],
  outputs: ['tokenSelected', 'filtersChanged'],
})
export class EuclidTokensList {
  protected el: HTMLEuclidTokensListElement;
  @Output() tokenSelected = new EventEmitter<CustomEvent<IEuclidTokensListTokenMetadata>>();
  @Output() filtersChanged = new EventEmitter<CustomEvent<IEuclidTokensListTokenFilters>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { TokenMetadata as IEuclidTokensListTokenMetadata } from '@monkeyscanjump/euclid/components';
import type { TokenFilters as IEuclidTokensListTokenFilters } from '@monkeyscanjump/euclid/components';

export declare interface EuclidTokensList extends Components.EuclidTokensList {

  tokenSelected: EventEmitter<CustomEvent<IEuclidTokensListTokenMetadata>>;

  filtersChanged: EventEmitter<CustomEvent<IEuclidTokensListTokenFilters>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidTxTrackerController
})
@Component({
  selector: 'euclid-tx-tracker-controller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidTxTrackerController {
  protected el: HTMLEuclidTxTrackerControllerElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidTxTrackerController extends Components.EuclidTxTrackerController {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidUserDataController
})
@Component({
  selector: 'euclid-user-data-controller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidUserDataController {
  protected el: HTMLEuclidUserDataControllerElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidUserDataController extends Components.EuclidUserDataController {}


@ProxyCmp({
  defineCustomElementFn: defineEuclidWalletContent
})
@Component({
  selector: 'euclid-wallet-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  outputs: ['walletConnect'],
})
export class EuclidWalletContent {
  protected el: HTMLEuclidWalletContentElement;
  @Output() walletConnect = new EventEmitter<CustomEvent<IEuclidWalletContentWalletProvider>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { WalletProvider as IEuclidWalletContentWalletProvider } from '@monkeyscanjump/euclid/components';

export declare interface EuclidWalletContent extends Components.EuclidWalletContent {

  walletConnect: EventEmitter<CustomEvent<IEuclidWalletContentWalletProvider>>;
}


@ProxyCmp({
  defineCustomElementFn: defineEuclidWalletController
})
@Component({
  selector: 'euclid-wallet-controller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class EuclidWalletController {
  protected el: HTMLEuclidWalletControllerElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface EuclidWalletController extends Components.EuclidWalletController {}


@ProxyCmp({
  defineCustomElementFn: definePoolItem,
  inputs: ['pool', 'position', 'tokens', 'walletAddress']
})
@Component({
  selector: 'pool-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [{ name: 'pool', required: true }, 'position', 'tokens', 'walletAddress'],
  outputs: ['addLiquidity', 'removeLiquidity', 'stakeTokens', 'claimRewards'],
})
export class PoolItem {
  protected el: HTMLPoolItemElement;
  @Output() addLiquidity = new EventEmitter<CustomEvent<IPoolItemPoolInfo>>();
  @Output() removeLiquidity = new EventEmitter<CustomEvent<{ pool: IPoolItemPoolInfo; position: [object Object] }>>();
  @Output() stakeTokens = new EventEmitter<CustomEvent<{ pool: IPoolItemPoolInfo; position?: [object Object] }>>();
  @Output() claimRewards = new EventEmitter<CustomEvent<{ pool: IPoolItemPoolInfo; position: [object Object] }>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { PoolInfo as IPoolItemPoolInfo } from '@monkeyscanjump/euclid/components';
import type { UserPoolPosition as IPoolItemUserPoolPosition } from '@monkeyscanjump/euclid/components';

export declare interface PoolItem extends Components.PoolItem {

  addLiquidity: EventEmitter<CustomEvent<IPoolItemPoolInfo>>;

  removeLiquidity: EventEmitter<CustomEvent<{ pool: IPoolItemPoolInfo; position: [object Object] }>>;

  stakeTokens: EventEmitter<CustomEvent<{ pool: IPoolItemPoolInfo; position?: [object Object] }>>;

  claimRewards: EventEmitter<CustomEvent<{ pool: IPoolItemPoolInfo; position: [object Object] }>>;
}


@ProxyCmp({
  defineCustomElementFn: definePoolsFilters,
  inputs: ['filters', 'walletAddress']
})
@Component({
  selector: 'pools-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [{ name: 'filters', required: true }, 'walletAddress'],
  outputs: ['filtersChanged'],
})
export class PoolsFilters {
  protected el: HTMLPoolsFiltersElement;
  @Output() filtersChanged = new EventEmitter<CustomEvent<IPoolsFiltersPoolFilters>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { PoolFilters as IPoolsFiltersPoolFilters } from '@monkeyscanjump/euclid/components';

export declare interface PoolsFilters extends Components.PoolsFilters {

  filtersChanged: EventEmitter<CustomEvent<IPoolsFiltersPoolFilters>>;
}


@ProxyCmp({
  defineCustomElementFn: definePoolsLoading,
  inputs: ['count']
})
@Component({
  selector: 'pools-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['count'],
})
export class PoolsLoading {
  protected el: HTMLPoolsLoadingElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PoolsLoading extends Components.PoolsLoading {}


@ProxyCmp({
  defineCustomElementFn: definePoolsStats,
  inputs: ['filteredPools', 'totalPools', 'totalTvl', 'userPositions', 'walletAddress']
})
@Component({
  selector: 'pools-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['filteredPools', 'totalPools', 'totalTvl', 'userPositions', 'walletAddress'],
})
export class PoolsStats {
  protected el: HTMLPoolsStatsElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PoolsStats extends Components.PoolsStats {}


@ProxyCmp({
  defineCustomElementFn: defineTokenItem,
  inputs: ['token']
})
@Component({
  selector: 'token-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [{ name: 'token', required: true }],
  outputs: ['tokenClick'],
})
export class TokenItem {
  protected el: HTMLTokenItemElement;
  @Output() tokenClick = new EventEmitter<CustomEvent<ITokenItemTokenMetadata>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { TokenMetadata as ITokenItemTokenMetadata } from '@monkeyscanjump/euclid/components';

export declare interface TokenItem extends Components.TokenItem {

  tokenClick: EventEmitter<CustomEvent<ITokenItemTokenMetadata>>;
}


@ProxyCmp({
  defineCustomElementFn: defineTokensFilters,
  inputs: ['chains', 'filters']
})
@Component({
  selector: 'tokens-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['chains', { name: 'filters', required: true }],
  outputs: ['filtersChanged'],
})
export class TokensFilters {
  protected el: HTMLTokensFiltersElement;
  @Output() filtersChanged = new EventEmitter<CustomEvent<ITokensFiltersTokenFilters>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { TokenFilters as ITokensFiltersTokenFilters } from '@monkeyscanjump/euclid/components';

export declare interface TokensFilters extends Components.TokensFilters {

  filtersChanged: EventEmitter<CustomEvent<ITokensFiltersTokenFilters>>;
}


@ProxyCmp({
  defineCustomElementFn: defineTokensLoading,
  inputs: ['count', 'show']
})
@Component({
  selector: 'tokens-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['count', 'show'],
})
export class TokensLoading {
  protected el: HTMLTokensLoadingElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface TokensLoading extends Components.TokensLoading {}


