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

  it('multiCall(inputs)', async () => {
    const baseInput: CallInput = {
      interface: testContract.interface,
      target: testContract.address,
      function: ''
    };
    const inputs = [
      { ...baseInput, function: 'getUint' },
      { ...baseInput, function: 'getUint2' },
      { ...baseInput, function: 'getUintArray' },
      { ...baseInput, function: 'getUintArray2' },
      { ...baseInput, function: 'getStruct' },
      { ...baseInput, function: 'doRevert' }
    ];
    const result = await multiCall.multiCall(inputs);
    const [
      testuint,
      testuint2,
      testarray,
      testarray2,
      testStruct,
      testRevert
    ] = result;
    expect(testuint).to.eq(BigNumber.from(10).pow(20));
    expect(testuint2).to.deep.eq([
      BigNumber.from(10).pow(18),
      BigNumber.from(10).pow(19)
    ])
    expect(testarray).to.deep.eq([
      BigNumber.from(10).pow(20),
      BigNumber.from(10).pow(18)
    ]);
    expect(testarray2).to.deep.eq([
      BigNumber.from(10).pow(20)
    ]);
    expect(testStruct.a).to.eq(BigNumber.from(10).pow(18));
    expect(testStruct.b).to.deep.eq([50, 2]);
    expect(testRevert).to.eq(null);
  });

  it('multiCall(inputs, strict = true)', async () => {
    const inputs = [
      { 
        interface: testContract.interface,
        target: testContract.address,
        function: 'doRevert'
      }
    ];
    await expect(multiCall.multiCall(inputs, true)).to.be.revertedWith('Triggered error D:');
  });

  it('multiCall(interface, inputs)', async () => {
    const baseInput: CallInput = {
      target: testContract.address,
      function: ''
    };
    const inputs = [
      { ...baseInput, function: 'getUint' },
      { ...baseInput, function: 'getUint2' },
      { ...baseInput, function: 'getUintArray' },
      { ...baseInput, function: 'getUintArray2' },
      { ...baseInput, function: 'getStruct' },
      { ...baseInput, function: 'doRevert' }
    ];
    const result = await multiCall.multiCall(testContract.interface, inputs);
    const [
      testuint,
      testuint2,
      testarray,
      testarray2,
      testStruct,
      testRevert
    ] = result;
    expect(testuint).to.eq(BigNumber.from(10).pow(20));
    expect(testuint2).to.deep.eq([
      BigNumber.from(10).pow(18),
      BigNumber.from(10).pow(19)
    ])
    expect(testarray).to.deep.eq([
      BigNumber.from(10).pow(20),
      BigNumber.from(10).pow(18)
    ]);
    expect(testarray2).to.deep.eq([
      BigNumber.from(10).pow(20)
    ]);
    expect(testStruct.a).to.eq(BigNumber.from(10).pow(18));
    expect(testStruct.b).to.deep.eq([50, 2]);
    expect(testRevert).to.eq(null);
  });

  it('multiCall(interface, inputs, strict = true)', async () => {
    const inputs = [
      { 
        target: testContract.address,
        function: 'doRevert'
      }
    ];
    await expect(multiCall.multiCall(testContract.interface, inputs, true)).to.be.revertedWith('Triggered error D:');
  });

  it('multiCall(abi, inputs)', async () => {
    const baseInput: CallInput = {
      target: testContract.address,
      function: ''
    };
    const inputs = [
      { ...baseInput, function: 'getUint' },
      { ...baseInput, function: 'getUint2' },
      { ...baseInput, function: 'getUintArray' },
      { ...baseInput, function: 'getUintArray2' },
      { ...baseInput, function: 'getStruct' },
      { ...baseInput, function: 'doRevert' }
    ];
    const result = await multiCall.multiCall(abi, inputs);
    const [
      testuint,
      testuint2,
      testarray,
      testarray2,
      testStruct,
      testRevert
    ] = result;
    expect(testuint).to.eq(BigNumber.from(10).pow(20));
    expect(testuint2).to.deep.eq([
      BigNumber.from(10).pow(18),
      BigNumber.from(10).pow(19)
    ])
    expect(testarray).to.deep.eq([
      BigNumber.from(10).pow(20),
      BigNumber.from(10).pow(18)
    ]);
    expect(testarray2).to.deep.eq([
      BigNumber.from(10).pow(20)
    ]);
    expect(testStruct.a).to.eq(BigNumber.from(10).pow(18));
    expect(testStruct.b).to.deep.eq([50, 2]);
    expect(testRevert).to.eq(null);
  });

  it('multiCall(abi, inputs, strict = true)', async () => {
    const inputs = [
      { 
        target: testContract.address,
        function: 'doRevert'
      }
    ];
    await expect(multiCall.multiCall(abi, inputs, true)).to.be.revertedWith('Triggered error D:');
  });
});