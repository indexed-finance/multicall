// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


interface IERC20 {
  function balanceOf(address) external view returns (uint256);
}


contract MultiTokenBalanceGetter {
  constructor(address[] memory tokens, address account) public {
    uint256 len = tokens.length;

    uint256[] memory returnDatas = new uint256[](len);

    for (uint256 i = 0; i < len; i++) {
      address token = tokens[i];
      if (token == address(0)) {
        returnDatas[i] = account.balance;
      } else {
        returnDatas[i] = IERC20(token).balanceOf(account);
      }
    }
    bytes memory data = abi.encode(block.number, returnDatas);
    assembly { return(add(data, 32), data) }
  }
}