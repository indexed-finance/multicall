# @indexed-finance/multicall

Solidity contract and typescript library for static multi-calls.

The MultiCall.sol contract executes multiple calls inside its constructor and returns the result as an ABI encoded bytes array. When the initialization code is sent to the 0 address as an `eth_call` operation, the code is not deployed and the returndata that would have been deployed if it was sent with `eth_sendTransaction` is returned. This enables simple multi-call functionality for on-chain queries without needing to deploy an aggregator contract.

The class in the typescript library takes an ethers `Interface` object or a JSON ABI array as inputs along with the address, function names and arguments to call. The class then decodes the returndata and returns the results as an array.

## Install

> npm install --save @indexed-finance/multicall

## How to use

```js
const MultiCall = require('@indexed-finance/multicall');
const { abi } = require('./artifacts/SomeContract.json');

function getMultiCallResults(provider, someContractAddress) {
  const inputs = [
    {
      target: someContractAddress,
      function: 'getSomeInfo',
      args: [1, 2]
    },
    {
      target: someContractAddress,
      function: 'getSomeInfo',
      args: [3, 4]
    }
  ];
  const multiCall = new MultiCall(provider);
  return multiCall.multiCall(abi, inputs);
}
```