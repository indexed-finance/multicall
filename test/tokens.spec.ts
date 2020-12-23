import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { getBalances, getBalancesAndAllowances } from '../dist';

describe('token multicall', async () => {
  let testContract: Contract;
  let signer: SignerWithAddress;

  before(async () => {
    [,signer] = await ethers.getSigners();
    testContract = await (await ethers.getContractFactory('TestContract')).deploy();
  });

  describe('getBalances(tokens, account)', async () => {
    it('Returns balances for the input account mapped to the token addresses', async () => {
      const balances = await getBalances(ethers.provider, [testContract.address], signer.address);
      expect(balances[testContract.address].eq(BigNumber.from(signer.address))).to.be.true;
    });

    it('Returns ether balance if null token is given', async () => {
      const nullAddress = `0x${'00'.repeat(20)}`;
      const balances = await getBalances(ethers.provider, [testContract.address, nullAddress], signer.address);
      expect(balances[testContract.address].eq(BigNumber.from(signer.address))).to.be.true;
      expect(balances[nullAddress].eq(await signer.getBalance())).to.be.true;
    });
  });

  describe('getBalancesAndAllowances(tokens, owner, spender)', async () => {
    const addressTwo = `0x${'00'.repeat(19)}02`;

    it('Returns balances and allowances for the owner and spender mapped to the token addresses', async () => {
      const balancesAndAllowances = await getBalancesAndAllowances(ethers.provider, [testContract.address], signer.address, addressTwo);
      const { balance, allowance } = balancesAndAllowances[testContract.address];
      expect(balance.eq(BigNumber.from(signer.address))).to.be.true;
      expect(allowance.eq(BigNumber.from(signer.address).mul(2))).to.be.true;
    });

    it('Returns ether balance and null allowance if null token is given', async () => {
      const nullAddress = `0x${'00'.repeat(20)}`;
      const balancesAndAllowances = await getBalancesAndAllowances(ethers.provider, [nullAddress], signer.address, addressTwo);
      const { balance, allowance } = balancesAndAllowances[nullAddress];
      expect(balance.eq(await signer.getBalance())).to.be.true;
      expect(allowance.eq(0)).to.be.true;
    });
  });
});