import { Provider, Web3Provider } from '@ethersproject/providers';
import { JsonFragment } from "@ethersproject/abi";
import { Interface } from "ethers/lib/utils";

export function toProvider(provider: any): Provider {
  if (Object.keys(provider).includes('currentProvider')) {
    return new Web3Provider(provider.currentProvider);
  } else {
    return provider;
  }
}

export function isJsonFragmentArray(input: any): input is JsonFragment[] {
  if (!Array.isArray(input)) return false;
  const inputKeys = Object.keys(input[0]);
  if (!inputKeys.includes('target') && !inputKeys.includes('function')) return true;
  return false;
}

export function isInterface(input: any): input is Interface {
  return input._isInterface;
}