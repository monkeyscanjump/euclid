# 🌌 Euclid Protocol - Component Architecture

## Overview

The Euclid Protocol components use a **Provider-Based Architecture** for reliable state management and configuration. All components must be used within provider contexts to function properly.

## 🎯 Two Provider Types

### 1. **Core Provider** (Full Application)
**Best for**: Complete DeFi applications with wallet connectivity

```html
<euclid-core-provider environment="mainnet">
  <div class="my-defi-app">
    <euclid-portfolio-overview></euclid-portfolio-overview>
    <euclid-swap-card></euclid-swap-card>
    <euclid-liquidity-card></euclid-liquidity-card>
  </div>
</euclid-core-provider>
```

**Includes:**
- ✅ All data controllers (market, wallet, swap, liquidity, etc.)
- ✅ Wallet connectivity and management
- ✅ Modal system integration
- ✅ **Unified global state** across all child components
- ✅ Automatic cleanup and memory management

---

### 2. **Config Provider** (Data-Only)
**Best for**: Embedded widgets and custom integrations

```html
<euclid-config-provider environment="testnet">
  <div class="embedded-widget">
    <euclid-swap-card></euclid-swap-card>
    <euclid-liquidity-card></euclid-liquidity-card>
  </div>
</euclid-config-provider>
```

**Includes:**
- ⚡ Configuration management
- 📊 Data controllers access
- 🔄 **Shared state stores** between all child components
- 🎯 No UI controllers (wallet, modals)
- 📦 Lighter weight for embedded usage

**⚠️ Critical: Global State Sharing**
All components within the same provider share global state:
- Data fetched by one component is available to all others
- State changes propagate across all child components
- Single API client instance per provider tree

---

## 📊 Configuration

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

### Provider Props
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

## 🌐 Framework Examples

### React
```jsx
function MyApp() {
  return (
    <div>
      {/* Full app with wallet */}
      <EuclidCoreProvider environment="mainnet">
        <EuclidSwapCard />
        <EuclidLiquidityCard />
      </EuclidCoreProvider>

      {/* Embedded widget */}
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
    <euclid-core-provider environment="mainnet">
      <euclid-swap-card></euclid-swap-card>
      <euclid-liquidity-card></euclid-liquidity-card>
    </euclid-core-provider>
  </div>
</template>
```

### Vanilla HTML
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@monkeyscanjump/euclid/dist/euclid.esm.js"></script>
</head>
<body>
  <euclid-config-provider environment="mainnet">
    <euclid-swap-card></euclid-swap-card>
  </euclid-config-provider>
</body>
</html>
```

---

## 🎯 Usage Patterns

### DeFi Dashboard
```html
<euclid-core-provider environment="mainnet">
  <div class="dashboard">
    <euclid-portfolio-overview></euclid-portfolio-overview>
    <euclid-swap-card></euclid-swap-card>
    <euclid-liquidity-card></euclid-liquidity-card>
  </div>
</euclid-core-provider>
```

### E-commerce Widget
```html
<euclid-config-provider environment="mainnet">
  <euclid-swap-card></euclid-swap-card>
</euclid-config-provider>
```

### Custom API Integration
```html
<euclid-config-provider
  environment="mainnet"
  graphql-endpoint="https://my-api.com/graphql">
  <euclid-liquidity-card></euclid-liquidity-card>
</euclid-config-provider>
```

---

## 🔧 Architecture Benefits

### Performance
- **Efficient Data Sharing**: Components share data/state within provider
- **Reduced API Calls**: Single data fetching per provider context
- **Memory Efficiency**: Proper cleanup prevents memory leaks
- **Predictable Loading**: Controllers loaded once per provider tree

### Developer Experience
- **Simple Patterns**: Only two provider types to understand
- **Unified State**: Shared state across components in provider tree
- **Clear Configuration**: All configuration at provider level
- **Better Debugging**: Predictable behavior and clear error messages

### Security & Reliability
- **State Isolation**: Provider trees don't interfere with each other
- **No Memory Leaks**: Automatic cleanup when providers unmount
- **Type Safety**: Configuration validation at provider level

---

## � Important Guidelines

### ✅ Correct Usage
```html
<!-- Single provider for related components -->
<euclid-config-provider environment="mainnet">
  <euclid-data-list dataType="tokens" />
  <euclid-swap-card />
  <euclid-liquidity-card />
</euclid-config-provider>
```

### ❌ Avoid This
```html
<!-- Multiple providers break state sharing -->
<euclid-config-provider environment="mainnet">
  <euclid-data-list dataType="tokens" />
</euclid-config-provider>
<euclid-config-provider environment="mainnet">
  <euclid-swap-card />
</euclid-config-provider>
```

### Key Principle
**One provider per logical application area** - Components that should share data and state must be within the same provider tree.

---

## 🎉 Architecture Benefits

✅ **Unified State Management** - Shared data across all components
✅ **Framework Agnostic** - Works with React, Vue, Angular, vanilla HTML
✅ **Type Safe** - Full TypeScript support with validation
✅ **Memory Efficient** - Automatic cleanup and resource management
✅ **Developer Friendly** - Clear patterns and predictable behavior
✅ **Production Ready** - Robust architecture for complex applications

This architecture ensures reliable, scalable, and maintainable DeFi applications with shared state and efficient resource management.
