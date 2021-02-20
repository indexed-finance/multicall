// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


interface IERC20 {
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);
}


contract MultiTokenBalanceAndAllowanceGetter {
  constructor(address[] memory tokens, address src, address dst) public {
    uint256 len = tokens.length;

    uint256[2][] memory returnDatas = new uint256[2][](len);

    for (uint256 i = 0; i < len; i++) {
      address token = tokens[i];
      uint256[2] memory values;
      if (token == address(0)) {
        values[0] = src.balance;
        values[1] = 0;
      } else {
        values[0] = IERC20(token).balanceOf(src);
        values[1] = IERC20(token).allowance(src, dst);
      }
      returnDatas[i] = values;
    }
    bytes memory data = abi.encode(block.number, returnDatas);
    assembly { return(add(data, 32), data) }
  }
}