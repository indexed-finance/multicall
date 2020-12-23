import { BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { toProvider } from "./utils";

import { TokenBalances, TokenBalancesAndAllowances } from './types';
import { MultiTokenBalanceAndAllowanceGetter, MultiTokenBalanceGetter } from './bytecode.json'

export async function getBalances(
  provider_: any,
  tokens: string[],
  account: string
): Promise<TokenBalances> {
  const provider = toProvider(provider_);
  const inputData = defaultAbiCoder.encode(['address[]', 'address'], [tokens, account]);
  const bytecode = MultiTokenBalanceGetter.concat(inputData.slice(2));
  const encodedReturnData = await provider.call({ data: bytecode });
  const decodedReturnData = defaultAbiCoder.decode(['uint256[]'], encodedReturnData)[0];
  const balances: TokenBalances = {};
  for (let i = 0; i < tokens.length; i++) {
    balances[tokens[i]] = decodedReturnData[i];
  }
  return balances;
}

export async function getBalancesAndAllowances(
  provider_: any,
  tokens: string[],
  owner: string,
  spender: string
): Promise<TokenBalancesAndAllowances> {
  const provider = toProvider(provider_);
  const inputData = defaultAbiCoder.encode(['address[]', 'address', 'address'], [tokens, owner, spender]);
  const bytecode = MultiTokenBalanceAndAllowanceGetter.concat(inputData.slice(2));
  const encodedReturnData = await provider.call({ data: bytecode });
  const decodedReturnData = defaultAbiCoder.decode(['uint256[2][]'], encodedReturnData)[0];
  const balancesAndAllowances: TokenBalancesAndAllowances = {};
  for (let i = 0; i < tokens.length; i++) {
    const [balance, allowance] = decodedReturnData[i];
    balancesAndAllowances[tokens[i]] = { balance, allowance };
  }
  return balancesAndAllowances;
}