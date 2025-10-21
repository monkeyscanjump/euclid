
# Euclid Protocol Components

**Framework-agnostic Web Components for the Euclid Protocol**

An open-source component library built with StencilJS that provides reusable, framework-agnostic Web Components for building applications that interact with the [Euclid Protocol](https://euclidprotocol.io/) - a cross-chain automated market maker (AMM) and liquidity protocol.

> **Note**: This is an **independent open-source project**. We are **not affiliated** with the official Euclid Protocol team. These components provide an interface to Euclid's public APIs and smart contracts.

## What This Library Provides

**Reusable Web Components** that handle the complexity of cross-chain DeFi interactions:

- **Multi-chain wallet management** (MetaMask, Keplr, Phantom, etc.)
- **Cross-chain token swapping** interface
- **Liquidity pool management** across multiple chains
- **Portfolio overview** with cross-chain balances
- **Unified state management** for complex multi-chain data

## Why Framework-Agnostic?

The Euclid Protocol connects multiple blockchains. The tools to build on it should work with any framework:

- ✅ **React** - Import and use directly
- ✅ **Vue** - Works with Vue 3 composition API
- ✅ **Angular** - Full Angular integration
- ✅ **Svelte** - Native web component support
- ✅ **Plain HTML** - No framework required

Built with **StencilJS**, these components compile to standards-based Web Components that work everywhere.

## Quick Start

### Installation

```bash
npm install @monkeyscanjump/euclid
```

### Basic Usage

```html
<!-- Import the components -->
<script type="module" src="node_modules/@monkeyscanjump/euclid/dist/euclid/euclid.esm.js"></script>

<!-- Use the components -->
<euclid-core-provider>
  <!-- Cross-chain swap interface -->
  <euclid-swap-card></euclid-swap-card>

  <!-- Liquidity management -->
  <euclid-liquidity-card></euclid-liquidity-card>

  <!-- Portfolio overview -->
  <euclid-portfolio-overview></euclid-portfolio-overview>

  <!-- Global modal for wallet/token selection -->
  <euclid-modal></euclid-modal>
</euclid-core-provider>
```

### Framework Integration

**React:**

```jsx
import '@monkeyscanjump/euclid';

function App() {
  return (
    <euclid-core-provider>
      <euclid-swap-card />
    </euclid-core-provider>
  );
}
```

**Vue:**

```vue
<template>
  <euclid-core-provider>
    <euclid-swap-card />
  </euclid-core-provider>
</template>

<script>
import '@monkeyscanjump/euclid';
</script>
```

## Available Components

### Core Components

- **`euclid-core-provider`** - Required wrapper that initializes stores and controllers
- **`euclid-modal`** - Global modal for wallet and token selection

### Feature Components

- **`euclid-swap-card`** - Cross-chain token swapping interface
- **`euclid-liquidity-card`** - Add/remove liquidity to cross-chain pools
- **`euclid-pools-list`** - Browse available liquidity pools
- **`euclid-tokens-list`** - Browse available tokens across chains
- **`euclid-portfolio-overview`** - User's cross-chain portfolio summary

### Controller Components (Headless)

- **`euclid-wallet-controller`** - Multi-chain wallet management
- **`euclid-market-data-controller`** - Token prices and pool data
- **`euclid-swap-controller`** - Swap routing and execution
- **`euclid-liquidity-controller`** - Liquidity operations
- **`euclid-tx-tracker-controller`** - Transaction tracking
- **`euclid-user-data-controller`** - User balances and positions

## Architecture

### Multi-Chain State Management

Built-in stores handle complex cross-chain data:

- **`walletStore`** - Connected wallets and balances across chains
- **`marketStore`** - Token metadata, prices, and pool information
- **`swapStore`** - Swap routing and transaction state
- **`liquidityStore`** - Liquidity positions and operations
- **`appStore`** - UI state and modal management

### Modal System

Simple, unified modal system for complex interactions:

```typescript
import { appStore } from '@monkeyscanjump/euclid/store';

// Open token selection modal
appStore.openTokenModal();

// Open wallet connection modal
appStore.openWalletModal();
```

## Development

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start dev server:**

   ```bash
   npm start
   ```

3. **Open browser:** [http://localhost:3333](http://localhost:3333)

The dev server includes a testing page with all components for development and testing.

### Building

```bash
npm run build
```

Builds the component library to `dist/` with multiple output formats:
- ES modules
- CommonJS
- React bindings
- Angular bindings
- Vue bindings

## Live Demo

Check out the live demo: [https://monkeyscanjump.github.io/euclid/](https://monkeyscanjump.github.io/euclid/)

## What is the Euclid Protocol?

The **Euclid Protocol** is a cross-chain DeFi protocol that enables:

- **Cross-chain swaps** without bridging (swap ETH for ATOM directly)
- **Unified liquidity pools** across multiple blockchains
- **Smart routing** for optimal swap rates across chains
- **Virtual settlement** for instant cross-chain transactions

Learn more at [euclidprotocol.io](https://euclidprotocol.io/)

## License

**CC0 1.0 Universal** - Public domain dedication. Use freely for any purpose.

## Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

This is an independent project. For issues with these components, please open a GitHub issue.

For questions about the Euclid Protocol itself, visit the official [Euclid Protocol documentation](https://euclidprotocol.io/).
