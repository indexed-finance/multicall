import { JsonFragment } from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";

import { CallInput, TokenBalances, TokenBalancesAndAllowances, UniswapReservesData } from './types';
import { toProvider } from "./utils";
import { multiCall } from './generic';
import { getBalances, getBalancesAndAllowances } from "./tokens";
import { getReserves } from "./uniswap";

export class MultiCall {
  private provider: Provider;
  constructor(provider: any) {
    this.provider = toProvider(provider);
  }

  public async multiCall(_interface: Interface | JsonFragment[], inputs: CallInput[], strict?: boolean): Promise<any[]>;
  public async multiCall(inputs: CallInput[], strict?: boolean): Promise<any[]>;
  public async multiCall(arg0: Interface | JsonFragment[] | CallInput[], arg1?: CallInput[] | boolean, arg2?: boolean): Promise<any[]> {
    return multiCall(this.provider, arg0, arg1, arg2);
  }

  public async getBalances(tokens: string[], account: string): Promise<TokenBalances> {
    return getBalances(this.provider, tokens, account);
  }

  public async getBalancesAndAllowances(
    tokens: string[],
    owner: string,
    spender: string
  ): Promise<TokenBalancesAndAllowances> {
    return getBalancesAndAllowances(this.provider, tokens, owner, spender);
  }

  public async getReserves(pairs: string[]): Promise<UniswapReservesData> {
    return getReserves(this.provider, pairs);
  }
}