import { JsonFragment } from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";
import { defaultAbiCoder, Interface } from "ethers/lib/utils";

const { bytecode } = require("../artifacts/contracts/MultiCall.sol/MultiCall.json");

export type CallInput = {
  target: string;
  interface: Interface | JsonFragment[];
  function: string;
  args: Array<any> | undefined;
}

export class MultiCall {
  constructor(private provider: Provider) {}

  public async multiCall(inputs: CallInput[]): Promise<any[]> {
    const targets: string[] = [];
    const datas: string[] = [];
    const interfaces: Interface[] = [];
    for (let input of inputs) {
      let _interface: Interface;
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
    const fulldata = bytecode.concat(inputData.slice(2));
    const encodedReturnData = await this.provider.call({ data: fulldata });
    const returndatas = defaultAbiCoder.decode(['bytes[]'], encodedReturnData)[0];
    const results: any[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const returndata = returndatas[i];
      const result = interfaces[i].decodeFunctionResult(inputs[i].function, returndata)[0];
      results.push(result);
    }
    return results;
  }
}