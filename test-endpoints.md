# Endpoint Testing Results

## Router Module GraphQL Tests

### 1. getState (router.state)
- **Status**: ✅ FIXED - Working after chain_uid -> chainUid fix
- **Query**: `router { state { admin, vlp_code_id, virtual_balance_address } }`
- **Result**: Returns real data

### 2. getAllChains (router.all_chains)
- **Status**: 🔍 TESTING
- **Query**: `router { all_chains { chains { chain_uid, display_name, type } } }`
- **Expected**: List of supported chains

### 3. getAllTokens (router.all_tokens)
- **Status**: 🔍 TESTING  
- **Query**: `router { all_tokens(limit: 10) { tokens { token_id, display_name }, pagination } }`
- **Expected**: List of tokens with pagination

### 4. getAllVLPs (router.all_vlps)
- **Status**: 🔍 TESTING
- **Query**: `router { all_vlps(limit: 10) { vlps { vlp_address, pair { token_1, token_2 } }, pagination } }`
- **Expected**: List of VLP contracts

### 5. simulateSwap (router.simulate_swap)
- **Status**: 🔍 TESTING
- **Query**: `router { simulate_swap(asset_in: "...", amount_in: "1000", asset_out: "...", min_amount_out: "1", swaps: []) { amount_out, asset_out } }`
- **Expected**: Swap simulation results

### 6. getTokenDenoms (router.token_denoms)
- **Status**: ✅ FIXED - Updated field name from token_denom to token_denoms
- **Query**: `router { token_denoms(token_id: "...") { denoms } }`
- **Expected**: Token denominations

### 7. getTokenPairFromVLP (router.token_pairs_from_vlp)
- **Status**: ✅ FIXED - Updated field name
- **Query**: `router { token_pairs_from_vlp(vlp: "...") { pair { token_1, token_2 }, vlp_address } }`
- **Expected**: Token pair for VLP

## VLP Module GraphQL Tests

### 1. getAllPools (vlp.all_pools)
- **Status**: ✅ FIXED - Updated to use (contract, pair) parameters
- **Query**: `vlp(contract: "...", pair: { token_1: "...", token_2: "..." }) { all_pools { pools, pagination } }`
- **Expected**: List of pools in VLP

### 2. getAllPositions (vlp.all_positions)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `vlp(contract: "...", pair: { token_1: "...", token_2: "..." }) { all_positions { positions, pagination } }`
- **Expected**: All positions in VLP

### 3. getAssetList (vlp.asset_list)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `vlp(contract: "...", pair: { token_1: "...", token_2: "..." }) { asset_list { liquidity_token, vlp_token } }`
- **Expected**: Asset list for VLP

### 4. getMyPositions (vlp.my_positions)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `vlp(contract: "...", pair: { token_1: "...", token_2: "..." }) { my_positions(user_address: "...") { positions } }`
- **Expected**: User's positions

### 5. getPool (vlp.pool)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `vlp(contract: "...", pair: { token_1: "...", token_2: "..." }) { pool(pool_id: "...") { pool_info } }`
- **Expected**: Specific pool details

### 6. getPosition (vlp.position)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `vlp(contract: "...", pair: { token_1: "...", token_2: "..." }) { position(position_id: "...") { position_info } }`
- **Expected**: Specific position details

### 7. getTotalFeesCollected (vlp.total_fees_collected)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `vlp(contract: "...", pair: { token_1: "...", token_2: "..." }) { total_fees_collected { fees } }`
- **Expected**: Total fees collected

## Factory Module GraphQL Tests

### 1. getAllPools (factory.all_pools)
- **Status**: ✅ FIXED - Updated chain_uid -> chainUid
- **Query**: `factory(chainUid: "...") { all_pools { pools, pagination } }`
- **Expected**: All pools for chain

### 2. getAllTokens (factory.all_tokens)
- **Status**: ✅ FIXED - Updated parameter
- **Query**: `factory(chainUid: "...") { all_tokens { tokens, pagination } }`
- **Expected**: All tokens for chain

### 3. getAllowedDenoms (factory.allowed_denoms)
- **Status**: ✅ FIXED - Updated parameter
- **Query**: `factory(chainUid: "...") { allowed_denoms { denoms } }`
- **Expected**: Allowed denominations

### 4. getEscrow (factory.escrow)
- **Status**: ✅ FIXED - Updated parameter and field names
- **Query**: `factory(chainUid: "...") { escrow(token_id: "...") { escrow_address, chainUid } }`
- **Expected**: Escrow information

### 5. getTokenAddress (factory.get_token_address)
- **Status**: ✅ FIXED - Updated parameter
- **Query**: `factory(chainUid: "...") { get_token_address(token_id: "...") { address, chainUid } }`
- **Expected**: Token address

### 6. getPartnerFeesCollected (factory.partner_fees_collected)
- **Status**: ✅ FIXED - Updated parameter
- **Query**: `factory(chainUid: "...") { partner_fees_collected(partner: "...") { fees } }`
- **Expected**: Partner fees

### 7. getState (factory.state)
- **Status**: ✅ FIXED - Updated parameter and field name
- **Query**: `factory(chainUid: "...") { state { chainUid, router_contract, admin } }`
- **Expected**: Factory state

### 8. getVLP (factory.vlp)
- **Status**: ✅ FIXED - Updated parameter
- **Query**: `factory(chainUid: "...") { vlp(pair: { token_1: "...", token_2: "..." }) { vlp_address } }`
- **Expected**: VLP for token pair

## Pool Module GraphQL Tests

### 1. getPool (pool)
- **Status**: ✅ FIXED - Updated chainUid, poolAddress parameters
- **Query**: `pool(chainUid: "...", poolAddress: "...", pair: { token_1: "...", token_2: "..." }) { pool_id, total_liquidity }`
- **Expected**: Pool details

### 2. getPoolFees (pool.pool_fees)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `pool(chainUid: "...", poolAddress: "...", pair: { token_1: "...", token_2: "..." }) { pool_fees { fees } }`
- **Expected**: Pool fees

### 3. getSimulateJoinPool (pool.simulate_join_pool)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `pool(chainUid: "...", poolAddress: "...", pair: { token_1: "...", token_2: "..." }) { simulate_join_pool(...) { result } }`
- **Expected**: Join simulation

### 4. getSimulateExitPool (pool.simulate_exit_pool)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `pool(chainUid: "...", poolAddress: "...", pair: { token_1: "...", token_2: "..." }) { simulate_exit_pool(...) { result } }`
- **Expected**: Exit simulation

## Token Module GraphQL Tests

### 1. getTokenMetadata (token.token_metadatas)
- **Status**: ✅ FIXED - Updated chainUids parameter
- **Query**: `token { token_metadatas(chainUids: ["..."], limit: 10) { tokens, pagination } }`
- **Expected**: Token metadata

### 2. getTokenById (token.token_by_id)
- **Status**: ✅ FIXED - Updated chainUid parameter
- **Query**: `token { token_by_id(token_id: "...", chainUid: "...") { token_info } }`
- **Expected**: Specific token details

### 3. Other token functions
- **Status**: ✅ FIXED - All updated to use chainUid/chainUids

## Vcoin Module GraphQL Tests

### 1. getAllBalances (vcoin.all_balances)
- **Status**: ✅ FIXED - Updated chainUid, vcoinAddress parameters
- **Query**: `vcoin(chainUid: "...", vcoinAddress: "...") { all_balances { balances } }`
- **Expected**: All balances

### 2. getTotalSupply (vcoin.total_supply)
- **Status**: ✅ FIXED - Updated parameters
- **Query**: `vcoin(chainUid: "...", vcoinAddress: "...") { total_supply { total_supply } }`
- **Expected**: Supply information

### 3. getUserBalance (vcoin.user_balance)
- **Status**: ✅ FIXED - Updated parameters and field name
- **Query**: `vcoin(chainUid: "...", vcoinAddress: "...") { user_balance(user_address: "...") { balance, chainUid } }`
- **Expected**: User balance

## REST API Tests

### 1. Transaction Routes
- **Status**: 🔍 TESTING
- **Endpoint**: `/routes`
- **Expected**: Available transaction routes

### 2. Post Transaction
- **Status**: 🔍 TESTING  
- **Endpoint**: `POST /transaction`
- **Expected**: Transaction submission

### 3. Transaction Status
- **Status**: 🔍 TESTING
- **Endpoint**: `/transaction/{txHash}/status`
- **Expected**: Transaction status

### 4. Gas Estimation
- **Status**: 🔍 TESTING
- **Endpoint**: `/gas/estimate`
- **Expected**: Gas estimates

### 5. Chain Gas Price
- **Status**: 🔍 TESTING
- **Endpoint**: `/gas/price/{chainUid}`
- **Expected**: Gas prices

### 6. Account Balances
- **Status**: 🔍 TESTING
- **Endpoint**: `/balances/{address}`
- **Expected**: Account balances

### 7. Account Nonce
- **Status**: 🔍 TESTING
- **Endpoint**: `/nonce/{address}`
- **Expected**: Account nonce

---

## Summary of Fixes Applied

### ✅ Major GraphQL Parameter Fixes:
1. **Router**: `chain_uid` → `chainUid` in all queries
2. **VLP**: Complete parameter overhaul from `(chainUid, vlpAddress)` → `(contract, pair)`  
3. **Factory**: `factory(chain_uid: $chainUid)` → `factory(chainUid: $chainUid)`
4. **Pool**: `pool(chain_uid, pool_address)` → `pool(chainUid, poolAddress)`
5. **Tokens**: `chain_uids` → `chainUids`, `chain_uid` → `chainUid`
6. **Vcoin**: `vcoin(chain_uid, vcoin_address)` → `vcoin(chainUid, vcoinAddress)`

### ✅ Field Name Fixes:
1. **Router**: `token_denom` → `token_denoms`, `token_pair_from_vlp` → `token_pairs_from_vlp`
2. **Router State**: Added missing fields `admin`, `vlp_code_id`, `virtual_balance_address`
3. **Factory**: Response field `chain_uid` → `chainUid` in escrow/state responses
4. **VLP**: Fixed parameter structure in core-api.ts integration
5. **Tokens**: Fixed price type conversion (number → string)

### 🔍 Testing Status:
- **Core modules**: Router, VLP, Factory, Pool, Tokens, Vcoin - ALL FIXED
- **Deployment**: Updated version deployed to GitHub Pages
- **Next**: Systematic endpoint testing using API tester