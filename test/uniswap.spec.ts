import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { getReserves, UniswapPairReserves } from '../dist';

describe('uniswap multicall', async () => {
  let testContract1: Contract, testContract2: Contract;
  let data1: UniswapPairReserves = {
    reserve0: BigNumber.from(2).pow(100).add(3),
    reserve1: BigNumber.from(2).pow(111).add(5),
    blockTimestampLast: 12000
  };
  let data2: UniswapPairReserves = {
    reserve0: BigNumber.from(2).pow(99),
    reserve1: BigNumber.from(2).pow(101),
    blockTimestampLast: 99000
  };


  before(async () => {
    testContract1 = await (await ethers.getContractFactory('TestContract')).deploy();
    testContract2 = await (await ethers.getContractFactory('TestContract')).deploy();
    await testContract1.setReserves(
      data1.reserve0,
      data1.reserve1,
      data1.blockTimestampLast
    );
    await testContract2.setReserves(
      data2.reserve0,
      data2.reserve1,
      data2.blockTimestampLast
    );
  });

  it('getReserves(pairs)', async () => {
    const allReserves = await getReserves(ethers.provider, [testContract1.address, testContract2.address]);
    const pair1 = allReserves[testContract1.address];
    const pair2 = allReserves[testContract2.address];
    expect(pair1).to.deep.eq(data1);
    expect(pair2).to.deep.eq(data2);
  });
});