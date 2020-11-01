import { JsonFragment } from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";
import { defaultAbiCoder, Interface } from "ethers/lib/utils";

import { bytecode } from "./MultiCall.json";
import { bytecode as bytecodeStrict } from "./MultiCallStrict.json";

export type CallInput = {
  target: string;
  interface?: Interface | JsonFragment[];
  function: string;
  args?: Array<any>;
}

function isJsonFragmentArray(input: any): input is JsonFragment[] {
  if (!Array.isArray(input)) return false;
  const inputKeys = Object.keys(input[0]);
  if (!inputKeys.includes('target') && !inputKeys.includes('function')) return true;
  return false;
}

export class MultiCall {
  constructor(private provider: Provider) {}

  public async multiCall(_interface: Interface | JsonFragment[], inputs: CallInput[], strict?: boolean): Promise<any[]>;
  public async multiCall(inputs: CallInput[], strict?: boolean): Promise<any[]>;
  public async multiCall(arg0: Interface | JsonFragment[] | CallInput[], arg1?: CallInput[] | boolean, arg2?: boolean) {
    let inputs: CallInput[] = [];
    let strict: boolean | undefined;
    if (arg0 instanceof Interface || isJsonFragmentArray(arg0)) {
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
      if (input.interface instanceof Interface) {
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
    const encodedReturnData = await this.provider.call({ data: fulldata });
    const returndatas = defaultAbiCoder.decode(['bytes[]'], encodedReturnData)[0];
    const results: any[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const returndata = returndatas[i];
      let result: any;
      if (!strict && returndata == '0x') {
        result = null;
      } else {
        result = interfaces[i].decodeFunctionResult(inputs[i].function, returndata)[0];
      }
      results.push(result);
    }
    return results;
  }
}

export default MultiCall;