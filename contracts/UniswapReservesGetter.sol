// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


interface IUniswapV2Pair {
  function getReserves() external view returns (uint112, uint112, uint32);
}


contract UniswapReservesGetter {
  constructor(address[] memory pairs) public {
    uint256 len = pairs.length;

    bytes32[] memory returnDatas = new bytes32[](len);

    for (uint256 i = 0; i < len; i++) {
      address pair = pairs[i];
      (uint256 r0, uint256 r1, uint256 bt) = IUniswapV2Pair(pair).getReserves();
      returnDatas[i] = bytes32(r0 << 144 | r1 << 32 | bt);
    }
    bytes memory data = abi.encode(block.number, returnDatas);
    assembly { return(add(data, 32), data) }
  }
}