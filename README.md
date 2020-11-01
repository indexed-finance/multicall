# @indexed-finance/multicall

Solidity contract and typescript library for static multi-calls.

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