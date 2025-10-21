# 🌌 Euclid Protocol - Provider-Only Architecture

## Overview

The Euclid Protocol components follow a **Provider-Only Architecture** designed for maximum reliability and security. Components work exclusively within provider contexts, eliminating complexity and configuration conflicts that arose from the previous multi-pattern approach.

## 🎯 Two Usage Patterns

### 1. **Core Provider** (Full Application Context)
**Best for**: Full DeFi applications, dashboards, comprehensive trading interfaces

```html
<euclid-core-provider environment="mainnet">
  <div class="my-defi-app">
    <euclid-portfolio-overview></euclid-portfolio-overview>
    <euclid-swap-card></euclid-swap-card>
    <euclid-liquidity-card></euclid-liquidity-card>
  </div>
</euclid-core-provider>
```

**What it provides:**
- ✅ All data controllers automatically loaded
- ✅ Wallet connectivity and management
- ✅ Modal system integration
- ✅ **Unified global state** across all child components
- ✅ Automatic cleanup and memory management
- ✅ Full user experience features

**Controllers included:**
- euclid-wallet-controller
- euclid-market-data-controller
- euclid-user-data-controller
- euclid-swap-controller
- euclid-liquidity-controller
- euclid-tx-tracker-controller

---

### 2. **Config Provider** (Data-Only Context)
**Best for**: Embedded widgets, custom integrations, headless usage

```html
<euclid-config-provider environment="testnet">
  <div class="embedded-widget">
    <euclid-swap-card></euclid-swap-card>
    <euclid-liquidity-card></euclid-liquidity-card>
  </div>
</euclid-config-provider>
```

**What it provides:**
- ⚡ Configuration management
- 📊 Data controllers access
- 🔄 **Shared state stores** between all child components
- 🎯 No UI controllers (wallet, modals)
- 📦 Lighter weight for embedded usage

**Use when:**
- Embedding in existing applications
- Custom wallet integration needed
- Headless/API-only usage
- Building custom UI around data

**⚠️ Critical: Global State Sharing**
All components within the same provider share global state. This means:
- Data fetched by one component is immediately available to all others
- State changes propagate across all child components
- Only one API client instance per provider tree

---

## 🚫 Removed: Standalone Components

**The standalone component pattern has been removed** due to critical issues:

- ❌ Configuration conflicts between components
- ❌ Memory leaks from unmanaged controllers
- ❌ Global state pollution
- ❌ No automatic cleanup mechanism
- ❌ Controller placement ambiguity
- ❌ Complex debugging scenarios

### Migration Required

**Old (No longer supported):**
```html
<!-- This will NOT work -->
<euclid-swap-card environment="testnet" />
<euclid-liquidity-card graphql-endpoint="..." />
```

**New (Required):**
```html
<!-- Use appropriate provider -->
<euclid-config-provider environment="testnet">
  <euclid-swap-card />
  <euclid-liquidity-card />
</euclid-config-provider>
```

---

## 📊 Configuration System

### Environment Presets
```typescript
const ENVIRONMENT_PRESETS = {
  mainnet: {
    graphqlEndpoint: 'https://api.euclid.xyz/graphql',
    restEndpoint: 'https://api.euclid.xyz'
  },
  testnet: {
    graphqlEndpoint: 'https://api.testnet.euclid.xyz/graphql',
    restEndpoint: 'https://api.testnet.euclid.xyz'
  },
  devnet: {
    graphqlEndpoint: 'https://api.devnet.euclid.xyz/graphql',
    restEndpoint: 'https://api.devnet.euclid.xyz'
  }
};
```

### Provider Configuration Props
Configure at the provider level only:

```typescript
interface EuclidProviderProps {
  environment?: 'mainnet' | 'testnet' | 'devnet';
  graphqlEndpoint?: string;        // Override environment preset
  restEndpoint?: string;           // Override environment preset
  apiTimeout?: number;             // Request timeout in ms
  defaultSlippage?: number;        // Default slippage tolerance
  defaultChain?: string;           // Default blockchain
  defaultWallet?: string;          // Default wallet adapter
}
```

---

## 🌐 Framework Integration Examples

### React
```jsx
function MyApp() {
  return (
    <div>
      {/* Full app with wallet connectivity */}
      <EuclidCoreProvider environment="mainnet">
        <EuclidSwapCard />
        <EuclidLiquidityCard />
        <EuclidPortfolioOverview />
      </EuclidCoreProvider>

      {/* Embedded widget without wallet UI */}
      <EuclidConfigProvider environment="testnet">
        <EuclidSwapCard />
      </EuclidConfigProvider>
    </div>
  );
}
```

### Vue
```vue
<template>
  <div>
    <!-- Full app -->
    <euclid-core-provider environment="mainnet">
      <euclid-swap-card></euclid-swap-card>
      <euclid-liquidity-card></euclid-liquidity-card>
    </euclid-core-provider>

    <!-- Embedded widget -->
    <euclid-config-provider environment="testnet">
      <euclid-swap-card></euclid-swap-card>
    </euclid-config-provider>
  </div>
</template>
```

### Angular
```html
<!-- app.component.html -->
<div>
  <!-- Full app -->
  <euclid-core-provider environment="mainnet">
    <euclid-swap-card></euclid-swap-card>
    <euclid-liquidity-card></euclid-liquidity-card>
  </euclid-core-provider>

  <!-- Embedded widget -->
  <euclid-config-provider environment="testnet">
    <euclid-swap-card></euclid-swap-card>
  </euclid-config-provider>
</div>
```

### Vanilla HTML
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@monkeyscanjump/euclid/dist/euclid.esm.js"></script>
</head>
<body>
  <!-- Always use a provider -->
  <euclid-config-provider environment="mainnet">
    <euclid-swap-card></euclid-swap-card>
  </euclid-config-provider>
</body>
</html>
```

---

## 🎯 Use Case Examples

### E-commerce Integration
```html
<!-- Embedded swap for e-commerce -->
<euclid-config-provider environment="mainnet">
  <euclid-swap-card></euclid-swap-card>
</euclid-config-provider>
```

### DeFi Dashboard
```html
<!-- Complete trading interface -->
<euclid-core-provider environment="mainnet">
  <div class="dashboard">
    <euclid-portfolio-overview></euclid-portfolio-overview>
    <euclid-swap-card></euclid-swap-card>
    <euclid-liquidity-card></euclid-liquidity-card>
  </div>
</euclid-core-provider>
```

### Multi-Chain Interface
```html
<!-- ❌ WRONG: Multiple providers break state sharing -->
<div class="multi-chain-interface">
  <euclid-config-provider environment="mainnet" default-chain="ethereum">
    <euclid-swap-card></euclid-swap-card>
  </euclid-config-provider>
  
  <euclid-config-provider environment="mainnet" default-chain="polygon">
    <euclid-swap-card></euclid-swap-card>
  </euclid-config-provider>
</div>

<!-- ✅ CORRECT: Single provider for shared state -->
<euclid-config-provider environment="mainnet">
  <div class="multi-chain-interface">
    <euclid-swap-card data-chain="ethereum"></euclid-swap-card>
    <euclid-swap-card data-chain="polygon"></euclid-swap-card>
  </div>
</euclid-config-provider>
```

### Widget with Custom Endpoint
```html
<!-- Custom API integration -->
<euclid-config-provider
  environment="mainnet"
  graphql-endpoint="https://my-custom-api.com/graphql">
  <euclid-liquidity-card></euclid-liquidity-card>
</euclid-config-provider>
```

---

## 🔧 Architecture Benefits

### Security Improvements
- **No Global State Pollution**: All state contained within providers
- **Configuration Validation**: Type-safe configuration at provider level
- **Memory Management**: Automatic cleanup when providers unmount
- **Controller Isolation**: No shared controller instances between provider trees

### Performance Benefits
- **Predictable Loading**: Controllers loaded once per provider tree
- **Memory Efficiency**: Proper cleanup prevents memory leaks
- **State Isolation**: Provider trees don't interfere with each other
- **Efficient Data Sharing**: Components within same provider share data/state
- **Reduced API Calls**: Single data fetching per provider context

### Developer Experience
- **Clear Patterns**: Only two patterns to understand
- **Explicit Configuration**: All configuration at provider level
- **Predictable Behavior**: Components always work the same way within providers
- **Better Error Messages**: Clear errors when components used outside providers
- **Unified State Management**: Shared state across all components in provider tree

### State Management Guidelines
- **✅ DO**: Use one provider per logical application area
- **✅ DO**: Share state between related components within same provider
- **❌ DON'T**: Create multiple providers for components that should share state
- **❌ DON'T**: Nest providers unnecessarily (can cause configuration conflicts)

---

## 📋 Migration Guide

### From Previous Multi-Pattern Architecture

**Step 1: Remove standalone usage**
```html
<!-- OLD: Don't do this anymore -->
<euclid-swap-card environment="testnet" />
<euclid-liquidity-card graphql-endpoint="..." />
```

**Step 2: Wrap in appropriate provider**
```html
<!-- NEW: Always use provider -->
<euclid-config-provider environment="testnet">
  <euclid-swap-card />
  <euclid-liquidity-card />
</euclid-config-provider>
```

**Step 3: Move configuration to provider level**
```html
<!-- OLD: Configuration on each component -->
<euclid-config-provider>
  <euclid-swap-card environment="testnet" default-slippage="0.5" />
  <euclid-liquidity-card environment="testnet" default-slippage="0.5" />
</euclid-config-provider>
```

```html
<!-- NEW: Configuration on provider -->
<euclid-config-provider
  environment="testnet"
  default-slippage="0.5">
  <euclid-swap-card />
  <euclid-liquidity-card />
</euclid-config-provider>
```

### From Manual Controller Management
```html
<!-- OLD: Manual controller placement -->
<euclid-market-data-controller></euclid-market-data-controller>
<euclid-wallet-controller></euclid-wallet-controller>
<euclid-swap-controller></euclid-swap-controller>
<euclid-liquidity-controller></euclid-liquidity-controller>
<euclid-liquidity-card></euclid-liquidity-card>
```

```html
<!-- NEW: Automatic controller management -->
<euclid-core-provider environment="testnet">
  <euclid-liquidity-card></euclid-liquidity-card>
</euclid-core-provider>
```

---

## 🎉 Benefits Summary

✅ **Reliability**: No configuration conflicts or memory leaks
✅ **Security**: No global state pollution, proper isolation between provider trees
✅ **Simplicity**: Only two clear patterns to understand
✅ **Performance**: Proper memory management and efficient data sharing
✅ **Framework Agnostic**: Works identically across all frameworks
✅ **Maintainability**: Simpler debugging and troubleshooting
✅ **Developer Experience**: Clear, predictable behavior with unified state
✅ **Future-Proof**: Scalable architecture for complex applications
✅ **State Efficiency**: Shared data and state within provider contexts

## 🚨 Common Pitfalls to Avoid

### ❌ Multiple Providers for Related Components
```html
<!-- DON'T: This breaks state sharing -->
<euclid-config-provider environment="mainnet">
  <euclid-data-list dataType="tokens" />
</euclid-config-provider>
<euclid-config-provider environment="mainnet">
  <euclid-swap-card />
</euclid-config-provider>
```

### ✅ Single Provider for Unified State
```html
<!-- DO: This enables state sharing -->
<euclid-config-provider environment="mainnet">
  <euclid-data-list dataType="tokens" />
  <euclid-swap-card />
</euclid-config-provider>
```

### Key Principle
**One provider per logical application area** - Components that should share data and state must be within the same provider tree.

This simplified architecture prioritizes **reliability, security, and unified state management** over apparent simplicity, ensuring that applications built with Euclid components are robust and maintainable in production environments.
