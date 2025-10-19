---
sidebar_position: 6
description: "The Router Smart Contract"
---
import Tabs from '@site/src/components/Tabs';

## Query Messages 
:::note
We will only go through the queries for this contract, as users are not allowed to execute any messages on the Router contract directly.
You can read about the Router architecture [here](../../Architecture%20Overview/Architecture/router.md).
:::

List of queries that can be performed on the Router contract.

### GetState
Quries the state of the contract.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
    #[returns(StateResponse)]
    GetState {},
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `

{"get_state":{}}
`
}
]} />

The query returns the following response:

```rust
pub struct StateResponse {
    pub admin: String,
    pub vlp_code_id: u64,
    pub virtual_balance_address: Option<Addr>,
    pub locked: bool,
}
```
| **Name**         | **Type**          | **Description**                                                                                 |
|------------------|-------------------|-------------------------------------------------------------------------------------------------|
| **admin**        | `String`          | The admin address, which is the only address allowed to call messages on the contract.          |
| **vlp_code_id**  | `u64`             | The code_id used to instantiate new VLP contracts on the hub chain.                             |
| **virtual_balance_address**| `Option<Addr>`    | The address of the Virtual Balance contract used by the router.                                 |
| **locked**| `bool`    | Whether the contract is locked or not.                                 |

### GetChain
Queries information about the specified chain.
<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
    #[returns(ChainResponse)]
    GetChain { chain_uid: ChainUid },
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `

{"get_chain":{"chain_uid":"chainA"}}
`
}
]} />

| **Name**       | String| **Description**                                 |
|----------------|-------------|-------------------------------------------------|
| **chain_uid**       |[`ChainUid`](overview#crosschainuser)| The unique Id of the chain to get info for.|


The query returns the following response:

```rust
pub struct ChainResponse {
    pub chain: Chain,
    pub chain_uid: ChainUid,
}

pub struct Chain {
    pub factory_chain_id: String,
    pub factory: String,
    pub chain_type: ChainType,
}
```
| **Name**              | **Type**   | **Description**                                                             |
|-----------------------|------------|-----------------------------------------------------------------------------|
| **factory_chain_id**  | `String`   | The chain Id of the factory.                                                |
| **factory**           | `String`   | The contract address of the factory contract on the specified chain.         |
| **chain_type**        |`ChainType` | The type of chain. Either native or IBC. Native means the router contract is deployed on that chain. Since we only have one router, then there is only one chain type which will be native. |
| **chain_uid**       |[`ChainUid`](overview#crosschainuser)| The unique Id of the queried chain.|

**ChainType**:
```rust
pub enum ChainType {
    Ibc(IbcChain),
    Native {},
}

pub struct IbcChain {
    pub from_hub_channel: String,
    pub from_factory_channel: String,
}

```
| **Field**              | **Type**     | **Description**                             |
|------------------------|--------------|---------------------------------------------|
| `from_hub_channel`     | `String`     | The IBC channel used to forward messages from the router to factories on integrated chains.  |
| `from_factory_channel` | `String`     | The IBC channel used to forward messages from factories to the router. |

### GetAllChains
Queries information about all the chains connected to the router.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `

pub enum QueryMsg {
#[returns(AllChainResponse)]
GetAllChains {},
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{"get_all_chains":{}}
`
}
]} />

The query returns a vector of [**ChainResponse**](#getchain) containing information about each chain. 

### GetVlp
Queries the VLP address for the specified token pair.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
   #[returns(VlpResponse)]
    GetVlp { pair: Pair },
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{
  "get_vlp": {
    "pair": {
      "token_1": "atom",
      "token_2": "osmo"
    }
  }
}
`
}
]} />

| **Name**  | **Type** | **Description**                      |
|-----------|----------|--------------------------------------|
| `pair`    | [`Pair`](overview#pair)   | The pair of tokens for the query.    |

The query returns the following response:

```rust
pub struct VlpResponse {
    pub vlp: String,
    pub token_1: Token,
    pub token_2: Token,
}
```
| **Name**       | **Type**|**Description**                                 |
|----------------|-------------------------------------------------|--------|
| **vlp**| |String|The contract address of the VLP holding the token pair.|
| **token_1** | [`Token`](overview#token)|The Id of the first token in the VLP to fetch.|
| **token_2**|[`Token`](overview#token) |The Id of the second token in the VLP to fetch.|


### GetAllVlps
Queries all the VLP addresses for all token pairs.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
  #[returns(AllVlpResponse)]
    GetAllVlps {
        pagination: Pagination<(Token, Token)>,
    },
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{
  "get_all_vlps": {
    "pagination": {
      "min": ["usdt", "usdc"],
      "max": ["usdc", "dai"],
      "skip": 5,
      "limit": 10
    }
  }
}
`
}
]} />


| **Field**      | **Type**                          | **Description**                                            |
|----------------|-----------------------------------|------------------------------------------------------------|
| `pagination`   | [`Pagination<(Token, Token)>`](../CosmWasm/overview.md#pagination)      | Pagination parameters.  |

The query returns a vector of [**VlpResponse**](#getvlp) each containing information about a VLP.

### SimulateSwap
Simulates a swap based on the specified info.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content:`
   #[returns(SimulateSwapResponse)]
    SimulateSwap(QuerySimulateSwap),

    pub struct QuerySimulateSwap {
    pub asset_in: Token,
    pub amount_in: Uint128,
    pub asset_out: Token,
    pub min_amount_out: Uint128,
    pub swaps: Vec<NextSwapPair>,
}

`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `

{
  "simulate_swap": {
    "asset_in": "tokenA",
    "amount_in": "1000000",
    "asset_out": "tokenB",
    "min_amount_out": "950000",
    "swaps": [
      {
        "token_in": "tokenA",
        "token_out": "tokenC"
      },
      {
        "token_in": "tokenC",
        "token_out": "tokenB"
      }
    ]
  }
}
`
}
]} />

| **Name**         | **Type**            | **Description**                                             |
|------------------|---------------------|-------------------------------------------------------------|
| `asset_in`       | [`Token`](overview#token)             | The identifier for the input asset token.                   |
| `amount_in`      | `Uint128`           | The amount of the input asset token.                        |
| `asset_out`      | [`Token`](overview#token)             | The identifier for the output asset token.                  |
| `min_amount_out` | `Uint128`           | The minimum amount of the output asset token.               |
| `swaps`          | `Vec<NextSwapPair>` | A list of swap pairs needed to complete the swap.           |

With the following struct:

```rust

/// The next token pair in the swap route
pub struct NextSwapPair {
    pub token_in: Token,
    pub token_out: Token,
}
```
| **Name**   | **Type**  | **Description**                                   |
|------------|-----------|---------------------------------------------------|
| `token_in` |[`Token`](overview#token)   | The token Id for the input token in the swap.   |
| `token_out`| [`Token`](overview#token)   | The token Id for the output token in the swap.  |

The query returns the following response:
```rust
pub struct SimulateSwapResponse {
    pub amount_out: Uint128,
    pub asset_out: Token,
}
```
| **Name**     | **Type**  | **Description**                               |
|--------------|-----------|-----------------------------------------------|
| `amount_out` | `Uint128` | The amount of the output asset.               |
| `asset_out`  | [`Token`](overview#token)   | The identifier for the output asset token.    |

### SimulateReleaseEscrow

Simulates a request to release the specified token on the specified cross chain addresses.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
  #[returns(SimulateEscrowReleaseResponse)]
    SimulateReleaseEscrow {
        token: Token,
        amount: Uint128,
        cross_chain_addresses: Vec<CrossChainUserWithLimit>,
    }
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{
  "simulate_release_escrow": {
    "token": "nibi",
    "amount": "100000000",
    "cross_chain_addresses": [
      {
        "user": {
          "chain_uid": "nibi",
          "address": "nibi1..."
        },
        "limit": "500000"
      },
      {
        "user": {
          "chain_uid": "ethereum",
          "address": "0xb36ba2..."
        }
      }
    ]
  }
}
`
}
]} />

| **Field**                 | **Type**                               | **Description**                                           |
|-----------------------|------------------------------------|-------------------------------------------------------|
| `token`                 | [`Token`](overview#token)                             | Identifier for the token.                             |
| `amount`                | Uint128                   | Amount of token to be released.      |
| cross_chain_addresses | [`Vec<CrossChainUserWithLimit>`](overview#crosschainuserwithlimit)       |  A set of addresses to specify where the tokens should be released. The first element specified in the vector has highest priority and so on. User specifies a limit for each provided address which indicates the amount of funds that should be released to that address. In case there is any leftover funds, they are added to the user's virtual balance for the address that initiated the message. If limit is not specified, then the maximum amount is taken.|

### QueryTokenEscrows
Returns a list of chain UIDs belonging to the chains that have an escrow with the specified token Id. Also returns the amount of tokens available on each chain.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
 #[returns(TokenEscrowsResponse)]
    QueryTokenEscrows {
        token: Token,
        pagination: Pagination<ChainUid>,
    }
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{
  "query_token_escrows": {
    "token": "usdt",
    "pagination": {
      "min": "nibiru",
      "max": "ethereum",
      "skip": 3,
      "limit": 20
    }
  }
}
`
}
]} />

| **Field**   | **Type**             | **Description**                                      |
|-------------|----------------------|------------------------------------------------------|
| `token`     | [`Token`](overview#token)              | The token identifier for which escrows are being queried. |
| `pagination`   | [`Pagination<(ChainUid)>`](../CosmWasm/overview.md#pagination)      | Pagination parameters.  |



The query returns the following response:

```rust
pub struct TokenEscrowsResponse {
    pub chains: Vec<TokenEscrowChainResponse>,
}
pub struct TokenEscrowChainResponse {
    pub chain_uid: ChainUid,
    pub balance: Uint128,
}
```
| **Field** | **Type**         | **Description**                      |
|-----------|------------------|--------------------------------------|
| `chainUid`  | `Vec<ChainUid>`  | The unique identifiers for the chain that has an escrow containing the specified token.​ |
|`balance`     | `Uint128`         | The amount of tokens in the escrow. 



### QueryAllEscrows
Queries all the available escrows in the Euclid ecosystem.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
  #[returns(AllEscrowsResponse)]
    QueryAllEscrows { pagination: Pagination<Token> },
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{
  "query_all_escrows": {
    "pagination": {
      "min": "nibiru",
      "max": "ethereum",
      "skip": 2,
      "limit": 15
    }
  }
}
`
}
]} />

| **Field**   | **Type**        | **Description**                                      |
|-------------|-----------------|------------------------------------------------------|
| `pagination`   | [`Pagination<(Token)>`](../CosmWasm/overview.md#pagination)      | Pagination parameters.  |

The query returns the following response:

```rust
pub struct AllEscrowsResponse {
    pub escrows: Vec<EscrowResponse>,
}

pub struct EscrowResponse {
    pub token: Token,
    pub chain_uid: ChainUid,
    pub balance: Uint128,
}
```
| **Field**   | **Type**     | **Description**                                  |
|-------------|--------------|--------------------------------------------------|
| `token`     | [`Token`](overview#token)      | The token held in the escrow.                        |
| `chain_uid` | [`ChainUid`](overview#crosschainuser)   | The chain UID of the chain hosting the escrow.|
| `balance`   | `Uint128`    | The amount of tokens available in the escrow.              |

### QueryAllTokens
Queries information on all available tokens.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
  #[returns(AllTokensResponse)]
   QueryAllTokens { pagination: Pagination<Token> },
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{
  "query_all_tokens": {
    "pagination": {
      "min": "nibi",
      "max": "osmo",
      "skip": 2,
      "limit": 20
    }
  }
}
`
}
]} />

| **Field**   | **Type**        | **Description**                                      |
|-------------|-----------------|------------------------------------------------------|
| `pagination`   | [`Pagination<(Token)>`](../CosmWasm/overview.md#pagination)      | Pagination parameters.  |

The query returns the following response:

```rust
pub struct AllTokensResponse {
    pub tokens: Vec<Token>,
}
```
| **Field**    | **Type**    | **Description**                      |
|--------------|-------------|--------------------------------------|
| `tokens`      | [`Token`](overview#token)     | A vector of token Ids for all tokens that have pools in the Euclid ecosystem.|


### QueryTokenDenoms
Queries all the available denoms for the specified token.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
  #[returns(TokenDenomsResponse)]
    QueryTokenDenoms { token: Token },
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{
  "query_token_denoms": {
    "token": "usdc"
  }
}
`
}
]} />

| **Field**   | **Type**        | **Description**                                      |
|-------------|-----------------|------------------------------------------------------|
| `token`   | [`Token`](overview#token)     | The token Id of the token to get all denoms for.  |

The query returns the following response:

```rust
pub struct TokenDenomsResponse {
    pub denoms: Vec<TokenDenom>,
}

pub struct TokenDenom {
    pub chain_uid: ChainUid,
    pub token_type: TokenType,
}

```
| **Field**    | **Type**    | **Description**                      |
|--------------|-------------|--------------------------------------|
| `chain_uid`      | [`ChainUid`](overview#crosschainuser)     | The unique Id of the chain that the denom resides on.  |
| `token_type`      | [`TokenType`](overview#tokentype)      | The type of token. Returns the denom for native and CW20 contract address for CW20 token.  |

