import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { CallInput, MultiCall } from '../src';
const { abi } = require('../artifacts/contracts/test/TestContract.sol/TestContract.json');

describe('MultiCall', async () => {
  let testContract: Contract;
  let multiCall: MultiCall;

  before(async () => {
    testContract = await (await ethers.getContractFactory('TestContract')).deploy();
    multiCall = new MultiCall(ethers.provider);
  });

  it('inputs: CallInput[]', async () => {
    const baseInput: CallInput = {
      interface: testContract.interface,
      args: [],
      target: testContract.address,
      function: ''
    };
    const inputs = [
      { ...baseInput, function: 'getUint' },
      { ...baseInput, function: 'getUintArray' },
      { ...baseInput, function: 'getStruct' }
    ];
    const result = await multiCall.multiCall(inputs);
    const [
      testuint,
      testarray,
      testStruct
    ] = result;
    expect(testuint).to.eq(BigNumber.from(10).pow(20));
    expect(testarray).to.deep.eq([
      BigNumber.from(10).pow(20),
      BigNumber.from(10).pow(18)
    ]);
    expect(testStruct.a).to.eq(BigNumber.from(10).pow(18));
    expect(testStruct.b).to.deep.eq([50, 2]);
  });

  it('inputs: Interface, CallInput[]', async () => {
    const baseInput: CallInput = {
      args: [],
      target: testContract.address,
      function: ''
    };
    const inputs = [
      { ...baseInput, function: 'getUint' },
      { ...baseInput, function: 'getUintArray' },
      { ...baseInput, function: 'getStruct' }
    ];
    const result = await multiCall.multiCall(testContract.interface, inputs);
    const [
      testuint,
      testarray,
      testStruct
    ] = result;
    expect(testuint).to.eq(BigNumber.from(10).pow(20));
    expect(testarray).to.deep.eq([
      BigNumber.from(10).pow(20),
      BigNumber.from(10).pow(18)
    ]);
    expect(testStruct.a).to.eq(BigNumber.from(10).pow(18));
    expect(testStruct.b).to.deep.eq([50, 2]);
  });

  it('inputs: JsonFragment[], CallInput[]', async () => {
    const baseInput: CallInput = {
      args: [],
      target: testContract.address,
      function: ''
    };
    const inputs = [
      { ...baseInput, function: 'getUint' },
      { ...baseInput, function: 'getUintArray' },
      { ...baseInput, function: 'getStruct' }
    ];
    const result = await multiCall.multiCall(abi, inputs);
    const [
      testuint,
      testarray,
      testStruct
    ] = result;
    expect(testuint).to.eq(BigNumber.from(10).pow(20));
    expect(testarray).to.deep.eq([
      BigNumber.from(10).pow(20),
      BigNumber.from(10).pow(18)
    ]);
    expect(testStruct.a).to.eq(BigNumber.from(10).pow(18));
    expect(testStruct.b).to.deep.eq([50, 2]);
  });
});