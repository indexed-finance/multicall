import { JsonFragment } from "@ethersproject/abi";
import { defaultAbiCoder, Interface } from "ethers/lib/utils";

import { CallInput } from './types';
import { MultiCall as bytecode, MultiCallStrict as bytecodeStrict } from "./bytecode.json";
import { isInterface, isJsonFragmentArray, toProvider } from './utils';

export async function multiCall(
  provider_: any,
  arg0: Interface | JsonFragment[] | CallInput[],
  arg1?: CallInput[] | boolean,
  arg2?: boolean
): Promise<[number, any[]]> {
  const provider = toProvider(provider_);
  let inputs: CallInput[] = [];
  let strict: boolean | undefined;
  if (isInterface(arg0) || isJsonFragmentArray(arg0)) {
    if (!Array.isArray(arg1)) {
      throw new Error(`Second parameter must be array of call inputs if first is interface.`);
    }
    inputs = arg1;

    for (let input of inputs) {
      if (!input.interface) input.interface = arg0;
    }
    strict = arg2;
  } else {
    inputs = arg0;
    strict = arg1 as boolean;
  }
  const targets: string[] = [];
  const datas: string[] = [];
  const interfaces: Interface[] = [];
  for (let input of inputs) {
    let _interface: Interface;
    if (!input.interface) {
      throw new Error(`Call input must include interface.`);
    }
    if (isInterface(input.interface)) {
      _interface = input.interface;
    } else {
      _interface = new Interface(input.interface);
    }
    interfaces.push(_interface);
    const calldata = _interface.encodeFunctionData(input.function, input.args);
    datas.push(calldata);
    targets.push(input.target);
  }
  const inputData = defaultAbiCoder.encode(['address[]', 'bytes[]'], [targets, datas]);
  const fulldata = (strict ? bytecodeStrict : bytecode).concat(inputData.slice(2));
  const encodedReturnData = await provider.call({ data: fulldata });
  const [blockNumber, returndatas] = defaultAbiCoder.decode(['uint256','bytes[]'], encodedReturnData);
  const results: any[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const returndata = returndatas[i];
    let result: any;
    if (!strict && returndata == '0x') {
      result = null;
    } else {
      result = interfaces[i].decodeFunctionResult(inputs[i].function, returndata);
      if (Array.isArray(result) && result.length == 1) {
        result = result[0];
      }
    }
    results.push(result);
  }
  return [blockNumber.toNumber(), results];
}