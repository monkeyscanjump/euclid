
# Euclid: A StencilJS Component Library for the Euclid Protocol

[](https://www.google.com/search?q=LICENSE)

This repository ([https://github.com/monkeyscanjump/euclid](https://www.google.com/search?q=httpss://github.com/monkeyscanjump/euclid)) contains a framework-agnostic, modular component library for interacting with the Euclid Protocol, built with StencilJS.

This project is not a web application. It is a set of compiled, standards-based **Web Components** designed to run in *any* frontend framework (React, Angular, Vue, Svelte, or plain HTML).

## Our Philosophy: Infrastructure, Not a Monolithic App

The Euclid Protocol is a multi-chain, open standard. The tools to interact with it should be, too.

Modern web development has converged on a stack (React/Next.js, Zustand/TanStack Query, Tailwind CSS) that prioritizes developer convenience for building a *single application* over the long-term, open, and performant infrastructure a *protocol* deserves.

This is a stack of compromises, "noise," and "slop." We reject it.

We are building clean, fast, and reusable infrastructure based on web standards.

-----

### 1\. Our Answer to Framework Lock-in (React, Next.js)

Choosing a framework like Next.js to build *protocol infrastructure* is a critical error. It locks the entire ecosystem into a single framework.

  * **Our Solution:** We use **StencilJS**. It compiles our components to standards-based Web Components. We build *one* component (e.g., `<euclid-swap-card>`) and it runs natively in **all** frameworks. This is the only way to build open infrastructure.

### 2\. Our Answer to Framework "Noise" (Zustand, TanStack Query)

Framework-locked apps force the import of a stack of "noise" libraries (like Zustand or TanStack Query) just to solve problems that the framework itself creates.

  * **Our Solution:** We are self-contained. Our library includes its own headless **"Controller" components** and a minimal **`@stencil/store`**.
      * **Caching:** Our `<euclid-market-data-controller>` handles it.
      * **Polling:** Our `<euclid-swap-controller>` handles its *own* "smart poll" for routes.
      * **State:** Our `wallet.store` is the "Address Book." It's built-in, not an external dependency.

We don't import noise. We write clean logic.

### 3\. Our Answer to Utility-First "Slop" (Tailwind CSS)

Utility-first CSS frameworks are an **abomination** for large-scale, performant applications. They are an excuse for not building a proper design system.

They prioritize developer convenience while forcing the user to suffer. The result is HTML "slop"—bloated, unreadable markup polluted with thousands of class strings, increasing download size and render times.

  * **Our Solution:** We are building a **real, performant design system**. We use Stencil's **scoped CSS** (`shadow: true`) for every component.
      * **Clean DOM:** Our components are minimal (e.g., `<euclid-swap-card>`). The HTML is semantic and free of class-string pollution.
      * **High Performance:** The user downloads a single, small, optimized CSS bundle. Component styles are encapsulated.
      * **Maintainable:** We write clean, consistent, component-scoped CSS. This is how you build fast, reactive applications, not slop.

-----

## Core Architecture & Multi-Chain Logic

### 1\. The "Address Book" (Not a "Login")

We have no concept of a single "logged-in" wallet. A single-chain login is a broken UX pattern for a multi-chain protocol.

Instead, we use a central global store (`wallet.store`) that functions as an **"Address Book"**. This store holds a `Map<ChainUID, WalletInfo>` for *every* wallet the user has connected. This is the single source of truth for all signers.

### 2\. The Provider Pattern (`<euclid-core-provider>`)

To make this library modular, a developer **must** wrap their application in the `<euclid-core-provider>`. This single component is the "brain" that renders all headless controllers and initializes the global state.

### 3\. Contextual Actions (No More Forced Logins)

Our UI components are "dumb." The action buttons (like "Swap") are intelligent and contextual.

1.  A user selects a "From" token (e.g., USDC on Ethereum).
2.  The `<euclid-swap-card>` component checks the `wallet.store` (Address Book) for an Ethereum wallet.
3.  **If no signer is found:** The button displays "Connect Ethereum Wallet."
4.  **If a signer is found:** The button displays "Swap."

The user is only prompted to connect the *specific* wallet they *need*, exactly when they need it.

### 4\. The Intelligent Wallet Modal (`<euclid-wallet-modal>`)

We have **one single, intelligent modal** for managing wallets. Its behavior is controlled by the `app.store.walletModalFilter` state, which is set by *what* component calls it.

1.  **Manager Mode:** When opened by a *general* component (like the optional `<euclid-wallet-manager-button>` in a header), the filter is set to `null`. The modal reacts by showing the full Address Book.
2.  **Filtered Mode:** When opened by an *action* (like the `<euclid-swap-card>`), the filter is set to the required chain (e.g., `'ethereum'`). The modal reacts by showing only options for that specific chain.

-----

## How to Use (For Developers)

This library is designed to be plug-and-play.

### 1\. Installation

```bash
# This package will be published to NPM, e.g.:
npm install @monkeyscanjump/euclid
```

### 2\. Step 1: Wrap Your App (Example in Next.js `layout.tsx`)

You **must** wrap your application in the `<euclid-core-provider>`.

```javascript
// In your main layout file (e.g., layout.tsx, _app.tsx, index.html)
// Import the library (this registers all components)
import '@monkeyscanjump/euclid';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <euclid-core-provider>
          {/* All your application's routes and components go here */}
          {children}
        </euclid-core-provider>
      </body>
    </html>
  );
}
```

### 3\. Step 2: Use Feature Components (Example in a `/swap` page)

Use any feature component. It will automatically connect to the provider and work.

```javascript
// In your swap page (e.g., /pages/swap.tsx)
// No other imports are needed.

export default function SwapPage() {
  return (
    <div>
      <h1>My Custom Swap Page</h1>
      <euclid-swap-card></euclid-swap-card>
    </div>
  );
}
```

-----

## Project Structure

This repository contains both the StencilJS component library (`/src`) and the official Euclid Protocol documentation (`/docs`).

```
/euclid
|
|-- /docs                   // <-- Official Euclid Protocol documentation
|
|-- /src
|   |
|   |-- /store                // Global State ("Model")
|   |   |-- wallet.store.ts     // CORE: The "Address Book" (Wallets, Balances)
|   |   |-- market.store.ts     // CORE: Cached Public Data (Chains, Tokens, Pools)
|   |   |-- app.store.ts        // CORE: UI State (Modals, walletModalFilter)
|   |   |-- swap.store.ts       // FEATURE: State for swap logic
|   |   |-- liquidity.store.ts  // FEATURE: State for liquidity logic
|   |   |-- index.ts
|   |
|   |-- /components
|   |   |
|   |   |-- /core               // **CORE SERVICES (Mandatory)**
|   |   |   |-- /euclid-core-provider/
|   |   |   |   |-- euclid-core-provider.tsx // **REQUIRED: The top-level provider**
|   |   |   |-- /euclid-wallet-controller/
|   |   |   |   |-- euclid-wallet-controller.tsx  // (Internal) Manages wallet.store
|   |   |   |-- /euclid-market-data-controller/
|   |   |   |   |-- euclid-market-data-controller.tsx // (Internal) Manages market.store
|   |   |   |-- /euclid-user-data-controller/
|   |   |       |-- euclid-user-data-controller.tsx // (Internal) Manages user balances
|   |   |
|   |   |-- /features           // **FEATURE COMPONENTS (A-la-carte)**
|   |   |   |-- /swap/
|   |   |   |   |-- euclid-swap-card.tsx      // VIEW: The full-featured swap UI
|   |   |   |   |-- euclid-swap-controller.tsx  // LOGIC: (Internal) Polls routes
|   |   |   |-- /liquidity/
|   |   |   |   |-- euclid-liquidity-card.tsx // VIEW: The add/remove liquidity UI
|   |   |   |   |-- euclid-liquidity-controller.tsx // LOGIC: (Internal) Executes txs
|   |   |   |-- /pools/
|   |   |   |   |-- euclid-pools-list.tsx     // VIEW: UI to show all pools
|   |   |   |   |-- euclid-my-pools-list.tsx  // VIEW: UI to show user's pools
|   |   |
|   |   |-- /ui                 // **SHARED UI (Dumb, reusable pieces)**
|   |   |   |-- /euclid-wallet-manager-button/
|   |   |   |   |-- euclid-wallet-manager-button.tsx // Optional header button (sets filter to null)
|   |   |   |-- /euclid-wallet-modal/
|   |   |   |   |-- euclid-wallet-modal.tsx    // The intelligent "Address Book" modal
|   |   |   |-- /euclid-token-modal/
|   |   |   |   |-- euclid-token-modal.tsx    // Reusable modal for selecting tokens
|   |   |   |-- /euclid-token-input/
|   |   |   |   |-- euclid-token-input.tsx    // Reusable token input box
|   |   |   |-- /euclid-button/
|   |   |       |-- euclid-button.tsx
|   |
|   |-- /utils
|   |   |-- /types/
|   |   |   |-- api.types.ts
|   |   |   |-- state.types.ts
|   |   |-- api-client.ts       // Base 'fetch' wrapper
|   |   |-- wallet-adapter.ts   // Logic to connect (Keplr, MetaMask, etc.)
|   |   |-- constants.ts
|   |
|   |-- /global/
|   |   |-- app.css             // **Global design system tokens (CSS variables)**
|   |
|   |-- index.html              // **Development Sandbox**
|
|-- stencil.config.ts         // Build configuration
|-- package.json
|-- tsconfig.json
|-- LICENSE                   // CC0 1.0 Universal License
```

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

3.  Open [http://localhost:3333](https://www.google.com/search?q=http://localhost:3333) in your browser. The `index.html` file will load, which should contain an instance of `<euclid-core-provider>` wrapping all feature components for testing.

## Documentation

This repository includes the official Euclid Protocol documentation. All API calls (GQL and REST) are based on these files.

You can find the full documentation in the `/docs` folder.

## License

This project is licensed under the **CC0 1.0 Universal** public domain dedication. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for the full text.