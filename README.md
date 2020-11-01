# @indexed-finance/multicall

Solidity contract and typescript library for static multi-calls.

The MultiCall.sol contract executes multiple calls inside its constructor and returns the result as an ABI encoded bytes array. When the initialization code is sent to the 0 address as an `eth_call` operation, the code is not deployed and the returndata that would have been deployed if it was sent with `eth_sendTransaction` is returned. This enables simple multi-call functionality for on-chain queries without needing to deploy an aggregator contract.

The class in the typescript library takes an ethers `Interface` object or a JSON ABI array as inputs along with the address, function names and arguments to call. The class then decodes the returndata and returns the results as an array.

## Install

> npm install --save @indexed-finance/multicall

## API

### `MultiCall`

To create a `MultiCall` object, give an ethers or web3 Provider in the constructor, e.g. `new MultiCall(provider)`

### `MultiCall.multiCall`
The `MultiCall` class has a single `multiCall` function which takes an array of `CallInput` objects.

Each `CallInput` has:
- `interface` - ABI array or ethers `Interface` object
- `target` - address of the contract to call
- `function` - name of the function to call, or function signature if the function is overloaded
- `args` - array of parameters to send in the call

Optionally, the interface can be provided as the first parameter and left out of the call input objects if all the calls target the same contract.

The multi-call will then bundle all of these calls into the constructor arguments for the `MultiCall` contract, which will call each of the functions and return an array with each call's returndata.

**Strict mode**

If a call reverts, the default behavior for the contract is to return an empty `bytes` for that call. However, you may provide a `strict` boolean field as an input parameter to `multiCall` which will instead revert the entire call.

**Parameter options**

`multiCall` has two function signatures:

```js
multiCall(_interface: Interface | JsonFragment[], inputs: CallInput[], strict?: boolean): Promise<any[]>;

multiCall(inputs: CallInput[], strict?: boolean): Promise<any[]>;
```

**Response**

The result will be a promise which resolves to an array with the decoded return data from each call. The data will be decoded by the ethers interface using whatever return types are defined in the ABI. If `strict: true` is not given, the result of any call that reverted will be `null`.

## Example

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
// Result: Array<{ balance: BigNumber, decimals: number }>
```