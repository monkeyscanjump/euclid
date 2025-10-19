---
sidebar_position: 4
description: "Learn About Euclid's Virtual Balances"
---

# Virtual Balances

## Introduction 
:::note
Although we use the term mint, the virtual tokens are not real tokens and cannot be transferred outside the Virtual Balances contract.
:::

Euclid's Virtual Balances are virtual tokens that are minted to mimick 1/1 the balances of users and VLPs. They are a unique concept created by Euclid and play a cruical part in our model for the following reasons:

- **Global State Sync:** The total balances for the users and the VLPs for these virtual balances need to be exactly equal to the number of tokens stored by the [VSL](../Virtual%20Settlement%20Layer/virtual-settlement-layer.md) contract which equals the number of tokens found in the escrows on the integrated chains. This ensures that the entire system is in sync and swaps are being performed correctly.

- **Flexible Swaps:** Euclid allow users to swap to virtual tokens. They can also swap using virtual tokens which is faster and cheaper than regular swaps. The user can then redeem the virtual tokens for real ones on any chain whenever they see fit.

- **Security Failsafe:** In case any of the integrated chains suddenly crashes, or for some reason a swap is successful in the VSL but the reply fails to reach the escrow to release the tokens, the user's balance will be saved in the Virtual Balance contract, and the user can decide to extract the tokens on another chain. 

## Workflow

:::tip
We will dive deeper into each of the contract's messages in the [Euclid Smart Contracts](../../../Euclid%20Smart%20Contracts/CosmWasm/Virtual%20balances.md) section.
:::

Whenever a user requests a swap for some token, the Virtual Balance contract will transfer the tokens from the VLP balance to the user's balance:

![Euclid Virtual balances](../../../../static/img/virtual-balance-1.jpg)

Then, when the swap is complete and the escrow has released the tokens to the user, the Virtual Balance contract will receive a request to burn the tokens from the user's balance:

![Euclid Virtual balances](../../../../static/img/virtual-balance-2.jpg)