// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


contract MultiCallStrict {
  constructor(
    address[] memory targets,
    bytes[] memory datas
  ) public {
    uint256 len = targets.length;
    require(datas.length == len, "Error: Array lengths do not match.");

    bytes[] memory returnDatas = new bytes[](len);

    for (uint256 i = 0; i < len; i++) {
      address target = targets[i];
      bytes memory data = datas[i];
      (bool success, bytes memory returnData) = target.call(data);
      require(success, string(returnData));
      returnDatas[i] = returnData;
    }
    bytes memory data = abi.encode(block.number, returnDatas);
    assembly { return(add(data, 32), mload(data)) }
  }
}