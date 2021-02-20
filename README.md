# @indexed-finance/multicall

Solidity contract and typescript library for static multi-calls.

The MultiCall.sol contract executes multiple calls inside its constructor and returns the result as an ABI encoded bytes array. When the initialization code is sent to the 0 address as an `eth_call` operation, the code is not deployed and the returndata that would have been deployed if it was sent with `eth_sendTransaction` is returned. This enables simple multi-call functionality for on-chain queries without needing to deploy an aggregator contract.

The class defines a generic function `multiCall` that takes an ethers `Interface` object or a JSON ABI array as inputs along with the address, function names and arguments to call. The class then decodes the returndata and returns the results as an array.

There are also three more specific contracts in this library that can simplify common use-cases while using less bytecode.
These are:
- Querying the balance of a single address for many ERC20 tokens (and ether)
- Querying the balance of a single account and the allowance that account has provided to a specific address for many ERC20 tokens
- Querying the reserves of many Uniswap pairs

All multicalls return the block number the data was pulled from.

## Install

> npm install --save @indexed-finance/multicall


# Examples

## General Usage

If we have this example contract:

```
contract TokenMap {
  struct TokenData {
    uint256 balance;
    uint8 decimals;
  }

  mapping(address => TokenData) internal _tokenDatas;

  function getTokenData(address token) external view returns (TokenData memory) {
    return _tokenDatas[token];
  }
}
```


We can execute a multi-call with this javascript code:

```js
const MultiCall = require('@indexed-finance/multicall');
const { abi } = require('./artifacts/TokenMap.json');

async function getMultiCallResults(provider, tokenMapAddress, tokens) {
  const multi = new MultiCall(provider);
  const inputs = [];
  for (let token of tokens) {
    inputs.push({ target: tokenMapAddress, function: 'getTokenData', args: [token] });
  }
  const tokenDatas = await multi.multiCall(abi, inputs);
  return tokenDatas;
}
// Result: [number, Array<{ balance: BigNumber, decimals: number }>]
// The first value is the block number the data was pulled from
```

## Querying Token Balances

```js
// Check the balance of the null address for dai and weth
const multi = new MultiCall(provider);
const tokens = [
  '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // weth
  '0x0000000000000000000000000000000000000000' // eth
];
const account = '0x0000000000000000000000000000000000000000';
const [blockNumber, balances] = await multi.getBalances(tokens, account);

const daiBalance = balances['0x6b175474e89094c44da98b954eedeac495271d0f'];
const wethBalance = balances['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'];
const ethBalance = balances['0x0000000000000000000000000000000000000000'];
```

## Querying Token Balances and Allowances

```js
// Check the balance of an account for dai and weth
// and the allowance the account has given to the Uniswap router

const multi = new MultiCall(provider);

const tokens = [
  '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // weth
]

const owner = '0x0000000000000000000000000000000000000000'
const spender = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // uniswap router

const [blockNumber, balancesAndAllowances] = await multi.getBalancesAndAllowances(tokens, owner, spender)

const {
  balance: daiBalance,
  allowance: daiAllowance
} = balancesAndAllowances['0x6b175474e89094c44da98b954eedeac495271d0f']

const {
  balance: wethBalance,
  allowance: wethAllowance
} = balancesAndAllowances['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2']
```

## Querying Uniswap Pair Reserves

```js
// Check the reserves for Uniswap pairs

const multi = new MultiCall(provider);

const pairs = [
  '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11', // dai-weth
  '0x004375dff511095cc5a197a54140a24efef3a416' // wbtc-usdc
]

const [blockNumber, reserves] = await multi.getReserves(pairs);

const {
  reserve0: daiWethR0,
  reserve1: daiWethR1,
  blockTimestampLast: daiWethTimestamp
} = reserves['0xa478c2975ab1ea89e8196811f51a7b7ade33eb11'];

const {
  reserve0: wbtcUsdcR0,
  reserve1: wbtcUsdcR1,
  blockTimestampLast: wbtcUsdcTimestamp
} = reserves['0x004375dff511095cc5a197a54140a24efef3a416'];
```

# API

## `MultiCall`

To create a `MultiCall` object, give an ethers or web3 provider in the constructor, e.g. `new MultiCall(provider)`

### `MultiCall.multiCall`
The `MultiCall` class has a `multiCall` function which takes an array of `CallInput` objects.

Each `CallInput` has:
- `interface` - ABI array or ethers `Interface` object
- `target` - address of the contract to call
- `function` - name of the function to call, or function signature if the function is overloaded
- `args` - array of parameters to send in the call

Optionally, the interface can be provided as the first parameter and left out of the call input objects if all the calls target the same contract.

The multi-call will then bundle all of these calls into the constructor arguments for the `MultiCall` contract, which will call each of the functions and return an array with each call's returndata.

**Strict mode**

If a call reverts, the default behavior for the contract is to return an empty `bytes` for that call. However, you may provide a `strict` boolean field as an input parameter to `multiCall` which will instead revert the entire call.

**Parameters**

`multiCall` has two function signatures:

```ts
multiCall(_interface: Interface | JsonFragment[], inputs: CallInput[], strict?: boolean): Promise<[number, any[]]>;

multiCall(inputs: CallInput[], strict?: boolean): Promise<[number, any[]]>;
```

**Response**

The result will be a promise which resolves to an array with two values: the first is a `number` which is the block number the data was from, and the second is an array with the decoded return data from each call. The data will be decoded by the ethers interface using whatever return types are defined in the ABI. If `strict: true` is not given, the result of any call that reverted will be `null`.

### `MultiCall.getReserves`

The `MultiCall` class has a `getReserves` function which can query the reserves for many Uniswap pairs.

**Parameters**

The input parameter is an array of addresses of Uniswap pairs.

**Response**

The response from this function is a promise that resolves to an array with two values: the first is a `number` which is the block number the data was from, and the second is an object with the Uniswap pair addresses as keys and a `UniswapPairReserves` type as values.

```ts
// response type
Promise<[
  number, // block number
  {
    [pair: string]: {
      reserve0: BigNumber,
      reserve1: BigNumber,
      blockTimestamp: number
    }
  }
]>
```

### `MultiCall.getBalances`

The `MultiCall` class has a `getBalances` function which can query the balance of a single account for many tokens or ether.

**Parameters**

This function takes in an array of token addresses followed by the address of the account to query balances for. If the null address (`0x0000000000000000000000000000000000000000`) is provided as an input token, the balance returned will be the ether balance of `account`.

```ts
getBalances(tokens: string[], account: string);
```

**Response**

The response from this function is a promise that resolves to an array with two values: the first is a `number` which is the block number the data was from, and the second is an object with the token addresses as keys and `BigNumber` as values.

```ts
// response type
Promise<[
  number, // block number
  {
    [token: string]: BigNumber
  }
]>
```

### `MultiCall.getBalancesAndAllowances`

The `MultiCall` class has a `getBalancesAndAllowances` function which can query the balance of a single account for many tokens and the allowance the account has provided to a specific address for those tokens.

**Parameters**

This function takes in an array of token addresses, the address of the account whose allowances and balances are being queried, and the address of the spender for the allowance queries.

```ts
getBalancesAndAllowances(tokens: string[], owner: string, spender: string)
```

**Response**

The response from this function is a promise that resolves to an array with two values: the first is a `number` which is the block number the data was from, and the second is an object with the token addresses as keys and a `TokenBalanceAndAllowance` type as values.

```ts
// response type
Promise<[
  number, // block number
  {
    [token: string]: {
      balance: BigNumber; // balance of `owner`
      allowance: BigNumber; // amount `owner` has approved `spender` to spend
    }
  }
]>
```