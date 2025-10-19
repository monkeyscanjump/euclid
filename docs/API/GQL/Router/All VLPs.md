---
sidebar_position: 5
---
## All VLPs

Queries all the VLP contract addresses and specifies the tokens for each.

```graphql
query All_vlps($max: [String], $min: [String], $skip: Int, $limit: Int) {
  router {
    all_vlps(max: $max, min: $min, skip: $skip, limit: $limit) {
      vlps {
        vlp
        token_1
        token_2
      }
    }
  }
}
```

### Example

```bash
curl --request POST \
    --header 'content-type: application/json' \
    --url 'https://testnet.api.euclidprotocol.com/graphql' \
    --data '{"query":"query All_vlps($max: [String], $min: [String], $skip: Int, $limit: Int) {\n  router {\n    all_vlps(max: $max, min: $min, skip: $skip, limit: $limit) {\n      vlps {\n        vlp\n        token_1\n        token_2\n      }\n    }\n  }\n}","variables":{"max":null,"min":null,"skip":null,"limit":null}}'
```

[Open in Playground](https://testnet.api.euclidprotocol.com/?explorerURLState=N4IgJg9gxgrgtgUwHYBcQC4QEcYIE4CeABAIIA2ZA%2BgG5kAOAzgBQAkcAhgB7pEDaAyijwBLJAHMAugBoibUTwFDRkmSwYBrYXR4BJVKrLC4wlLtQBKIsAA6SIkTwQYKfFdv377CjXrMO3WX8ZYyQeOSQZDS0wqLoZQ2NTWQSTSxs7D3taRjcMzKz6d3z7FAh1ZEoARiLi0vKkSgAmGo8AXxb2jM7WkCkQanYRdgAjMgQGDBB0%2B2sQf1meJBgKKSLZkIWiJZW1kFjN7bJVjNmUlAPlslse1qA)

### Arguments

| **Name** | **Type**     | **Description**                                                                 |
|----------|--------------|---------------------------------------------------------------------------------|
| `max`    | [String]     | The upper limit token pair to return (exclusive).                              |
| `min`    | [String]     | The lower limit token pair to start from (inclusive).                          |
| `skip`   | Int          | The number of results to skip in the response.                                 |
| `limit`  | Int          | The maximum number of results to return. Defaults to 10 if not specified.                                     |

### Return Fields

| **Field**                  | **Type**   | **Description**                                             |
|------------------------|--------|---------------------------------------------------------|
| `vlp`                    | `String` | The VLP contract address.                                     |
| `token_1`                | `String` | The identifier of the first token in the pair.          |
| `token_2`                | `String` | The identifier of the second token in the pair.         |