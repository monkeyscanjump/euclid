
# Euclid: Open Source StencilJS Components for the Euclid Protocol

**An independent, framework-agnostic component library** for building applications that interact with the [Euclid Protocol](https://euclid.xyz) - a cross-chain automated market maker (AMM) and liquidity protocol.

> **Note**: This is an **independent open-source project** built by framework-agnostic developers. We are **not affiliated** with the official Euclid Protocol team. Our goal is to provide high-quality, reusable Web Components that make it easier for developers to build applications using Euclid's public APIs.

## What is the Euclid Protocol?

**Euclid Protocol** is a **cross-chain DeFi protocol** that enables seamless token swaps, liquidity provision, and yield farming across multiple blockchain networks without the traditional complexity and friction of bridging assets.

### The Problem Euclid Solves

**Traditional DeFi is fragmented and painful:**
- Want to swap USDC on Ethereum for ATOM on Cosmos? You need to bridge, wait, pay multiple fees, and use different interfaces
- Liquidity is scattered across dozens of chains, making markets inefficient
- Users need multiple wallets, multiple gas tokens, and deep technical knowledge
- Developers building multi-chain apps face a nightmare of different APIs, wallet integrations, and protocols

### Euclid's Solution: "Virtual Settlement"

Euclid creates a **unified liquidity layer** that connects all major blockchains through:

1. **Cross-Chain Liquidity Pools**: Add USDC from Ethereum and ATOM from Cosmos to the same pool
2. **Instant Cross-Chain Swaps**: Swap ETH for SOL directly, no bridging required
3. **Unified Account Management**: One interface, multiple chains, seamless UX
4. **Smart Routing**: Automatically finds the best rates across all connected chains

**Example User Flow:**
- User wants to swap 1000 USDC (on Ethereum) for ATOM (on Cosmos)
- Instead of bridging USDC to Cosmos first, Euclid instantly settles this as:
  - User's Ethereum wallet sends USDC to Euclid's Ethereum escrow
  - User's Cosmos wallet instantly receives ATOM from Euclid's Cosmos liquidity
  - Settlement happens through Euclid's cross-chain messaging protocol
- **Result**: Instant cross-chain swap with optimal rates and minimal fees

## Why This Component Library Exists

Building front-end applications for cross-chain protocols like Euclid is **exponentially more complex** than building for single-chain protocols. Developers face:

- **Multiple Wallet Integrations**: MetaMask for Ethereum, Keplr for Cosmos, Phantom for Solana, etc.
- **Complex State Management**: Track balances, transactions, and liquidity across 10+ chains simultaneously
- **Cross-Chain UX**: Users shouldn't need to understand bridging, gas tokens, or technical complexity
- **API Integration**: Properly implementing Euclid's GraphQL and REST APIs across all supported chains

### Our Solution: Framework-Agnostic Web Components

This **independent open-source library** provides **plug-and-play components** that properly implement Euclid's public APIs and handle all the cross-chain complexity:```html
<!-- This ONE component handles cross-chain swapping across all supported chains -->
<euclid-swap-card></euclid-swap-card>

<!-- This component manages liquidity across multiple chains in one interface -->
<euclid-liquidity-card></euclid-liquidity-card>

<!-- This shows cross-chain portfolio (ETH, COSMOS, SOLANA balances in one view) -->
<euclid-portfolio-overview></euclid-portfolio-overview>
```

**What happens under the hood:**
- Automatic wallet detection and connection (MetaMask, Keplr, Phantom, etc.)
- Real-time cross-chain balance fetching and caching
- Intelligent routing across chains for optimal swap rates
- Cross-chain transaction tracking and settlement
- Unified UX that abstracts away the multi-chain complexity

**For any framework**: These components work in React, Vue, Angular, Svelte, or plain HTML because they're compiled to Web Components.

## Our Philosophy: Framework-Agnostic Infrastructure

**Euclid Protocol is multi-chain and open. The tools to build on it should be too.**

We are **independent builders** focused on creating reusable, standards-based infrastructure that works everywhere. Modern web development has converged on framework-specific stacks that lock developers into single ecosystems. This is wrong for protocol infrastructure.

### 1\. Our Answer to Framework Lock-in

Building protocol infrastructure with framework-specific tools (React/Next.js) locks entire ecosystems into single frameworks.

  * **Our Solution**: We use **StencilJS** to compile our components to standards-based Web Components. Build once, run everywhere - React, Vue, Angular, Svelte, or plain HTML.

### 2\. Our Answer to External Dependencies

Framework-specific apps require importing stacks of external libraries just to solve problems the framework creates.

  * **Our Solution**: We are self-contained. Our library includes built-in state management with **`@stencil/store`** and headless controller components that properly implement Euclid's APIs without external dependencies.

### 3\. Our Answer to CSS Framework "Slop"

Utility-first CSS frameworks create bloated, unreadable markup and force users to download massive CSS bundles.

  * **Our Solution**: We build a **proper design system** using Stencil's scoped CSS. Each component is encapsulated, performant, and maintainable.

-----

## Core Architecture: Solving Cross-Chain Complexity

### 1\. The "Address Book" Pattern (Multi-Chain Wallet Management)

Traditional DeFi UX assumes users have one wallet on one chain. **This is broken for cross-chain protocols.**

Euclid uses a **multi-chain "Address Book"** approach:
- Users can connect multiple wallets simultaneously (MetaMask for Ethereum, Keplr for Cosmos, Phantom for Solana)
- Our `wallet.store` maintains a `Map<ChainUID, WalletInfo>` - one entry per chain
- Components intelligently prompt for the **specific wallet they need** instead of forcing a "universal login"

**Example**: User wants to swap USDC (Ethereum) → ATOM (Cosmos):
1. Component checks if Ethereum wallet is connected
2. If not: "Connect Ethereum Wallet" (opens MetaMask)
3. Component checks if Cosmos wallet is connected
4. If not: "Connect Cosmos Wallet" (opens Keplr)
5. Once both connected: "Swap USDC → ATOM"

**Result**: Contextual, just-in-time wallet connections instead of upfront complexity.

### 2\. Intelligent Cross-Chain Components

Our components are **contextually aware** of cross-chain requirements:

**`<euclid-swap-card>`**:
- Detects which chains are needed based on selected tokens
- Automatically connects required wallets
- Routes through Euclid's cross-chain pools for optimal rates
- Handles cross-chain settlement and transaction tracking

**`<euclid-liquidity-card>`**:
- Allows adding liquidity with tokens from different chains
- Manages cross-chain liquidity positions
- Tracks yields and rewards across multiple chains

**`<euclid-portfolio-overview>`**:
- Shows unified balance across all connected chains
- Displays cross-chain liquidity positions
- Tracks cross-chain transaction history

### 3\. Unified State Management for Multi-Chain Data

Cross-chain apps need to manage exponentially more state than single-chain apps:

**`wallet.store`**: Multi-chain address book and balances
**`market.store`**: Token prices, pool data, and chain configs across all networks
**`swap.store`**: Cross-chain routing, settlement tracking
**`liquidity.store`**: Multi-chain liquidity positions and yields

All components connect to these stores automatically - no manual state management required.

### 4\. Simplified Modal System

Complex cross-chain interactions require lots of user input (token selection, wallet connections, chain switching). Instead of component-specific modals, we use:

- **One global modal** (`<euclid-modal>`) controlled by app state
- **Simple API**: `appStore.openTokenModal()` or `appStore.openWalletModal()`
- **Smart content**: Modal renders appropriate content based on context (which chains, which tokens, etc.)
- **No prop drilling**: Store-driven, not component-driven

-----

## How to Use This Library

### Quick Start: Cross-Chain Swap Interface

Building a cross-chain DEX interface is now as simple as:

```javascript
// 1. Wrap your app with the provider
import '@monkeyscanjump/euclid';

function App() {
  return (
    <euclid-core-provider>
      <euclid-swap-card></euclid-swap-card>
    </euclid-core-provider>
  );
}
```

**That's it.** This gives you:
- ✅ Multi-chain wallet connections (MetaMask, Keplr, Phantom, etc.)
- ✅ Token selection across all supported chains
- ✅ Cross-chain routing and optimal pricing
- ✅ Transaction settlement and tracking
- ✅ Responsive, accessible UI with proper error handling

### Real-World Example: Cross-Chain DeFi Dashboard

```javascript
import '@monkeyscanjump/euclid';

function DeFiDashboard() {
  return (
    <euclid-core-provider>
      {/* User's cross-chain portfolio overview */}
      <euclid-portfolio-overview />

      {/* Cross-chain swapping interface */}
      <euclid-swap-card />

      {/* Multi-chain liquidity management */}
      <euclid-liquidity-card />

      {/* Browse all cross-chain pools */}
      <euclid-pools-list />
    </euclid-core-provider>
  );
}
```

**What you get automatically:**
- **Multi-chain balances**: ETH, USDC, ATOM, SOL, etc. all in one view
- **Cross-chain swaps**: Direct ETH → ATOM swaps without manual bridging
- **Unified liquidity**: Add ETH + ATOM to the same pool, earn yield on both
- **Smart wallet management**: Connect only the wallets you need, when you need them

### 1\. Installation

```bash
npm install @monkeyscanjump/euclid
```

### 2\. Basic Setup

**Required**: Wrap your application in `<euclid-core-provider>`:

```javascript
// In your main layout file (layout.tsx, _app.tsx, index.html)
import '@monkeyscanjump/euclid';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <euclid-core-provider>
          {children}
        </euclid-core-provider>
      </body>
    </html>
  );
}
```

### 3\. Advanced: Programmatic Control

```javascript
import { appStore, walletStore, swapStore } from '@monkeyscanjump/euclid/store';

// Open modals programmatically
appStore.openTokenModal();
appStore.openWalletModal();

// Access cross-chain wallet data
const ethereumWallet = walletStore.getWallet('ethereum');
const cosmosWallet = walletStore.getWallet('cosmos');

// Check cross-chain balances
const allBalances = walletStore.getAllBalances();

// Get optimal cross-chain routes
const routes = swapStore.getRoutes('USDC', 'ATOM');
```

-----

### Key Architecture Decisions

**Simple Modal System:** Instead of complex, prop-heavy modals, we use a single `<euclid-modal>` that renders different content based on app store state.

**Store-Driven UI:** Components don't manage their own modal state. They simply call `appStore.openTokenModal()` or `appStore.openWalletModal()`.

**Clean Separation:** Modal logic is separate from content. Content components (`euclid-token-content`, `euclid-wallet-content`) are simple, reusable, and focused.

-----

## Development & Sandbox

This project includes an `index.html` file that serves as a development sandbox for testing all components in isolation.

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the dev server:**

    ```bash
    npm start
    ```

3.  Open [http://localhost:3333](https://www.google.com/search?q=http://localhost:3333) in your browser. The `index.html` file will load with the `<euclid-core-provider>` wrapping demo components.

## Current Implementation Status

✅ **Core Architecture Complete:**
- Store-driven modal system with `<euclid-modal>`
- "Address Book" wallet management (`wallet.store`)
- Component architecture with core/features/ui separation
- Clean CSS design system with `--euclid-` variables

✅ **Available Components:**
- Core: `euclid-core-provider` + all controllers
- Features: `euclid-swap-card`, `euclid-liquidity-card`, `euclid-pools-list`
- UI: `euclid-modal`, `euclid-token-content`, `euclid-wallet-content`, `euclid-button`

🚧 **In Development:**
- Wallet adapter integrations (MetaMask, Keplr, etc.)
- API client for Euclid Protocol endpoints
- Additional feature components (portfolio, analytics)

## Documentation & API Reference

This repository includes **comprehensive documentation** from the Euclid Protocol to ensure our components properly implement all available APIs and features.

**Important**: We are an **independent project**. The `/docs` folder contains reference documentation to help us build accurate implementations of Euclid's public APIs. This is **not official documentation** - for the latest official docs, visit [euclid.xyz](https://euclid.xyz).

**What's included:**
- **GraphQL API Reference**: Complete schema for querying chain data, pools, tokens, and user balances
- **REST API Reference**: Transaction endpoints for swaps, liquidity operations, and more
- **Smart Contract Integration**: How to interact with Euclid's CosmWasm and Solidity contracts
- **Architecture Overview**: Understanding Euclid's cross-chain settlement and routing

**Our implementation status:**
- ✅ **Core Architecture**: Multi-chain wallet management, store-driven UI
- ✅ **Component Foundation**: Reusable modal system, token/wallet selection
- 🚧 **API Integration**: Currently implementing GraphQL/REST clients
- 🚧 **Wallet Adapters**: MetaMask, Keplr, Phantom integration
- 🚧 **Transaction Handling**: Cross-chain swap and liquidity operations

## License

This project is licensed under the **CC0 1.0 Universal** public domain dedication - completely open source for the community.
