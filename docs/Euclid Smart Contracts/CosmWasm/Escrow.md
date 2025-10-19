---
sidebar_position: 5
description: "The Escrow Smart Contract"
---
import Tabs from '@site/src/components/Tabs';

## Query Messages 
:::note
We will only go through the queries for this contract, as users are not allowed to execute any messages on the Escrow contract directly.
You can read about the Escrow architecture [here](../../Architecture%20Overview/Architecture/Integrated%20Chains%20Layer/escrows.md).
:::
List of queries that can be performed on the Escrow contract.
### State
Queries the state of the contract for information such as the stored token and the amount.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
    #[returns(StateResponse)]
    State {},
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{"state":{}}
`
}
]} />

The query returns the following response:
```rust
#[cw_serde]
pub struct StateResponse {
    pub token: Token,
    pub factory_address: Addr,
    pub total_amount: Uint128,
}
```
| **Name**            | **Type**     | **Description**                           |
|-----------------|----------|---------------------------------------|
| `token`          | [`Token`](overview#token)   | The token Id of the token stored in the escrow. |
| `factory_address` | `Addr`     | Contract address of the factory contract deployed on the same chain.              |
| `total_amount`    | `Uint128`  | Total amount of tokens stored in the escrow.            |

### TokenId
Queries the token Id of the token being held in the escrow.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
    #[returns(TokenIdResponse)]
    TokenId {},
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
{"token_id":{}}
`
}
]} />

The query returns the following response:

```rust
pub struct TokenIdResponse {
    pub token_id: String,
}
```

| Name          | Type |Description                       |
|---------------|-----------------------------------|-------|
| `token_id`       | `String`| The unique Id for the token type held in the escrow.|

### TokenAllowed

Checks if the specified token is allowed to be stored in this escrow.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
    #[returns(AllowedTokenResponse)]
    TokenAllowed { denom: TokenType },
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
JSON Example: 
{
  "token_allowed": {
    "denom": {
      "native": {
        "denom": "osmo"
      }
    }
  }
}
`
}
]} />
&nbsp;

| **Name** | **Type**      | **Description**                   |
|----------|---------------|-----------------------------------|
| `denom`  | [`TokenType`](overview#tokentype)   | The type of token. Returns the denom for native and CW20 contract address for CW20 token.   |

The query returns the following response:

```rust

pub struct AllowedTokenResponse {
    pub allowed: bool,
}
```
| **Name**          |**Type** | **Description**                       |
|---------------|-----------------------------------|-----------------|
| `allowed`       | bool |Set to true if the specified token is allowed in this escrow and false otherwise. |

### AllowedDenoms
Queries all the tokens allowed to be stored in the escrow.

<Tabs tabs={[
{
id: 'rust-example',
label: 'Rust',
language: 'rust',
content: `
pub enum QueryMsg {
     #[returns(AllowedDenomsResponse)]
    AllowedDenoms {},
}
`
},
{
id: 'json-example',
label: 'JSON',
language: 'json',
content: `
JSON Example: 
{
  "allowed_denoms": {}
}
`
}
]} />

The query returns the following response:

```rust
pub struct AllowedDenomsResponse {
    pub denoms: Vec<TokenType>,
}
```
| **Name** | **Type**            | **Description**                              |
|----------|---------------------|----------------------------------------------|
| `denoms` | [`Vec<TokenType>`](overview#tokentype)    | A list of allowed tokens along with their types . |